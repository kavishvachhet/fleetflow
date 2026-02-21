import ExpenseLog from '../models/ExpenseLog.js';

export const getExpenseLogs = async (req, res) => {
    try {
        const logs = await ExpenseLog.find().populate('vehicleId').populate('tripId');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const createExpenseLog = async (req, res) => {
    try {
        const { tripId, vehicleId, liters, cost, date } = req.body;

        const log = new ExpenseLog({ tripId, vehicleId, liters, cost, date });
        await log.save();

        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

export const updateExpenseLog = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await ExpenseLog.findByIdAndUpdate(id, req.body, { new: true });
        if (!log) return res.status(404).json({ message: 'Log not found' });
        res.json(log);
    } catch (error) {
        res.status(400).json({ message: 'Bad Request', error: error.message });
    }
};

export const deleteExpenseLog = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await ExpenseLog.findByIdAndDelete(id);
        if (!log) return res.status(404).json({ message: 'Log not found' });
        res.json({ message: 'Log removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
