import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Layers, ShoppingBag, ReceiptText, Menu, X, Leaf, LogOut, Globe } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { language, toggleLanguage, t } = useLanguage();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const getTranslatedName = (path) => {
        if (path === '/') return t('dashboard');
        if (path === '/stock') return t('stockEntry');
        if (path === '/sales') return t('sales');
        if (path === '/expenses') return t('expenses');
        return '';
    };

    const navItems = [
        { path: '/', icon: LayoutDashboard },
        { path: '/stock', icon: Layers },
        { path: '/sales', icon: ShoppingBag },
        { path: '/expenses', icon: ReceiptText },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const BrandLogo = () => (
        <div className="flex items-center gap-3 px-2">
            <div className="bg-emerald-100 p-2.5 rounded-xl">
                <Leaf className="h-6 w-6 text-emerald-600 fill-emerald-600" />
            </div>
            <div>
                <h1 className="text-lg font-extrabold text-gray-900 leading-tight tracking-tight">SEKHAR<span className="text-emerald-600">.</span></h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t('hybridSeeds')}</p>
            </div>
        </div>
    );

    const LanguageToggle = () => (
        <button
            onClick={toggleLanguage}
            id="lang-toggle-btn"
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-600 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer"
            title={language === 'en' ? 'తెలుగు లోకి మార్చండి' : 'Switch to English'}
        >
            <Globe size={14} className="text-emerald-500 shrink-0" />
            <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
        </button>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 z-20">
                <div className="flex items-center justify-between h-24 px-6 border-b border-gray-100">
                    <BrandLogo />
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-6">
                    <div className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-lg text-sm transition-all duration-200 group ${isActive
                                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                                        : 'text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-50/50'
                                        }`}
                                >
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 0 : 2}
                                        fill={isActive ? "currentColor" : "none"}
                                        className={`mr-3 transition-colors duration-200 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                                    />
                                    <span className={isActive ? 'opacity-100' : 'opacity-100'}>{getTranslatedName(item.path)}</span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile / Admin Badge Section */}
                <div className="p-6 border-t border-gray-100 bg-white">
                    <div className="flex items-center gap-3 px-3 py-3 mb-3 border border-gray-100 rounded-lg">
                        <div className="bg-emerald-600 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-base">
                            {currentUser?.email?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{currentUser?.email?.split('@')[0] || 'Admin'}</p>
                            <p className="text-xs text-gray-500 font-medium truncate">{t('loggedIn')}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-rose-600 rounded-lg hover:bg-rose-50 hover:border-rose-100 transition-all text-sm font-bold cursor-pointer"
                    >
                        <LogOut size={16} strokeWidth={2.5} />
                        {t('signOut')}
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Sidebar */}
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <div className="md:hidden flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4 z-10">
                    <BrandLogo />
                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        <button onClick={toggleSidebar} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 z-40 flex md:hidden">
                        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm" onClick={toggleSidebar}></div>
                        <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-white border-r border-gray-200">
                            <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
                                <BrandLogo />
                                <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                            </div>
                            <nav className="flex-1 px-4 py-6 space-y-2">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={toggleSidebar}
                                            className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium ${isActive
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                                            {getTranslatedName(item.path)}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-end h-16 px-8 bg-[#F8FAFC] border-b border-gray-200/50">
                    <LanguageToggle />
                </div>

                {/* Main Content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:px-8 md:pb-8 md:pt-4 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
