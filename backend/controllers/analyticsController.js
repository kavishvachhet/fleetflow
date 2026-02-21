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

        const totalFuelCost = expenses.reduce((acc, exp) => acc + exp.cost, 0);
        const totalMaintenanceCost = maintenance.reduce((acc, log) => acc + log.cost, 0);

        // Estimate total fleet distance from current odometers (simplification)
        const totalDistance = vehicles.reduce((acc, v) => acc + v.odometer, 0);
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

        const monthlyData = {};
        expensesAggr.forEach(e => { monthlyData[e._id] = (monthlyData[e._id] || 0) + e.cost; });
        maintenanceAggr.forEach(m => { monthlyData[m._id] = (monthlyData[m._id] || 0) + m.cost; });

        const roiData = Object.keys(monthlyData).sort().map(month => ({
            month,
            cost: monthlyData[month],
            revenue: monthlyData[month] * 1.5 // Mock revenue based on cost, as revenue isn't tracked in schema
        }));

        // Calculate Average Vehicle ROI dynamically
        // Since revenue is inferred as roughly 1.5x cost in this simplified schema:
        // Total Estimated Revenue = (Total Fuel + Total Maintenance) * 1.5
        // ROI = (Net Profit / Total Investment) * 100
        // Net Profit = Est Revenue - Total Ops Cost

        let avgRoi = 0;
        const totalOpsCost = totalFuelCost + totalMaintenanceCost;
        if (totalOpsCost > 0) {
            const estimatedRevenue = totalOpsCost * 1.5;
            const netProfit = estimatedRevenue - totalOpsCost;
            avgRoi = ((netProfit / totalOpsCost) * 100).toFixed(1);
        }

        res.json({
            totalFuelCost,
            totalMaintenanceCost,
            totalOperationalCost: totalOpsCost,
            costPerKm,
            avgRoi,
            roiData
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
