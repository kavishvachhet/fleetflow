import express from 'express';
import { getMaintenanceLogs, createMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog, completeMaintenanceLog } from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(authorize('Manager', 'Dispatcher', 'Financial Analyst'), getMaintenanceLogs)
    .post(authorize('Manager', 'Dispatcher'), createMaintenanceLog);

router.route('/:id')
    .put(authorize('Manager', 'Dispatcher'), updateMaintenanceLog)
    .delete(authorize('Manager', 'Dispatcher'), deleteMaintenanceLog);

router.post('/:id/complete', authorize('Manager', 'Dispatcher'), completeMaintenanceLog);

export default router;
