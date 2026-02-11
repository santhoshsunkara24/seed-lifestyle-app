import React, { useState, useMemo } from 'react';
import { Wallet, Warehouse, PiggyBank, CheckCircle2, Plus, CheckSquare, Trash2, X, MoveUpRight, Pencil, Save, Eye, Search, Filter, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';

import { formatDate } from '../utils/formatDate';

const Dashboard = () => {
    const { stats, stock, sales, expenses, loading, addPayment, deleteSale, deleteStock, deleteExpense, updateSale, updateStock, updateExpense } = useData();
    const [activeTab, setActiveTab] = useState('sales');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedEntity, setSelectedEntity] = useState(''); // Customer, Supplier, or Category
    const [paymentAmounts, setPaymentAmounts] = useState({});

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: null, // 'view' or 'edit'
        dataType: null, // 'sale', 'stock', 'expense'
        item: null
    });

    const [editForm, setEditForm] = useState({});

    // Get Unique Entities for Dropdown
    const uniqueEntities = useMemo(() => {
        if (activeTab === 'sales') return [...new Set(sales.map(s => s.customer_name))].sort();
        if (activeTab === 'stock') return [...new Set(stock.map(s => s.supplier_name))].sort();
        if (activeTab === 'expenses') return [...new Set(expenses.map(e => e.category))].sort();
        return [];
    }, [activeTab, sales, stock, expenses]);

    // Reset filters on tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery('');
        setDateRange({ start: '', end: '' });
        setSelectedEntity('');
    };

    // Filter Logic
    const getFilteredData = () => {
        let data = [];
        if (activeTab === 'sales') data = sales;
        else if (activeTab === 'stock') data = stock;
        else if (activeTab === 'expenses') data = expenses;

        return data.filter(item => {
            // 1. Text Search
            const query = searchQuery.toLowerCase();
            let matchesSearch = false;

            if (activeTab === 'sales') {
                matchesSearch = item.customer_name.toLowerCase().includes(query);
            } else if (activeTab === 'stock') {
                matchesSearch = item.supplier_name.toLowerCase().includes(query) ||
                    item.seed_name.toLowerCase().includes(query) ||
                    item.lot_no.includes(query);
            } else if (activeTab === 'expenses') {
                matchesSearch = item.category.toLowerCase().includes(query) ||
                    (item.description && item.description.toLowerCase().includes(query));
            }

            if (!matchesSearch) return false;

            // 2. Entity Filter
            if (selectedEntity) {
                if (activeTab === 'sales' && item.customer_name !== selectedEntity) return false;
                if (activeTab === 'stock' && item.supplier_name !== selectedEntity) return false;
                if (activeTab === 'expenses' && item.category !== selectedEntity) return false;
            }

            // 3. Date Range Filter
            if (dateRange.start || dateRange.end) {
                const itemDate = new Date(item.sale_date || item.arrival_date || item.expense_date);
                // Reset time part for accurate date comparison
                itemDate.setHours(0, 0, 0, 0);

                if (dateRange.start) {
                    const startDate = new Date(dateRange.start);
                    startDate.setHours(0, 0, 0, 0);
                    if (itemDate < startDate) return false;
                }

                if (dateRange.end) {
                    const endDate = new Date(dateRange.end);
                    endDate.setHours(23, 59, 59, 999);
                    if (itemDate > endDate) return false;
                }
            }

            return true;
        });
    };

    const filteredData = getFilteredData();

    const handlePaymentChange = (id, value) => {
        setPaymentAmounts({ ...paymentAmounts, [id]: value });
    };

    const submitPayment = (id) => {
        const amount = paymentAmounts[id];
        if (!amount || amount <= 0) return;
        addPayment(id, amount);
        setPaymentAmounts({ ...paymentAmounts, [id]: '' });
    };

    const settlePayment = (sale) => {
        const remaining = sale.total_amount_due - sale.amount_paid;
        if (remaining > 0) {
            addPayment(sale.id, remaining);
        }
    };

    const openModal = (item, dataType, type = 'view') => {
        setModalConfig({ isOpen: true, type, dataType, item });
        if (type === 'edit') {
            setEditForm({ ...item });
        }
    };

    const closeModal = () => {
        setModalConfig({ isOpen: false, type: null, dataType: null, item: null });
        setEditForm({});
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const saveEdit = () => {
        if (modalConfig.dataType === 'sale') {
            updateSale(editForm);
        } else if (modalConfig.dataType === 'stock') {
            updateStock(editForm);
        } else if (modalConfig.dataType === 'expense') {
            updateExpense(editForm);
        }
        closeModal();
    };



    return (
        <div className="space-y-8 relative max-w-[1600px] mx-auto">
            <header className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight lg:text-4xl leading-tight">Dashboard.</h2>
                    <p className="text-sm text-gray-500 font-medium tracking-wide mt-1">Overview & Statistics</p>
                </div>
                <div className="text-sm font-bold text-gray-600 bg-white px-5 py-2.5 border border-gray-200 uppercase tracking-widest rounded-full">
                    {formatDate(new Date().toISOString())}
                </div>
            </header>

            {/* Stats Grid - Soft & Minimal */}
            {/* Stats Grid - Soft & Minimal (Tinted) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-8 rounded-3xl relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group border border-emerald-100/50">
                    <div className="absolute top-0 right-0 p-8 text-emerald-100 opacity-50 group-hover:scale-110 transition-transform duration-500">
                        <Wallet size={120} strokeWidth={0} fill="currentColor" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-emerald-100 rounded-full">
                                <Wallet size={24} strokeWidth={0} fill="currentColor" className="text-emerald-600" />
                            </div>
                            <h3 className="text-emerald-900 font-extrabold tracking-wide text-[10px] uppercase">Money Received</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 tracking-tight mb-1">₹{loading ? "..." : (stats.totalCollection || 0).toLocaleString()}</p>
                        <p className="text-emerald-800 text-sm font-semibold">Total: ₹{loading ? "..." : (stats.totalSalesValue || 0).toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-blue-50 p-8 rounded-3xl relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group border border-blue-100/50">
                    <div className="absolute top-0 right-0 p-8 text-blue-100 opacity-50 group-hover:scale-110 transition-transform duration-500">
                        <Warehouse size={120} strokeWidth={0} fill="currentColor" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-blue-100 rounded-full">
                                <Warehouse size={24} strokeWidth={0} fill="currentColor" className="text-blue-600" />
                            </div>
                            <h3 className="text-blue-900 font-extrabold tracking-wide text-[10px] uppercase">Stock Value</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 tracking-tight mb-1">₹{loading ? "..." : (stats.stockValue || 0).toLocaleString()}</p>
                        <p className="text-blue-800 text-sm font-semibold">{loading ? "..." : stats.totalBatches || 0} Batches in Warehouse</p>
                    </div>
                </div>

                <div className="bg-rose-50 p-8 rounded-3xl relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group border border-rose-100/50">
                    <div className="absolute top-0 right-0 p-8 text-rose-100 opacity-50 group-hover:scale-110 transition-transform duration-500">
                        <PiggyBank size={120} strokeWidth={0} fill="currentColor" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-rose-100 rounded-full">
                                <PiggyBank size={24} strokeWidth={0} fill="currentColor" className="text-rose-600" />
                            </div>
                            <h3 className="text-rose-900 font-extrabold tracking-wide text-[10px] uppercase">Expenses</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 tracking-tight mb-1">₹{loading ? "..." : (stats.totalExpenses || 0).toLocaleString()}</p>
                        <p className="text-rose-800 text-sm font-semibold">{loading ? "..." : (stats.expenseCount || 0)} Transactions</p>
                    </div>
                </div>
            </div>

            {/* Content Area with Tabs */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden min-h-[600px] shadow-xl shadow-gray-100/50">
                <div className="border-b border-gray-200 px-8 flex flex-col items-start bg-white sticky top-0 z-10 pt-8 pb-0">
                    <div className="flex space-x-12 w-full overflow-x-auto no-scrollbar mb-6">
                        {['sales', 'stock', 'expenses'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`pb-4 text-base font-bold border-b-2 transition-all capitalize tracking-wider flex items-center gap-2 ${activeTab === tab
                                    ? 'border-emerald-600 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {tab === 'sales' && <Wallet size={18} strokeWidth={activeTab === 'sales' ? 0 : 2} fill={activeTab === 'sales' ? "currentColor" : "none"} className={activeTab === 'sales' ? "text-emerald-500" : ""} />}
                                {tab === 'stock' && <Warehouse size={18} strokeWidth={activeTab === 'stock' ? 0 : 2} fill={activeTab === 'stock' ? "currentColor" : "none"} className={activeTab === 'stock' ? "text-blue-500" : ""} />}
                                {tab === 'expenses' && <PiggyBank size={18} strokeWidth={activeTab === 'expenses' ? 0 : 2} fill={activeTab === 'expenses' ? "currentColor" : "none"} className={activeTab === 'expenses' ? "text-rose-500" : ""} />}
                                {tab === 'sales' ? 'Sales Tracker' : tab === 'stock' ? 'Inventory Status' : 'Expense Log'}
                            </button>
                        ))}
                    </div>

                    {/* Filters Bar */}
                    <div className="w-full flex flex-col md:flex-row gap-5 mb-8 pt-2 items-center">
                        {/* Search */}
                        <div className="relative flex-grow w-full md:w-auto group">
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-500 font-medium"
                            />
                            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" strokeWidth={2} />
                        </div>

                        {/* Entity Filter */}
                        <div className="relative w-full md:w-56 group">
                            <select
                                value={selectedEntity}
                                onChange={(e) => setSelectedEntity(e.target.value)}
                                className="w-full pl-11 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer text-gray-700 font-medium"
                            >
                                <option value="">All {activeTab === 'sales' ? 'Customers' : activeTab === 'stock' ? 'Suppliers' : 'Categories'}</option>
                                {uniqueEntities.map(entity => (
                                    <option key={entity} value={entity}>{entity}</option>
                                ))}
                            </select>
                            <Filter className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" strokeWidth={2} />
                        </div>

                        {/* Date Range with Custom DD-MM-YYYY Mask */}
                        <div className="flex gap-3 items-center w-full md:w-auto">
                            <div className="relative w-full md:w-40 group">
                                {/* Visual Mask */}
                                <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center h-[42px]">
                                    {dateRange.start ? formatDate(dateRange.start) : <span className="text-gray-300">Start Date</span>}
                                </div>
                                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-300" strokeWidth={2} />
                                {/* Hidden Trigger */}
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                            </div>
                            <span className="text-gray-300 font-light">/</span>
                            <div className="relative w-full md:w-40 group">
                                {/* Visual Mask */}
                                <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center h-[42px]">
                                    {dateRange.end ? formatDate(dateRange.end) : <span className="text-gray-300">End Date</span>}
                                </div>
                                <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-300" strokeWidth={2} />
                                {/* Hidden Trigger */}
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(searchQuery || selectedEntity || dateRange.start || dateRange.end) && (
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedEntity(''); setDateRange({ start: '', end: '' }) }}
                                className="p-3 text-rose-500 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100"
                                title="Clear Filters"
                            >
                                <X size={20} strokeWidth={2} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-0">
                    {activeTab === 'sales' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-base text-left text-gray-600">
                                <thead className="text-sm text-gray-500 font-bold uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-6 font-semibold">Date</th>
                                        <th className="px-8 py-6 font-semibold">Customer</th>
                                        <th className="px-8 py-6 font-semibold">Total</th>
                                        <th className="px-8 py-6 font-semibold">Paid</th>
                                        <th className="px-8 py-6 font-semibold">Due</th>
                                        <th className="px-8 py-6 font-semibold">Fast Action</th>
                                        <th className="px-8 py-6 text-center font-semibold">Manage</th>
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {filteredData.length === 0 ? (
                                        <tr><td colSpan="7" className="px-8 py-16 text-center text-gray-400 font-medium">No sales matches found.</td></tr>
                                    ) : (
                                        filteredData.map((sale) => (
                                            <tr key={sale.id} className="group hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-0">
                                                <td className="px-8 py-6 text-gray-500 font-mono text-xs tracking-wider">{formatDate(sale.sale_date)}</td>
                                                <td className="px-8 py-6 font-bold text-gray-900 text-sm">{sale.customer_name}</td>
                                                <td className="px-8 py-6 text-gray-700 font-semibold text-sm">₹{sale.total_amount_due.toLocaleString()}</td>
                                                <td className="px-8 py-6 text-emerald-600 font-bold text-sm">+₹{sale.amount_paid.toLocaleString()}</td>
                                                <td className="px-8 py-6">
                                                    {sale.total_amount_due - sale.amount_paid > 0 ? (
                                                        <span className="text-rose-500 font-bold bg-rose-50 px-2.5 py-1 rounded-lg text-xs">₹{(sale.total_amount_due - sale.amount_paid).toLocaleString()} DUE</span>
                                                    ) : (
                                                        <span className="text-emerald-500 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg text-xs">PAID</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    {sale.is_fully_paid ? (
                                                        <span className="inline-flex items-center text-emerald-600 bg-emerald-50/50 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                                                            Paid
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-2 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => {
                                                                    const amount = prompt(`Record Payment (₹${sale.total_amount_due - sale.amount_paid} due):`);
                                                                    if (amount) addPayment(sale.id, parseFloat(amount));
                                                                }}
                                                                className="text-emerald-600 hover:text-emerald-900 font-bold text-xs bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors mr-2"
                                                            >
                                                                Pay
                                                            </button>
                                                            <button
                                                                onClick={() => settlePayment(sale)}
                                                                className="h-9 w-9 flex items-center justify-center text-emerald-600 bg-white border border-emerald-100 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                title="Mark Fully Paid"
                                                            >
                                                                <CheckSquare size={18} strokeWidth={2} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openModal(sale, 'sale', 'view')} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition-colors"><Eye size={18} strokeWidth={1.5} /></button>
                                                        <button onClick={() => openModal(sale, 'sale', 'edit')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"><Pencil size={18} strokeWidth={1.5} /></button>
                                                        <button onClick={() => deleteSale(sale.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-full transition-colors"><Trash2 size={18} strokeWidth={1.5} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'stock' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-base text-left text-gray-600">
                                <thead className="text-sm text-gray-500 font-bold uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-6 font-semibold">Supplier</th>
                                        <th className="px-8 py-6 font-semibold">Seed Lot</th>
                                        <th className="px-8 py-6 font-semibold">Price Per Packet</th>
                                        <th className="px-8 py-6 font-semibold">Total Value</th>
                                        <th className="px-8 py-6 font-semibold">Arrival</th>
                                        <th className="px-8 py-6 font-semibold">Stock Level</th>
                                        <th className="px-8 py-6 font-semibold">Status</th>
                                        <th className="px-8 py-6 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {filteredData.length === 0 ? (
                                        <tr><td colSpan="8" className="px-8 py-16 text-center text-gray-400 font-medium">No stock data available.</td></tr>
                                    ) : (
                                        filteredData.map((batch) => (
                                            <tr key={batch.id} className="group hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-0">
                                                <td className="px-8 py-6 text-gray-900 font-bold text-sm">{batch.supplier_name}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 font-semibold text-sm">{batch.seed_name}</span>
                                                        <span className="text-gray-500 text-xs">{batch.lot_no}</span>
                                                        <span className="text-xs text-gray-500 font-mono tracking-wider">#{batch.lot_no}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-gray-900 font-bold text-sm">₹{batch.cost_per_packet}</td>
                                                <td className="px-8 py-6 text-gray-700 font-semibold text-sm">₹{(batch.cost_per_packet * batch.total_packets_initial).toLocaleString()}</td>
                                                <td className="px-8 py-6 text-gray-500 text-xs tracking-wider font-mono">{formatDate(batch.arrival_date)}</td>
                                                <td className="px-8 py-6 font-mono text-gray-800 font-bold bg-gray-50/80 rounded-lg text-sm">{batch.packets_available} <span className="text-[10px] font-normal text-gray-500">pkts</span></td>
                                                <td className="px-8 py-6">
                                                    {batch.packets_available > 0 ? (
                                                        <span className="inline-flex items-center text-emerald-600 bg-emerald-50/50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">In Stock</span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-rose-600 bg-rose-50/50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-rose-100">Out of Stock</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openModal(batch, 'stock', 'view')} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition-colors"><Eye size={18} strokeWidth={1.5} /></button>
                                                        <button onClick={() => openModal(batch, 'stock', 'edit')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"><Pencil size={18} strokeWidth={1.5} /></button>
                                                        <button onClick={() => deleteStock(batch.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-full transition-colors"><Trash2 size={18} strokeWidth={1.5} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'expenses' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-400 font-bold uppercase tracking-widest border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-6 font-semibold">Date</th>
                                        <th className="px-8 py-6 font-semibold">Category</th>
                                        <th className="px-8 py-6 font-semibold">Description</th>
                                        <th className="px-8 py-6 font-semibold">Amount</th>
                                        <th className="px-8 py-6 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="">
                                    {filteredData.length === 0 ? (
                                        <tr><td colSpan="5" className="px-8 py-16 text-center text-gray-400 font-medium">No expenses logged yet.</td></tr>
                                    ) : (
                                        filteredData.map((exp) => (
                                            <tr key={exp.id} className="group hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-0">
                                                <td className="px-8 py-6 text-gray-500 font-mono text-sm tracking-wider">{formatDate(exp.expense_date)}</td>
                                                <td className="px-8 py-6">
                                                    <span className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-gray-300 uppercase tracking-wider shadow-sm">{exp.category}</span>
                                                </td>
                                                <td className="px-8 py-6 text-gray-500 italic text-base">{exp.description || '-'}</td>
                                                <td className="px-8 py-6 font-bold text-gray-900 text-lg">₹{exp.amount}</td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openModal(exp, 'expense', 'view')} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition-colors"><Eye size={18} strokeWidth={1.5} /></button>
                                                        <button onClick={() => openModal(exp, 'expense', 'edit')} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors"><Pencil size={18} strokeWidth={1.5} /></button>
                                                        <button onClick={() => deleteExpense(exp.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-gray-100 rounded-full transition-colors"><Trash2 size={18} strokeWidth={1.5} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Reusable Modal for View and Edit */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 bg-gray-900/20 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 capitalize tracking-tight">
                                    {modalConfig.type === 'edit' ? 'Edit ' : ''}
                                    {modalConfig.dataType === 'sale' ? 'Sale Details' : modalConfig.dataType === 'stock' ? 'Stock Batch' : 'Expense Record'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">Make changes or view details below.</p>
                            </div>
                            <button onClick={closeModal} className="p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* VIEW MODE */}
                            {modalConfig.type === 'view' && (
                                <>
                                    {modalConfig.dataType === 'sale' && (
                                        <div className="space-y-4">
                                            <DetailRow label="Date" value={formatDate(modalConfig.item.sale_date)} />
                                            <DetailRow label="Customer Name" value={modalConfig.item.customer_name} />
                                            <DetailRow label="Packets Sold" value={modalConfig.item.packets_sold} />
                                            <div className="h-px bg-gray-100 my-2"></div>
                                            <DetailRow label="Total Amount Due" value={`₹${modalConfig.item.total_amount_due}`} highlight />
                                            <DetailRow label="Total Paid" value={`₹${modalConfig.item.amount_paid}`} color="text-emerald-600" />
                                            <DetailRow label="Remaining Due" value={`₹${modalConfig.item.total_amount_due - modalConfig.item.amount_paid}`} color="text-rose-600" />
                                        </div>
                                    )}
                                    {modalConfig.dataType === 'stock' && (
                                        <div className="space-y-4">
                                            <DetailRow label="Supplier" value={modalConfig.item.supplier_name} />
                                            <DetailRow label="Seed Name" value={modalConfig.item.seed_name} highlight />
                                            <DetailRow label="Lot Number" value={modalConfig.item.lot_no} />
                                            <div className="h-px bg-gray-100 my-2"></div>
                                            <DetailRow label="Total Packets" value={modalConfig.item.total_packets_initial} />
                                            <DetailRow label="Avail" value={modalConfig.item.packets_available} color="text-emerald-600" />
                                        </div>
                                    )}
                                    {modalConfig.dataType === 'expense' && (
                                        <div className="space-y-4">
                                            <DetailRow label="Category" value={modalConfig.item.category} highlight />
                                            <DetailRow label="Amount" value={`₹${modalConfig.item.amount}`} />
                                            <DetailRow label="Description" value={modalConfig.item.description || '-'} />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* EDIT MODE */}
                            {modalConfig.type === 'edit' && (
                                <div className="space-y-5">
                                    {modalConfig.dataType === 'sale' && (
                                        <>
                                            <Input label="Customer Name" name="customer_name" value={editForm.customer_name} onChange={handleEditChange} />
                                            <Input label="Packets Sold" name="packets_sold" type="number" value={editForm.packets_sold} onChange={handleEditChange} />
                                            <Input label="Total Amount (₹)" name="total_amount_due" type="number" value={editForm.total_amount_due} onChange={handleEditChange} />
                                            <Input label="Paid So Far (₹)" name="amount_paid" type="number" value={editForm.amount_paid} onChange={handleEditChange} />
                                        </>
                                    )}
                                    {modalConfig.dataType === 'stock' && (
                                        <>
                                            <Input label="Supplier" name="supplier_name" value={editForm.supplier_name} onChange={handleEditChange} />
                                            <Input label="Seed Name" name="seed_name" value={editForm.seed_name} onChange={handleEditChange} />
                                            <Input label="Lot Number" name="lot_no" value={editForm.lot_no} onChange={handleEditChange} />
                                            <Input label="Initial Packets (Tracked)" name="total_packets_initial" type="number" value={editForm.total_packets_initial} onChange={handleEditChange} />
                                            <Input label="Packets Available" name="packets_available" type="number" value={editForm.packets_available} onChange={handleEditChange} />
                                        </>
                                    )}
                                    {modalConfig.dataType === 'expense' && (
                                        <>
                                            <Input label="Category" name="category" value={editForm.category} onChange={handleEditChange} />
                                            <Input label="Amount" name="amount" type="number" value={editForm.amount} onChange={handleEditChange} />
                                            <Input label="Description" name="description" value={editForm.description} onChange={handleEditChange} />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button onClick={closeModal} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm">
                                Close
                            </button>
                            {modalConfig.type === 'edit' && (
                                <button onClick={saveEdit} className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-semibold flex items-center shadow-lg shadow-emerald-200">
                                    <Save size={18} className="mr-2" /> Save Changes
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Components
const DetailRow = ({ label, value, highlight = false, color = 'text-gray-900' }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className={`font-bold ${highlight ? 'text-base ' : 'text-sm '} ${color} ${highlight ? 'text-gray-900' : ''}`}>
            {value}
        </span>
    </div>
);

const Input = ({ label, name, type = "text", value, onChange }) => (
    <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-semibold text-gray-900 shadow-sm placeholder:text-gray-400"
        />
    </div>
);

export default Dashboard;
