import express from 'express';
import { getMaintenanceLogs, createMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog } from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getMaintenanceLogs)
    .post(authorize('Manager'), createMaintenanceLog);

router.route('/:id')
    .put(authorize('Manager'), updateMaintenanceLog)
    .delete(authorize('Manager'), deleteMaintenanceLog);

export default router;
