import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: '', model: '', category: 'Van', licensePlate: '', maxCapacity: '', odometer: '' });

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`http://localhost:5000/api/vehicles/${editId}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/vehicles', formData);
            }
            closeModal();
            fetchVehicles();
        } catch (error) {
            alert(error.response?.data?.message || `Error ${isEdit ? 'updating' : 'adding'} vehicle`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/vehicles/${id}`);
            fetchVehicles();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting vehicle');
        }
    };

    const handleEdit = (vehicle) => {
        setIsEdit(true);
        setEditId(vehicle._id);
        setFormData({
            name: vehicle.name,
            model: vehicle.model,
            category: vehicle.category || 'Van',
            licensePlate: vehicle.licensePlate,
            maxCapacity: vehicle.maxCapacity,
            odometer: vehicle.odometer
        });
        setIsAddOpen(true);
    };

    const closeModal = () => {
        setIsAddOpen(false);
        setIsEdit(false);
        setEditId(null);
        setFormData({ name: '', model: '', category: 'Van', licensePlate: '', maxCapacity: '', odometer: '' });
    };

    const fetchVehicles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/vehicles');
            setVehicles(res.data);
        } catch (error) {
            console.error('Error fetching vehicles', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-800';
            case 'On Trip': return 'bg-blue-100 text-blue-800';
            case 'In Shop': return 'bg-red-100 text-red-800';
            case 'Out of Service': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div>Loading vehicles...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center bg-white/40 p-4 rounded-xl backdrop-blur-sm border border-white/50 shadow-sm">
                <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight drop-shadow-sm">Vehicle Registry</h1>
                {(user?.role === 'Manager' || user?.role === 'Dispatcher') && (
                    <button onClick={() => { closeModal(); setIsAddOpen(true); }} className="premium-btn px-4 py-2 rounded-lg flex items-center shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> Add Vehicle
                    </button>
                )}
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200/50">
                        <thead className="bg-slate-50/50 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Plate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Model</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odometer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                {user?.role === 'Manager' && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {vehicles.map((vehicle) => (
                                <tr key={vehicle._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.licensePlate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="font-medium text-gray-900">{vehicle.name}</div>
                                        <div className="text-gray-400">{vehicle.model}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">[{vehicle.category || 'Van'}]</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.maxCapacity} kg</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.odometer} km</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                                            {vehicle.status}
                                        </span>
                                    </td>
                                    {user?.role === 'Manager' && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEdit(vehicle)} className="text-blue-600 hover:text-blue-900 mx-2"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(vehicle._id)} className="text-red-600 hover:text-red-900 mx-2"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {vehicles.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No vehicles found. Add one to get started.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700">Name</label><input required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Ford Transit" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Model</label><input required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. 2023 250 Cargo" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} /></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="Van">Van</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Heavy Truck">Heavy Truck</option>
                                </select>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700">License Plate</label><input required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="XYZ-1234" value={formData.licensePlate} onChange={e => setFormData({ ...formData, licensePlate: e.target.value })} /></div>

                            <div><label className="block text-sm font-medium text-gray-700">Max Capacity (kg)</label><input type="number" required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="500" value={formData.maxCapacity} onChange={e => setFormData({ ...formData, maxCapacity: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium text-gray-700">Initial Odometer (km)</label><input type="number" required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0" value={formData.odometer} onChange={e => setFormData({ ...formData, odometer: e.target.value })} /></div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{isEdit ? 'Update Vehicle' : 'Save Vehicle'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;
