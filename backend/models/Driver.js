import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    licenseCategory: { type: String, required: true, enum: ['Van', 'Truck', 'Heavy Truck'], default: 'Van' },
    licenseExpiryDate: { type: Date, required: true },
    safetyScore: { type: Number, default: 100 },
    totalTrips: { type: Number, default: 0 },
    completedTrips: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['On Duty', 'Off Duty', 'On Trip', 'Suspended'],
        default: 'On Duty'
    },
    performanceScore: { type: Number, default: 100 }
}, { timestamps: true });

export default mongoose.model('Driver', driverSchema);
