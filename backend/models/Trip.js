import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    cargoWeight: { type: Number, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    revenue: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        default: 'Dispatched'
    }
}, { timestamps: true });

export default mongoose.model('Trip', tripSchema);
