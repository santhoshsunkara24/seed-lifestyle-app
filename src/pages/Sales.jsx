import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader, Sprout } from 'lucide-react';
import { useData } from '../context/DataContext';
import SuccessScreen from '../components/SuccessScreen';
import { formatDate } from '../utils/formatDate';

const Sales = () => {
    const { stock, addSale } = useData();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [lastSaleResult, setLastSaleResult] = useState(null);

    // Filter only available stock


    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        customer_name: '',
        stock_batch_id: '',
        packets_sold: '',
        price_per_packet: '',
        amount_paid_now: ''
    });

    const [calculatedTotal, setCalculatedTotal] = useState(0);

    useEffect(() => {
        const packets = parseFloat(formData.packets_sold) || 0;
        const price = parseFloat(formData.price_per_packet) || 0;
        setCalculatedTotal(packets * price);
    }, [formData.packets_sold, formData.price_per_packet]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleReset = () => {
        setFormData({
            customer_name: '',
            stock_batch_id: '',
            packets_sold: '',
            price_per_packet: '',
            amount_paid_now: ''
        });
        setCalculatedTotal(0);
        setShowSuccess(false);
        setLastSaleResult(null);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.customer_name.trim()) newErrors.customer_name = 'Please fill out this field';
        if (!formData.stock_batch_id) newErrors.stock_batch_id = 'Please select a seed lot';
        if (!formData.packets_sold) newErrors.packets_sold = 'Please fill out this field';
        if (!formData.price_per_packet) newErrors.price_per_packet = 'Please fill out this field';
        if (formData.amount_paid_now === '') newErrors.amount_paid_now = 'Please fill out this field';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const saleData = {
                ...formData,
                packets_sold: parseFloat(formData.packets_sold),
                price_per_packet: parseFloat(formData.price_per_packet),
                amount_paid_now: parseFloat(formData.amount_paid_now),
                total_amount_due: calculatedTotal
            };
            await addSale(saleData);
            setLastSaleResult({ ...saleData, amount_paid: parseFloat(formData.amount_paid_now) }); // Mock result for display
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectedStock = stock.find(s => s.id === formData.stock_batch_id);

    if (showSuccess) {
        return (
            <div className="min-h-[85vh] flex items-center justify-center">
                <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl">
                    <SuccessScreen
                        title="Sale Recorded!"
                        message={`Sold ${lastSaleResult?.packets_sold} pkts to ${lastSaleResult?.customer_name} on ${formatDate(new Date().toISOString())}. Received ₹${lastSaleResult?.amount_paid}.`}
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
                    <ShoppingBag className="h-6 w-6 text-emerald-600" fill="currentColor" strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Log New Sale</h2>
                    <p className="text-sm text-gray-500 font-medium">Record a new transaction with a farmer.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Customer Details</label>
                        <input
                            type="text"
                            name="customer_name"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 text-sm ${errors.customer_name ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.customer_name}
                            onChange={handleChange}
                            placeholder="Enter Farmer Name"
                        />
                        {errors.customer_name && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.customer_name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Seed Selection</label>
                        <div className="relative">
                            <select
                                name="stock_batch_id"
                                className={`w-full pl-5 pr-10 py-3 bg-white border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none font-semibold cursor-pointer text-gray-900 text-sm ${errors.stock_batch_id ? 'border-rose-300' : 'border-gray-200'}`}
                                value={formData.stock_batch_id}
                                onChange={handleChange}
                            >
                                <option value="">Select Seed Lot...</option>
                                {[...stock].sort((a, b) => b.packets_available - a.packets_available).map(item => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                        disabled={item.packets_available <= 0}
                                        className={item.packets_available <= 0 ? "text-gray-400 bg-gray-50" : "text-gray-900"}
                                    >
                                        {item.seed_name} - {item.lot_no}
                                        {item.packets_available > 0
                                            ? ` (${item.packets_available} pkts avail)`
                                            : ' (Out of Stock)'}
                                    </option>
                                ))}
                            </select>
                            <Sprout className="absolute right-5 top-4.5 h-5 w-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.stock_batch_id && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.stock_batch_id}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Quantity</label>
                        <input
                            type="number"
                            name="packets_sold"
                            min="1"
                            max={selectedStock ? selectedStock.packets_available : undefined}
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 text-sm ${errors.packets_sold ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.packets_sold}
                            onChange={handleChange}
                            placeholder="Packets"
                        />
                        {selectedStock && <p className="text-xs text-emerald-600 mt-2 ml-1 font-bold">Available: {selectedStock.packets_available}</p>}
                        {errors.packets_sold && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.packets_sold}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Price / Pkt (₹)</label>
                        <input
                            type="number"
                            name="price_per_packet"
                            min="0"
                            step="0.01"
                            className={`w-full px-5 py-3 bg-white border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 text-sm ${errors.price_per_packet ? 'border-rose-300' : 'border-gray-200'}`}
                            value={formData.price_per_packet}
                            onChange={handleChange}
                            placeholder="0.00"
                        />
                        {errors.price_per_packet && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.price_per_packet}</p>}
                    </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-gray-200 shadow-lg shadow-gray-100/50">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-sm font-bold text-gray-600">Total Sale Amount</span>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">₹{calculatedTotal.toLocaleString()}</span>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 ml-1">Initial Payment (₹)</label>
                        <input
                            type="number"
                            name="amount_paid_now"
                            min="0"
                            max={calculatedTotal}
                            step="0.01"
                            placeholder="Amount Received Now"
                            className={`w-full px-5 py-3 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 font-bold text-sm ${errors.amount_paid_now ? 'border-rose-300' : 'border-emerald-200'}`}
                            value={formData.amount_paid_now}
                            onChange={handleChange}
                        />
                        {errors.amount_paid_now && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.amount_paid_now}</p>}
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-70 text-sm"
                    >
                        {loading ? <Loader className="animate-spin mr-2 h-5 w-5" /> : <ShoppingBag className="mr-2 h-5 w-5" />}
                        Record Transaction
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4 font-medium opacity-60">Securely recorded in local storage.</p>
                </div>
            </form>
        </div>
    );
};

export default Sales;
