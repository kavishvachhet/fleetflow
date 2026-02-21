import Driver from '../models/Driver.js';

export const getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const createDriver = async (req, res) => {
    try {
        const { name, licenseNumber, licenseCategory, licenseExpiryDate, status } = req.body;
        const driver = new Driver({ name, licenseNumber, licenseCategory, licenseExpiryDate, status });
        await driver.save();
        res.status(201).json(driver);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

export const updateDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const driver = await Driver.findByIdAndUpdate(id, req.body, { new: true });
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json(driver);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

export const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const driver = await Driver.findByIdAndDelete(id);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });
        res.json({ message: 'Driver removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
