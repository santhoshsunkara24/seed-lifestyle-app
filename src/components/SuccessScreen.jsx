import React, { useEffect, useState } from 'react';
import { Check, Plus, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessScreen = ({ title, message, onReset }) => {
    const navigate = useNavigate();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            {/* Icon */}
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>

            {/* Title & Message */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 text-xs mb-6 max-w-xs mx-auto leading-relaxed font-medium">{message}</p>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button
                    onClick={onReset}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors text-sm"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Another
                </button>
                <button
                    onClick={() => navigate('/')}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-colors border border-gray-200 text-sm"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
};

export default SuccessScreen;
