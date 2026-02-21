import express from 'express';
import { getDrivers, createDriver, updateDriver, deleteDriver } from '../controllers/driverController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getDrivers)
    .post(authorize('Manager', 'Safety Officer'), createDriver);

router.route('/:id')
    .put(authorize('Manager', 'Safety Officer'), updateDriver)
    .delete(authorize('Manager'), deleteDriver);

export default router;
