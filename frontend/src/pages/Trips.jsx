import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, CheckCircle2 } from 'lucide-react';

const Trips = () => {
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '' });

    const fetchData = async () => {
        try {
            const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
                axios.get('http://localhost:5000/api/trips'),
                axios.get('http://localhost:5000/api/vehicles'),
                axios.get('http://localhost:5000/api/drivers')
            ]);
            setTrips(tripsRes.data);
            setVehicles(vehiclesRes.data.filter(v => v.status === 'Available'));
            setDrivers(driversRes.data.filter(d => d.status === 'On Duty'));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`http://localhost:5000/api/trips/${editId}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/trips', formData);
            }
            closeModal();
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || `Error ${isEdit ? 'updating' : 'dispatching'} trip`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this trip?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/trips/${id}`);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting trip');
        }
    };

    const handleEdit = (trip) => {
        setIsEdit(true);
        setEditId(trip._id);
        setFormData({
            vehicleId: trip.vehicleId?._id || '',
            driverId: trip.driverId?._id || '',
            cargoWeight: trip.cargoWeight,
            origin: trip.origin,
            destination: trip.destination
        });
        setIsAddOpen(true);
    };

    const closeModal = () => {
        setIsAddOpen(false);
        setIsEdit(false);
        setEditId(null);
        setFormData({ vehicleId: '', driverId: '', cargoWeight: '', origin: '', destination: '' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Dispatched': return 'bg-blue-100 text-blue-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Draft': return 'bg-gray-100 text-gray-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleComplete = async (tripId) => {
        try {
            const finalOdo = prompt("Enter final odometer reading for this vehicle:");
            if (!finalOdo) return;
            await axios.post(`http://localhost:5000/api/trips/${tripId}/complete`, { finalOdometer: Number(finalOdo) });
            fetchData(); // Refresh list
        } catch (error) {
            alert(error.response?.data?.message || 'Error completing trip');
        }
    };

    if (loading) return <div>Loading trips...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center bg-white/40 p-4 rounded-xl backdrop-blur-sm border border-white/50 shadow-sm">
                <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight drop-shadow-sm">Trip Dispatch Management</h1>
                {(user?.role === 'Manager' || user?.role === 'Dispatcher') && (
                    <button onClick={() => { closeModal(); setIsAddOpen(true); }} className="premium-btn px-4 py-2 rounded-lg flex items-center shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> Dispatch New Trip
                    </button>
                )}
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200/50">
                        <thead className="bg-slate-50/50 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo Weight</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {trips.map((trip) => (
                                <tr key={trip._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="font-semibold">{trip.origin}</div>
                                        <div className="text-gray-400 text-xs mt-1">to {trip.destination}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.vehicleId?.name || 'Unassigned'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.driverId?.name || 'Unassigned'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trip.cargoWeight} kg</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(trip.status)}`}>
                                            {trip.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-3">
                                            {trip.status === 'Dispatched' && (user?.role === 'Manager' || user?.role === 'Dispatcher') && (
                                                <button
                                                    onClick={() => handleComplete(trip._id)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Mark Complete"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            {user?.role === 'Manager' && (
                                                <>
                                                    <button onClick={() => handleEdit(trip)} className="text-blue-600 hover:text-blue-900" title="Edit Trip">Edit</button>
                                                    <button onClick={() => handleDelete(trip._id)} className="text-red-600 hover:text-red-900" title="Delete Trip">Delete</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {trips.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No active trips found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl my-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">{isEdit ? 'Edit Trip' : 'Dispatch New Trip'}</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Origin</label>
                                <input required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Destination</label>
                                <input required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vehicle (Available)</label>
                                <select required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" value={formData.vehicleId} onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}>
                                    <option value="">Select a vehicle</option>
                                    {vehicles.map(v => <option key={v._id} value={v._id}>[{v.category || 'Van'}] {v.name} ({v.licensePlate}) - Cap: {v.maxCapacity}kg</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Driver (On Duty)</label>
                                <select required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" value={formData.driverId} onChange={e => setFormData({ ...formData, driverId: e.target.value })}>
                                    <option value="">Select a driver</option>
                                    {drivers.map(d => <option key={d._id} value={d._id}>[{d.licenseCategory || 'Van'}] {d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cargo Weight (kg)</label>
                                <input type="number" required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" value={formData.cargoWeight} onChange={e => setFormData({ ...formData, cargoWeight: e.target.value })} />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{isEdit ? 'Update Trip' : 'Dispatch'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trips;
