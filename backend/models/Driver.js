import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    licenseValidUntil: { type: Date, required: true },
    licenseCategory: { type: String, required: true, enum: ['Van', 'Truck', 'Heavy Truck'], default: 'Van' },
    status: {
        type: String,
        enum: ['On Duty', 'Off Duty', 'Suspended', 'On Trip'],
        default: 'On Duty'
    },
    performanceScore: { type: Number, default: 100 }
}, { timestamps: true });

export default mongoose.model('Driver', driverSchema);
