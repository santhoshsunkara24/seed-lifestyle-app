import React, { useState } from 'react';
import { Save, Loader, Layers } from 'lucide-react';
import { useData } from '../context/DataContext';
import SuccessScreen from '../components/SuccessScreen';
import { formatDate } from '../utils/formatDate';

const StockEntry = () => {
    const { addStock } = useData();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        supplier_name: '',
        seed_name: '',
        lot_no: '',
        arrival_date: new Date().toISOString().split('T')[0],
        total_packets_initial: '',
        cost_per_packet: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleReset = () => {
        setFormData({
            supplier_name: '',
            seed_name: '',
            lot_no: '',
            arrival_date: new Date().toISOString().split('T')[0],
            total_packets_initial: '',
            cost_per_packet: ''
        });
        setShowSuccess(false);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.supplier_name.trim()) newErrors.supplier_name = 'Please fill out this field';
        if (!formData.seed_name.trim()) newErrors.seed_name = 'Please fill out this field';
        if (!formData.lot_no.trim()) newErrors.lot_no = 'Please fill out this field';
        if (!formData.total_packets_initial) newErrors.total_packets_initial = 'Please fill out this field';
        if (!formData.cost_per_packet) newErrors.cost_per_packet = 'Please fill out this field';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            await addStock({
                ...formData,
                total_packets_initial: parseInt(formData.total_packets_initial),
                cost_per_packet: parseFloat(formData.cost_per_packet)
            });
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
            alert('Failed to save stock');
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center">
                <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl">
                    <SuccessScreen
                        title="Stock Entry Added!"
                        message={`Logged ${formData.total_packets_initial} packets of ${formData.seed_name} from ${formData.supplier_name} on ${formatDate(formData.arrival_date)}.`}
                        onReset={handleReset}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="bg-emerald-100 p-2.5 rounded-xl">
                    <Layers className="h-6 w-6 text-emerald-600" fill="currentColor" strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">New Stock Entry</h2>
                    <p className="text-sm text-gray-500 font-medium">Record incoming inventory from suppliers.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Supplier Name</label>
                        <input
                            type="text"
                            name="supplier_name"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 text-sm ${errors.supplier_name ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.supplier_name}
                            onChange={handleChange}
                            placeholder="e.g. Denova"
                        />
                        {errors.supplier_name && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.supplier_name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Seed Name</label>
                        <input
                            type="text"
                            name="seed_name"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 text-sm ${errors.seed_name ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.seed_name}
                            onChange={handleChange}
                            placeholder="e.g. Tomato Hybrid"
                        />
                        {errors.seed_name && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.seed_name}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Lot Number</label>
                    <input
                        type="text"
                        name="lot_no"
                        className={`w-full px-5 py-3 bg-white border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 text-sm ${errors.lot_no ? 'border-rose-300' : 'border-gray-200'}`}
                        value={formData.lot_no}
                        onChange={handleChange}
                        placeholder="Batch ID"
                    />
                    {errors.lot_no && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.lot_no}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Total Packets</label>
                        <input
                            type="number"
                            name="total_packets_initial"
                            min="1"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 text-sm ${errors.total_packets_initial ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.total_packets_initial}
                            onChange={handleChange}
                        />
                        {errors.total_packets_initial && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.total_packets_initial}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Cost / Packet (₹)</label>
                        <input
                            type="number"
                            name="cost_per_packet"
                            min="0"
                            step="0.01"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 text-sm ${errors.cost_per_packet ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.cost_per_packet}
                            onChange={handleChange}
                        />
                        {errors.cost_per_packet && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.cost_per_packet}</p>}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-70"
                    >
                        {loading ? <Loader className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                        Save Stock Entry
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StockEntry;
