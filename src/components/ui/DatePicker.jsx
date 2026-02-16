import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

const DatePicker = ({ label, selectedDate, onChange, placeholder = "Select Date" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const containerRef = useRef(null);

    useEffect(() => {
        if (selectedDate) {
            setCurrentMonth(new Date(selectedDate));
        }
    }, [selectedDate]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const onDateClick = (day) => {
        onChange(format(day, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    const clearDate = (e) => {
        e.stopPropagation();
        onChange('');
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-4 px-2">
                <button
                    onClick={(e) => { e.stopPropagation(); prevMonth(); }}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="text-sm font-bold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); nextMonth(); }}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const dateFormat = "EEEE";
        const days = [];
        let startDate = startOfWeek(currentMonth);

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center py-1">
                    {format(addDays(startDate, i), dateFormat).substr(0, 3)}
                </div>
            );
        }
        return <div className="grid grid-cols-7 mb-2">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d");
                const cloneDay = day;

                const isSelected = selectedDate ? isSameDay(day, new Date(selectedDate)) : false;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                days.push(
                    <div
                        key={day}
                        onClick={() => { if (isCurrentMonth) onDateClick(cloneDay); }}
                        className={`
                            relative h-9 w-9 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all duration-200
                            ${!isCurrentMonth ? "text-gray-200 pointer-events-none" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium"}
                            ${isSelected ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200 font-bold hover:bg-emerald-700 hover:text-white" : ""}
                            ${!isSelected && isTodayDate && "text-emerald-600 font-bold border border-emerald-200 bg-emerald-50"}
                        `}
                    >
                        <span>{formattedDate}</span>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 gap-1 mb-1" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div>{rows}</div>;
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-44 pl-3 pr-2 py-2.5 bg-gray-50 border rounded-lg text-sm font-bold flex items-center justify-between cursor-pointer transition-all group
                    ${isOpen ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-white' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100/50'}
                `}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <Calendar
                        size={16}
                        className={`transition-colors shrink-0 ${isOpen || selectedDate ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-500'}`}
                        strokeWidth={2.5}
                    />
                    <span className={`truncate ${selectedDate ? 'text-emerald-600' : 'text-gray-400 font-normal'} text-xs`}>
                        {selectedDate ? format(new Date(selectedDate), 'dd MMM, yy') : placeholder}
                    </span>
                </div>

                <div
                    onClick={selectedDate ? clearDate : undefined}
                    className={`
                        p-1 rounded-full transition-all shrink-0
                        ${selectedDate
                            ? 'text-gray-400 hover:bg-rose-50 hover:text-rose-500 cursor-pointer opacity-100'
                            : 'text-gray-200 cursor-not-allowed opacity-100'}
                    `}
                >
                    <X size={14} strokeWidth={2.5} />
                </div>
            </div>

            {/* Dropdown Calendar */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4 w-[280px] animate-in fade-in zoom-in-95 duration-200">
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                </div>
            )}
        </div>
    );
};

export default DatePicker;
