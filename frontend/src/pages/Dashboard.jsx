import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Truck, AlertTriangle, Activity, Package } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import AnimatedOdometer from '../components/AnimatedOdometer';
import SafetyDashboard from '../components/SafetyDashboard';

const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass, label = "" }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="glass-panel p-6 flex items-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group"
    >
        <div className={`p-4 rounded-xl ${colorClass} bg-gradient-to-br ${gradientClass} mr-6 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">{title}</p>
            <div className="scale-75 origin-left">
                <AnimatedOdometer value={value} label={label} padCount={3} />
            </div>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeVehicles: 0,
        inShopVehicles: 0,
        pendingTrips: 0,
        utilizationRate: 0
    });
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/dashboard`);
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    const healthData = stats.healthData || [];
    const tripsData = stats.tripsData || [];

    if (user?.role === 'Safety Officer') {
        return <SafetyDashboard />;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">Fleet Overview</h1>
                <div className="flex space-x-2">
                    {/* Filters placeholder */}
                    <select className="bg-white border text-sm border-gray-300 rounded-md px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500">
                        <option>All Vehicle Types</option>
                        <option>Trucks</option>
                        <option>Vans</option>
                    </select>
                    <select className="bg-white border text-sm border-gray-300 rounded-md px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500">
                        <option>All Regions</option>
                        <option>North</option>
                        <option>South</option>
                    </select>
                </div>
            </div>

            <motion.div
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
            >
                <StatCard
                    title="Active Fleet"
                    value={stats.activeVehicles}
                    icon={Truck}
                    colorClass="text-white backdrop-blur-md"
                    gradientClass="from-blue-500 to-indigo-600 shadow-blue-500/50"
                    label="Vans"
                />
                <StatCard
                    title="In Shop"
                    value={stats.inShopVehicles}
                    icon={AlertTriangle}
                    colorClass="text-white backdrop-blur-md"
                    gradientClass="from-red-500 to-rose-600 shadow-red-500/50"
                    label="Units"
                />
                <StatCard
                    title="Utilization"
                    value={stats.utilizationRate}
                    icon={Activity}
                    colorClass="text-white backdrop-blur-md"
                    gradientClass="from-emerald-400 to-green-600 shadow-green-500/50"
                    label="%"
                />
                <StatCard
                    title="Pending Trips"
                    value={stats.pendingTrips}
                    icon={Package}
                    colorClass="text-white backdrop-blur-md"
                    gradientClass="from-amber-400 to-orange-500 shadow-orange-500/50"
                    label="Active"
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="glass-panel p-6 h-96 flex flex-col">
                    <p className="text-slate-800 font-bold font-heading text-lg mb-6 flex items-center">
                        <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                        Recent Trips Matrix
                    </p>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={tripsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed Trips" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="cancelled" stackId="a" fill="#EF4444" name="Cancelled Trips" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="glass-panel p-6 h-96 flex flex-col">
                    <p className="text-slate-800 font-bold font-heading text-lg mb-6 flex items-center">
                        <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></span>
                        Vehicle Health Overview
                    </p>
                    <ResponsiveContainer width="100%" height="85%">
                        <AreaChart data={healthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="active" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" name="Active Vehicles" />
                            <Area type="monotone" dataKey="inShop" stroke="#EF4444" strokeWidth={2} fillOpacity={0.1} fill="#EF4444" name="In Shop" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
