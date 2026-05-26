import React, { useState } from 'react';
import { ReceiptText, Loader } from 'lucide-react';
import { useData } from '../context/DataContext';
import SuccessScreen from '../components/SuccessScreen';
import { formatDate } from '../utils/formatDate';
import { useLanguage } from '../context/LanguageContext';

const Expenses = () => {
    const { addExpense } = useData();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { t } = useLanguage();
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: ''
    });

    const categories = ['Petrol', 'Electricity', 'Groceries', 'Rent', 'Mobile', 'Wifi', 'Other'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleReset = () => {
        setFormData({ category: '', amount: '', description: '' });
        setShowSuccess(false);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.category) newErrors.category = 'Please select a category';
        if (!formData.amount) newErrors.amount = 'Please fill out this field';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            await addExpense(formData);
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
            <div className="min-h-[85vh] flex items-center justify-center">
                <div className="w-full max-w-lg bg-white rounded-3xl border border-gray-200 overflow-hidden">
                    <SuccessScreen
                        title={t('expenseLogged')}
                        message={`${t('expenses')}: ₹${formData.amount} (${formData.category}).`}
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
                    <ReceiptText className="h-6 w-6 text-emerald-600" fill="currentColor" strokeWidth={1.5} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t('logNewExpense')}</h2>
                    <p className="text-sm text-gray-500 font-medium">{t('trackExpenses')}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('category')}</label>
                    <select
                        name="category"
                        className={`w-full px-5 py-3 bg-white border rounded-2xl focus:border-emerald-500 outline-none transition-all appearance-none font-semibold cursor-pointer text-gray-900 text-sm ${errors.category ? 'border-rose-300' : 'border-gray-200'}`}
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">{t('selectCategory')}</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {errors.category && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.category}</p>}
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('amount')} (₹)</label>
                    <input
                        type="number"
                        name="amount"
                        min="0"
                        step="0.01"
                        className={`w-full px-5 py-3 bg-white border rounded-2xl focus:border-emerald-500 outline-none transition-all font-semibold text-gray-900 text-sm ${errors.amount ? 'border-rose-300' : 'border-gray-200'}`}
                        value={formData.amount}
                        onChange={handleChange}
                    />
                    {errors.amount && <p className="text-rose-500 text-xs mt-1.5 font-bold ml-1">{errors.amount}</p>}
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{t('descriptionOptional')}</label>
                    <textarea
                        name="description"
                        rows="3"
                        className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl focus:border-emerald-500 outline-none transition-all font-semibold text-gray-900 resize-none text-sm"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder={t('additionalDetails')}
                    ></textarea>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 focus:outline-none transition-all disabled:opacity-70 cursor-pointer text-sm"
                    >
                        {loading ? <Loader className="animate-spin mr-2 h-5 w-5" /> : <ReceiptText className="mr-2 h-5 w-5" />}
                        {t('logExpenseBtn')}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4 font-medium opacity-60">{t('reflectedInTotals')}</p>
                </div>
            </form>
        </div>
    );
};

export default Expenses;
