import express from 'express';
import { getExpenseLogs, createExpenseLog, updateExpenseLog, deleteExpenseLog } from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getExpenseLogs)
    .post(authorize('Manager', 'Dispatcher', 'Financial Analyst'), createExpenseLog);

router.route('/:id')
    .put(authorize('Manager', 'Financial Analyst'), updateExpenseLog)
    .delete(authorize('Manager'), deleteExpenseLog);

export default router;
