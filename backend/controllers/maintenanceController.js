import MaintenanceLog from '../models/MaintenanceLog.js';
import Vehicle from '../models/Vehicle.js';

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
