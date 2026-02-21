import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ name: '', licenseValidUntil: '', licenseCategory: 'Van', status: 'On Duty' });

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`http://localhost:5000/api/drivers/${editId}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/drivers', formData);
            }
            closeModal();
            fetchDrivers();
        } catch (error) {
            alert(error.response?.data?.message || `Error ${isEdit ? 'updating' : 'adding'} driver`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this driver?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/drivers/${id}`);
            fetchDrivers();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting driver');
        }
    };

    const handleEdit = (driver) => {
        setIsEdit(true);
        setEditId(driver._id);
        const date = new Date(driver.licenseValidUntil).toISOString().split('T')[0];
        setFormData({
            name: driver.name,
            licenseValidUntil: date,
            licenseCategory: driver.licenseCategory || 'Van',
            status: driver.status
        });
        setIsAddOpen(true);
    };

    const closeModal = () => {
        setIsAddOpen(false);
        setIsEdit(false);
        setEditId(null);
        setFormData({ name: '', licenseValidUntil: '', licenseCategory: 'Van', status: 'On Duty' });
    };

    const fetchDrivers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/drivers');
            setDrivers(res.data);
        } catch (error) {
            console.error('Error fetching drivers', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'On Duty': return 'bg-green-100 text-green-800';
            case 'On Trip': return 'bg-blue-100 text-blue-800';
            case 'Off Duty': return 'bg-gray-100 text-gray-800';
            case 'Suspended': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const isLicenseExpired = (dateString) => {
        return new Date(dateString) < new Date();
    };

    if (loading) return <div>Loading drivers...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center bg-white/40 p-4 rounded-xl backdrop-blur-sm border border-white/50 shadow-sm">
                <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight drop-shadow-sm">Driver Profiles</h1>
                {(user?.role === 'Manager' || user?.role === 'Safety Officer') && (
                    <button onClick={() => { closeModal(); setIsAddOpen(true); }} className="premium-btn px-4 py-2 rounded-lg flex items-center shadow-sm">
                        <Plus className="w-4 h-4 mr-2" /> Add Driver
                    </button>
                )}
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200/50">
                        <thead className="bg-slate-50/50 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Safety Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                {(user?.role === 'Manager' || user?.role === 'Safety Officer') && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {drivers.map((driver) => {
                                const expired = isLicenseExpired(driver.licenseValidUntil);
                                return (
                                    <tr key={driver._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">[{driver.licenseCategory || 'Van'}]</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                                                    <div className={`h-2.5 rounded-full ${driver.performanceScore >= 90 ? 'bg-green-500' : driver.performanceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${driver.performanceScore}%` }}></div>
                                                </div>
                                                {driver.performanceScore}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className={`flex items-center ${expired ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                                                {expired && <ShieldAlert className="w-4 h-4 mr-1" />}
                                                {new Date(driver.licenseValidUntil).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                                                {driver.status}
                                            </span>
                                        </td>
                                        {(user?.role === 'Manager' || user?.role === 'Safety Officer') && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEdit(driver)} className="text-blue-600 hover:text-blue-900 mx-2"><Edit2 className="w-4 h-4" /></button>
                                                {user?.role === 'Manager' && (
                                                    <button onClick={() => handleDelete(driver._id)} className="text-red-600 hover:text-red-900 mx-2"><Trash2 className="w-4 h-4" /></button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                            {drivers.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No drivers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">{isEdit ? 'Edit Driver' : 'Add New Driver'}</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700">Name</label><input required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Alex Johnson" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                            <div><label className="block text-sm font-medium text-gray-700">License Valid Until</label><input type="date" required className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" value={formData.licenseValidUntil} onChange={e => setFormData({ ...formData, licenseValidUntil: e.target.value })} /></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">License Category</label>
                                <select className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" value={formData.licenseCategory} onChange={e => setFormData({ ...formData, licenseCategory: e.target.value })}>
                                    <option value="Van">Van</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Heavy Truck">Heavy Truck</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Initial Status</label>
                                <select className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="On Duty">On Duty</option>
                                    <option value="Off Duty">Off Duty</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">{isEdit ? 'Update Driver' : 'Save Driver'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Drivers;
