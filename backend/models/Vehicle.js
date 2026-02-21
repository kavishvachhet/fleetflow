import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    model: { type: String, required: true },
    category: { type: String, required: true, enum: ['Van', 'Truck', 'Heavy Truck'], default: 'Van' },
    licensePlate: { type: String, required: true, unique: true },
    maxCapacity: { type: Number, required: true },
    odometer: { type: Number, required: true },
    acquisitionCost: { type: Number, required: true, default: 0 },
    status: {
        type: String,
        enum: ['Available', 'On Trip', 'In Shop', 'Out of Service'],
        default: 'Available'
    }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
