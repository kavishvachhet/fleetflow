import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import MaintenanceLog from '../models/MaintenanceLog.js';
import ExpenseLog from '../models/ExpenseLog.js';
import mongoose from 'mongoose';

export const getDashboardStats = async (req, res) => {
    try {
        const totalVehicles = await Vehicle.countDocuments();
        const activeVehicles = await Vehicle.countDocuments({ status: 'On Trip' });
        const inShopVehicles = await Vehicle.countDocuments({ status: 'In Shop' });
        const pendingTrips = await Trip.countDocuments({ status: 'Draft' });

        // Calculate trips data for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const tripsAggr = await Trip.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const tripsData = tripsAggr.map(item => ({
            name: item._id,
            completed: item.completed,
            cancelled: item.cancelled
        }));

        res.json({
            totalVehicles,
            activeVehicles,
            inShopVehicles,
            pendingTrips,
            utilizationRate: totalVehicles > 0 ? ((activeVehicles / totalVehicles) * 100).toFixed(2) : 0,
            tripsData,
            healthData: [
                { name: 'Current', active: activeVehicles, inShop: inShopVehicles }
            ]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getFinancialReports = async (req, res) => {
    try {
        const expenses = await ExpenseLog.find();
        const maintenance = await MaintenanceLog.find();
        const vehicles = await Vehicle.find();

        const trips = await Trip.find();
        const totalRevenue = trips.reduce((acc, trip) => acc + (trip.revenue || 0), 0);

        const totalFuelCost = expenses.reduce((acc, exp) => acc + exp.cost, 0);
        const totalLiters = expenses.reduce((acc, exp) => acc + (exp.liters || 0), 0);
        const totalMaintenanceCost = maintenance.reduce((acc, log) => acc + log.cost, 0);

        // Estimate total fleet distance from current odometers (simplification)
        const totalDistance = vehicles.reduce((acc, v) => acc + (v.odometer || 0), 0);
        const fuelEfficiency = totalLiters > 0 ? (totalDistance / totalLiters).toFixed(2) : 0;
        const totalAcquisitionCost = vehicles.reduce((acc, v) => acc + (v.acquisitionCost || 0), 0);
        const costPerKm = totalDistance > 0 ? (totalFuelCost / totalDistance).toFixed(2) : 0;

        // ROI Data: Revenue vs Cost Monthly
        // We lack real 'revenue', so we represent Cost over the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const expensesAggr = await ExpenseLog.aggregate([
            { $match: { date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    cost: { $sum: "$cost" }
                }
            }
        ]);

        const maintenanceAggr = await MaintenanceLog.aggregate([
            { $match: { date: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    cost: { $sum: "$cost" }
                }
            }
        ]);

        const tripsAggr = await Trip.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    revenue: { $sum: "$revenue" }
                }
            }
        ]);

        const monthlyData = {};
        expensesAggr.forEach(e => { monthlyData[e._id] = { ...monthlyData[e._id], cost: (monthlyData[e._id]?.cost || 0) + e.cost }; });
        maintenanceAggr.forEach(m => { monthlyData[m._id] = { ...monthlyData[m._id], cost: (monthlyData[m._id]?.cost || 0) + m.cost }; });
        tripsAggr.forEach(t => { monthlyData[t._id] = { ...monthlyData[t._id], revenue: (monthlyData[t._id]?.revenue || 0) + t.revenue }; });

        const roiData = Object.keys(monthlyData).sort().map(month => ({
            month,
            cost: monthlyData[month].cost || 0,
            revenue: monthlyData[month].revenue || 0
        }));

        const totalOpsCost = totalFuelCost + totalMaintenanceCost;
        let vehicleRoi = 0;
        if (totalAcquisitionCost > 0) {
            vehicleRoi = (((totalRevenue - totalOpsCost) / totalAcquisitionCost) * 100).toFixed(2);
        }

        res.json({
            totalFuelCost,
            totalMaintenanceCost,
            totalOperationalCost: totalOpsCost,
            costPerKm,
            fuelEfficiency,
            avgRoi: vehicleRoi,
            roiData
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
