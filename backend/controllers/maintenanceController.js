import MaintenanceLog from '../models/MaintenanceLog.js';
import Vehicle from '../models/Vehicle.js';
import ExpenseLog from '../models/ExpenseLog.js';

export const getMaintenanceLogs = async (req, res) => {
    try {
        const logs = await MaintenanceLog.find().populate('vehicleId');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const createMaintenanceLog = async (req, res) => {
    try {
        const { vehicleId, description, cost, date } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        const log = new MaintenanceLog({ vehicleId, description, cost, date });
        await log.save();

        // Auto-Logic: Status -> In Shop
        vehicle.status = 'In Shop';
        await vehicle.save();

        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

export const updateMaintenanceLog = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await MaintenanceLog.findByIdAndUpdate(id, req.body, { new: true });
        if (!log) return res.status(404).json({ message: 'Log not found' });
        res.json(log);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

export const deleteMaintenanceLog = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await MaintenanceLog.findByIdAndDelete(id);
        if (!log) return res.status(404).json({ message: 'Log not found' });
        res.json({ message: 'Log removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const completeMaintenanceLog = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await MaintenanceLog.findById(id);
        if (!log) return res.status(404).json({ message: 'Maintenance log not found' });

        // Update Vehicle Status
        const vehicle = await Vehicle.findById(log.vehicleId);
        if (vehicle) {
            vehicle.status = 'Available';
            await vehicle.save();
        }

        // Create an Expense Log for this maintenance
        const expense = new ExpenseLog({
            vehicleId: log.vehicleId,
            liters: 0,
            cost: log.cost,
            date: new Date()
        });
        await expense.save();

        // Delete the original maintenance log
        await MaintenanceLog.findByIdAndDelete(id);

        res.json({ message: 'Maintenance completed. Vehicle is now Available and Expense logged.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
