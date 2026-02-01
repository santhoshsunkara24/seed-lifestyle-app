import React, { useState } from 'react';
import { Save, Loader, Layers } from 'lucide-react';
import { useData } from '../context/DataContext';
import SuccessScreen from '../components/SuccessScreen';
import { formatDate } from '../utils/formatDate';

const StockEntry = () => {
    const { addStock } = useData();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        supplier_name: '',
        seed_name: '',
        lot_no: '',
        arrival_date: new Date().toISOString().split('T')[0],
        total_packets_initial: '',
        cost_per_packet: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            addStock(formData);
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
            <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <SuccessScreen
                    title="Stock Entry Added!"
                    message={`Logged ${formData.total_packets_initial} packets of ${formData.seed_name} from ${formData.supplier_name} on ${formatDate(formData.arrival_date)}.`}
                    onReset={handleReset}
                />
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

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Supplier Name</label>
                        <input
                            type="text"
                            name="supplier_name"
                            required
                            className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium shadow-sm hover:shadow-md"
                            value={formData.supplier_name}
                            onChange={handleChange}
                            placeholder="e.g. Denova"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Seed Name</label>
                        <input
                            type="text"
                            name="seed_name"
                            required
                            className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium shadow-sm hover:shadow-md"
                            value={formData.seed_name}
                            onChange={handleChange}
                            placeholder="e.g. Tomato Hybrid"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Lot Number</label>
                    <input
                        type="text"
                        name="lot_no"
                        required
                        className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium shadow-sm hover:shadow-md"
                        value={formData.lot_no}
                        onChange={handleChange}
                        placeholder="Batch ID"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Total Packets</label>
                        <input
                            type="number"
                            name="total_packets_initial"
                            required
                            min="1"
                            className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium shadow-sm hover:shadow-md"
                            value={formData.total_packets_initial}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Cost / Packet (₹)</label>
                        <input
                            type="number"
                            name="cost_per_packet"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium shadow-sm hover:shadow-md"
                            value={formData.cost_per_packet}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-70 shadow-lg shadow-emerald-200"
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
