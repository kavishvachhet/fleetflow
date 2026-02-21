import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';

export const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find().populate('vehicleId').populate('driverId');
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const createTrip = async (req, res) => {
    try {
        const { vehicleId, driverId, cargoWeight, origin, destination, revenue } = req.body;

        // Validation
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
        if (vehicle.status !== 'Available') return res.status(400).json({ message: 'Vehicle is not available' });
        if (cargoWeight > vehicle.maxCapacity) return res.status(400).json({ message: 'Cargo weight exceeds vehicle capacity' });

        const driver = await Driver.findById(driverId);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        if (driver.status !== 'On Duty') return res.status(400).json({ message: 'Driver is not on duty' });
        if (new Date(driver.licenseExpiryDate) < new Date()) return res.status(400).json({ message: 'Driver license expired' });

        // Category compliance check
        if (vehicle.category !== driver.licenseCategory) {
            return res.status(400).json({ message: `Driver license category (${driver.licenseCategory}) does not match vehicle category (${vehicle.category})` });
        }

        const trip = new Trip({ vehicleId, driverId, cargoWeight, origin, destination, revenue: revenue || 0, status: 'Dispatched' });
        await trip.save();

        // Update statuses
        vehicle.status = 'On Trip';
        await vehicle.save();
        driver.status = 'On Trip';
        driver.totalTrips = (driver.totalTrips || 0) + 1;
        await driver.save();

        res.status(201).json(trip);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

export const completeTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { finalOdometer } = req.body;

        const trip = await Trip.findById(id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (trip.status !== 'Dispatched') return res.status(400).json({ message: 'Trip is not currently dispatched' });

        trip.status = 'Completed';
        await trip.save();

        // Update statuses
        const vehicle = await Vehicle.findById(trip.vehicleId);
        if (vehicle) {
            if (finalOdometer) {
                if (finalOdometer < vehicle.odometer) {
                    return res.status(400).json({ message: 'Final odometer cannot be less than current odometer' });
                }
                vehicle.odometer = finalOdometer;
            }
            vehicle.status = 'Available';
            await vehicle.save();
        }

        const driver = await Driver.findById(trip.driverId);
        if (driver) {
            driver.status = 'On Duty';
            driver.completedTrips = (driver.completedTrips || 0) + 1;
            await driver.save();
        }

        res.json({ message: 'Trip completed successfully', trip });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const currentTrip = await Trip.findById(id);
        if (!currentTrip) return res.status(404).json({ message: 'Trip not found' });

        const { vehicleId, driverId, cargoWeight, origin, destination, status, revenue } = req.body;

        // If vehicle changed, release old, claim new
        if (vehicleId && vehicleId !== currentTrip.vehicleId.toString()) {
            const oldVehicle = await Vehicle.findById(currentTrip.vehicleId);
            if (oldVehicle) {
                oldVehicle.status = 'Available';
                await oldVehicle.save();
            }
            const newVehicle = await Vehicle.findById(vehicleId);
            if (newVehicle) {
                newVehicle.status = 'On Trip';
                await newVehicle.save();
            }
        }

        // If driver changed, release old, claim new
        if (driverId && driverId !== currentTrip.driverId.toString()) {
            const oldDriver = await Driver.findById(currentTrip.driverId);
            if (oldDriver) {
                oldDriver.status = 'On Duty';
                await oldDriver.save();
            }
            const newDriver = await Driver.findById(driverId);
            if (newDriver) {
                newDriver.status = 'On Trip';
                await newDriver.save();
            }
        }

        // Handle Cancellation penalty
        if (status === 'Cancelled' && currentTrip.status !== 'Cancelled') {
            const driverItem = await Driver.findById(currentTrip.driverId);
            if (driverItem) {
                driverItem.status = 'On Duty';
                driverItem.safetyScore = Math.max(0, (driverItem.safetyScore || 100) - 5); // 5 point penalty
                await driverItem.save();
            }
            const vehicleItem = await Vehicle.findById(currentTrip.vehicleId);
            if (vehicleItem) {
                vehicleItem.status = 'Available';
                await vehicleItem.save();
            }
        }

        const trip = await Trip.findByIdAndUpdate(id, req.body, { new: true });
        res.json(trip);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

export const deleteTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await Trip.findById(id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        // If trip was Dispatched, release the vehicle and driver
        if (trip.status === 'Dispatched') {
            const vehicle = await Vehicle.findById(trip.vehicleId);
            if (vehicle) {
                vehicle.status = 'Available';
                await vehicle.save();
            }

            const driver = await Driver.findById(trip.driverId);
            if (driver) {
                driver.status = 'On Duty';
                await driver.save();
            }
        }

        await Trip.findByIdAndDelete(id);
        res.json({ message: 'Trip removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
