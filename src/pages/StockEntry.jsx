import React, { useState } from 'react';
import { Save, Loader, Layers } from 'lucide-react';
import { useData } from '../context/DataContext';
import SuccessScreen from '../components/SuccessScreen';
import { formatDate } from '../utils/formatDate';
import { useLanguage } from '../context/LanguageContext';
import DatePicker from '../components/ui/DatePicker';
import { calculateTotalWeight } from '../utils/weightCalculator';

const StockEntry = () => {
    const { addStock } = useData();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { t } = useLanguage();
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        supplier_name: '',
        seed_name: '',
        lot_no: '',
        arrival_date: new Date().toISOString().split('T')[0],
        total_packets_initial: '',
        cost_per_packet: '',
        weight_per_packet: '',
        expiry_date: ''
    });

    const totalWeight = calculateTotalWeight(formData.weight_per_packet, formData.total_packets_initial);
    const totalStockValue = (parseInt(formData.total_packets_initial) || 0) * (parseFloat(formData.cost_per_packet) || 0);

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
            cost_per_packet: '',
            weight_per_packet: '',
            expiry_date: ''
        });
        setShowSuccess(false);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.supplier_name.trim()) newErrors.supplier_name = 'Please fill out this field';
        if (!formData.seed_name.trim()) newErrors.seed_name = 'Please fill out this field';
        if (!formData.lot_no.trim()) newErrors.lot_no = 'Please fill out this field';
        if (!formData.arrival_date) newErrors.arrival_date = 'Please fill out this field';
        if (!formData.total_packets_initial) newErrors.total_packets_initial = 'Please fill out this field';
        if (!formData.cost_per_packet) newErrors.cost_per_packet = 'Please fill out this field';
        if (!formData.weight_per_packet.trim()) newErrors.weight_per_packet = 'Please fill out this field';
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
                cost_per_packet: parseFloat(formData.cost_per_packet),
                weight_per_packet: formData.weight_per_packet
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
                <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-200 overflow-hidden">
                    <SuccessScreen
                        title={t('stockEntryAdded')}
                        message={`${t('seed')}: ${formData.seed_name}. ${t('supplier')}: ${formData.supplier_name}. ${t('quantity')}: ${formData.total_packets_initial} ${t('packets')}.`}
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
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t('newStockEntry')}</h2>
                    <p className="text-sm text-gray-500 font-medium">{t('recordIncomingInventory')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('supplierName')}</label>
                        <input
                            type="text"
                            name="supplier_name"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:border-emerald-500 outline-none transition-all font-semibold text-gray-900 text-sm ${errors.supplier_name ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.supplier_name}
                            onChange={handleChange}
                            placeholder="e.g. Denova"
                        />
                        {errors.supplier_name && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.supplier_name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('seedName')}</label>
                        <input
                            type="text"
                            name="seed_name"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:border-emerald-500 outline-none transition-all font-semibold text-gray-900 text-sm ${errors.seed_name ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.seed_name}
                            onChange={handleChange}
                            placeholder="e.g. Tomato Hybrid"
                        />
                        {errors.seed_name && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.seed_name}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('lotNumber')}</label>
                        <input
                            type="text"
                            name="lot_no"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:border-emerald-500 outline-none transition-all font-semibold text-gray-900 text-sm ${errors.lot_no ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.lot_no}
                            onChange={handleChange}
                            placeholder={t('batchId')}
                        />
                        {errors.lot_no && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.lot_no}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('weightPerPacket')}</label>
                        <input
                            type="text"
                            name="weight_per_packet"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:border-emerald-500 outline-none transition-all font-semibold text-gray-900 text-sm ${errors.weight_per_packet ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.weight_per_packet}
                            onChange={handleChange}
                            placeholder="e.g. 500g or 1kg"
                        />
                        {errors.weight_per_packet && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.weight_per_packet}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('expiryDate')}</label>
                        <DatePicker
                            placeholder={t('expiryDate')}
                            selectedDate={formData.expiry_date}
                            onChange={(val) => handleChange({ target: { name: 'expiry_date', value: val } })}
                            fullWidth={true}
                            error={!!errors.expiry_date}
                        />
                        {errors.expiry_date && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.expiry_date}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('arrival')}</label>
                        <DatePicker
                            placeholder={t('arrival')}
                            selectedDate={formData.arrival_date}
                            onChange={(val) => handleChange({ target: { name: 'arrival_date', value: val } })}
                            fullWidth={true}
                            error={!!errors.arrival_date}
                        />
                        {errors.arrival_date && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.arrival_date}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('costPerPacketLabel')}</label>
                        <input
                            type="number"
                            name="cost_per_packet"
                            min="0"
                            step="0.01"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:border-emerald-500 outline-none transition-all font-semibold text-gray-900 text-sm ${errors.cost_per_packet ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.cost_per_packet}
                            onChange={handleChange}
                        />
                        {errors.cost_per_packet && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.cost_per_packet}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('totalPackets')}</label>
                        <input
                            type="number"
                            name="total_packets_initial"
                            min="1"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:border-emerald-500 outline-none transition-all font-semibold text-gray-900 text-sm ${errors.total_packets_initial ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.total_packets_initial}
                            onChange={handleChange}
                        />
                        {errors.total_packets_initial && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.total_packets_initial}</p>}
                    </div>
                </div>

                {/* Stock Summary Card */}
                {(totalWeight || totalStockValue > 0) && (
                    <div className="p-6 bg-white rounded-3xl border border-gray-200 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200 text-left">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Stock Summary</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {totalWeight && (
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-500">{t('totalWeight')}</span>
                                    <span className="text-xl font-extrabold text-emerald-600 tracking-tight mt-1">{totalWeight}</span>
                                </div>
                            )}
                            {totalStockValue > 0 && (
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-500">Total Value</span>
                                    <span className="text-xl font-extrabold text-gray-900 tracking-tight mt-1">₹{totalStockValue.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 focus:outline-none transition-all disabled:opacity-70 cursor-pointer"
                    >
                        {loading ? <Loader className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
                        {t('saveStockEntry')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StockEntry;
