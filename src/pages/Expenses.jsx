import React, { useState } from 'react';
import { ReceiptText, Loader } from 'lucide-react';
import { useData } from '../context/DataContext';
import SuccessScreen from '../components/SuccessScreen';
import { formatDate } from '../utils/formatDate';

const Expenses = () => {
    const { addExpense } = useData();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: ''
    });

    const categories = ['Petrol', 'Electricity', 'Groceries', 'Rent', 'Mobile', 'Wifi', 'Other'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setFormData({ category: '', amount: '', description: '' });
        setShowSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            addExpense(formData);
            setShowSuccess(true);
        } catch (err) {
            console.error(err);
            alert('Failed to log expense');
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <SuccessScreen
                    title="Expense Logged"
                    message={`Logged ₹${formData.amount} for ${formData.category} on ${formatDate(new Date().toISOString())}.`}
                    onReset={handleReset}
                />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="bg-emerald-100 p-2.5 rounded-xl">
                    <ReceiptText className="h-6 w-6 text-emerald-600" fill="currentColor" strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Log New Expense</h2>
                    <p className="text-sm text-gray-500 font-medium">Track daily or monthly business/personal expenses.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Category</label>
                    <select
                        name="category"
                        required
                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none font-semibold shadow-sm hover:shadow-md cursor-pointer text-gray-900 text-sm"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">-- Select Category --</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Amount (₹)</label>
                    <input
                        type="number"
                        name="amount"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 shadow-sm hover:shadow-md text-sm"
                        value={formData.amount}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Description (Optional)</label>
                    <textarea
                        name="description"
                        rows="3"
                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold text-gray-900 shadow-sm hover:shadow-md resize-none text-sm"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Additional details..."
                    ></textarea>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-70 shadow-lg shadow-emerald-200"
                    >
                        {loading ? <Loader className="animate-spin mr-2 h-5 w-5" /> : <ReceiptText className="mr-2 h-5 w-5" />}
                        Log Expense
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4 font-medium opacity-60">This will be reflected in your daily totals.</p>
                </div>
            </form>
        </div>
    );
};

export default Expenses;
