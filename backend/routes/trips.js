import express from 'express';
import { getTrips, createTrip, completeTrip, updateTrip, deleteTrip } from '../controllers/tripController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getTrips)
    .post(authorize('Manager', 'Dispatcher'), createTrip);

router.route('/:id/complete')
    .post(authorize('Manager', 'Dispatcher'), completeTrip);

router.route('/:id')
    .put(authorize('Manager', 'Dispatcher'), updateTrip)
    .delete(authorize('Manager'), deleteTrip);

export default router;
