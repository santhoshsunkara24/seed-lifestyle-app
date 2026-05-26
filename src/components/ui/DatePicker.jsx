import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, X, ChevronDown } from 'lucide-react';

const DatePicker = ({ label, selectedDate, onChange, placeholder = "Select Date", fullWidth = false, error = false, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [inputValue, setInputValue] = useState('');
    const containerRef = useRef(null);
    const isTypingRef = useRef(false);

    // Safe parsing utility for local YYYY-MM-DD
    const parseLocalDate = (dateStr) => {
        if (!dateStr) return new Date();
        if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
        }
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const syncTypedValue = () => {
        isTypingRef.current = false;
        if (selectedDate) {
            const dateObj = parseLocalDate(selectedDate);
            setInputValue(format(dateObj, 'dd/MM/yyyy'));
        } else {
            setInputValue('');
        }
    };

    // Sync input field value when selectedDate changes externally (not via typing)
    useEffect(() => {
        if (isTypingRef.current) {
            return;
        }
        if (selectedDate) {
            const dateObj = parseLocalDate(selectedDate);
            setInputValue(format(dateObj, 'dd/MM/yyyy'));
            setCurrentMonth(dateObj);
        } else {
            setInputValue('');
        }
    }, [selectedDate]);

    // Close on click outside and reset partial input values
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                isTypingRef.current = false;
                if (selectedDate) {
                    const dateObj = parseLocalDate(selectedDate);
                    setInputValue(format(dateObj, 'dd/MM/yyyy'));
                } else {
                    setInputValue('');
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedDate]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const onDateClick = (day) => {
        isTypingRef.current = false;
        onChange(format(day, 'yyyy-MM-dd'));
        setIsOpen(false);
    };

    const clearDate = (e) => {
        e.stopPropagation();
        isTypingRef.current = false;
        onChange('');
        setInputValue('');
    };

    // Handle typed date input with safe auto-masking (DD/MM/YYYY)
    const handleInputChange = (e) => {
        let val = e.target.value;
        
        // Strip out characters that are not digits or slashes
        val = val.replace(/[^0-9/]/g, '');
        
        // Check if deleting (backspacing)
        const isDeleting = val.length < inputValue.length;
        
        if (!isDeleting) {
            const selectionStart = e.target.selectionStart;
            const isAtEnd = selectionStart === null || selectionStart === val.length;
            
            if (isAtEnd) {
                const clean = val.replace(/\//g, '');
                if (clean.length === 2 && val.length === 2) {
                    val = val + '/';
                } else if (clean.length === 4 && val.length === 5) {
                    val = val + '/';
                }
            }
        }
        
        // Limit to 10 characters
        if (val.length > 10) {
            val = val.substring(0, 10);
        }
        
        isTypingRef.current = true;
        setInputValue(val);
        
        // Try parsing only if it is complete (10 characters: DD/MM/YYYY)
        if (val.length === 10) {
            const parts = val.split('/');
            if (parts.length === 3) {
                const d = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10);
                const y = parseInt(parts[2], 10);
                
                if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 1000 && y <= 9999) {
                    const dateObj = new Date(y, m - 1, d);
                    // Ensure date is logically valid (e.g. not 31/02)
                    if (!isNaN(dateObj.getTime()) && dateObj.getDate() === d && dateObj.getMonth() === m - 1) {
                        const internalVal = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        onChange(internalVal);
                        setCurrentMonth(dateObj);
                        return;
                    }
                }
            }
        }
        
        // Clear parent selection if incomplete or invalid to prevent submitting stale/invalid dates
        onChange('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setIsOpen(false);
            e.preventDefault();
            syncTypedValue();
        }
        if (e.key === 'Tab') {
            setIsOpen(false);
            syncTypedValue();
        }
    };

    const handleMonthChange = (e) => {
        const monthIndex = parseInt(e.target.value, 10);
        const newDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
        setCurrentMonth(newDate);
    };

    const handleYearChange = (e) => {
        const year = parseInt(e.target.value, 10);
        const newDate = new Date(year, currentMonth.getMonth(), 1);
        setCurrentMonth(newDate);
    };

    const renderHeader = () => {
        const currentYearVal = currentMonth.getFullYear();
        const currentMonthVal = currentMonth.getMonth();
        
        const years = [];
        const startYear = new Date().getFullYear() - 5;
        for (let y = startYear; y <= startYear + 15; y++) {
            years.push(y);
        }

        return (
            <div className="flex justify-between items-center mb-4 px-1 gap-1">
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); prevMonth(); }}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors shrink-0"
                >
                    <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1 text-xs">
                    <select
                        value={currentMonthVal}
                        onChange={handleMonthChange}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent hover:bg-gray-50 border-0 outline-none font-bold text-gray-900 cursor-pointer py-1 px-1.5 rounded-lg text-xs"
                    >
                        {Array.from({ length: 12 }).map((_, i) => (
                            <option key={i} value={i} className="text-gray-900 bg-white">
                                {format(new Date(2026, i, 1), 'MMM')}
                            </option>
                        ))}
                    </select>
                    
                    <select
                        value={currentYearVal}
                        onChange={handleYearChange}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-transparent hover:bg-gray-50 border-0 outline-none font-bold text-gray-900 cursor-pointer py-1 px-1.5 rounded-lg text-xs"
                    >
                        {years.map(y => (
                            <option key={y} value={y} className="text-gray-900 bg-white">
                                {y}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); nextMonth(); }}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors shrink-0"
                >
                    <ChevronRight size={18} />
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

                const isSelected = selectedDate ? isSameDay(day, parseLocalDate(selectedDate)) : false;
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                days.push(
                    <div
                        key={day}
                        onClick={(e) => { e.stopPropagation(); if (isCurrentMonth) onDateClick(cloneDay); }}
                        className={`
                            relative h-9 w-9 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all duration-200
                            ${!isCurrentMonth ? "text-gray-200 pointer-events-none" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium"}
                            ${isSelected ? "bg-emerald-600 text-white font-bold hover:bg-emerald-700 hover:text-white" : ""}
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
        <div className={`relative ${fullWidth ? 'w-full' : 'w-44'} ${className}`} ref={containerRef}>
            <div
                className={`
                    flex items-center justify-between transition-all group
                    ${fullWidth
                        ? `w-full px-5 py-3 bg-white border rounded-2xl text-sm ${
                            error ? 'border-rose-300' : 'border-gray-200'
                          } ${isOpen ? 'border-emerald-500' : 'hover:border-gray-300'}`
                        : `w-44 pl-3 pr-2 py-2.5 bg-gray-50 border rounded-lg text-sm font-bold ${
                            isOpen ? 'border-emerald-500 bg-white' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100/50'
                          }`
                    }
                `}
            >
                <div className="flex items-center gap-2.5 overflow-hidden w-full">
                    <Calendar
                        size={fullWidth ? 18 : 16}
                        className={`transition-colors shrink-0 ${isOpen || selectedDate ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-500'} cursor-pointer`}
                        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                        strokeWidth={2.5}
                    />
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        className={`
                            bg-transparent outline-none border-none p-0 w-full text-gray-900 transition-all font-semibold
                            ${fullWidth ? 'text-sm' : 'text-xs'}
                            placeholder:text-gray-400 placeholder:font-normal
                        `}
                    />
                </div>

                <div
                    onClick={selectedDate ? clearDate : (e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                    className={`
                        p-1 rounded-full transition-all shrink-0 cursor-pointer
                        ${selectedDate
                            ? 'text-gray-400 hover:bg-rose-50 hover:text-rose-500'
                            : 'text-gray-200'}
                    `}
                >
                    {selectedDate ? (
                        <X size={fullWidth ? 16 : 14} strokeWidth={2.5} />
                    ) : (
                        <ChevronDown size={fullWidth ? 16 : 14} strokeWidth={2.5} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    )}
                </div>
            </div>

            {/* Dropdown Calendar */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-2xl z-50 p-4 w-[280px] animate-calendar-open">
                    {renderHeader()}
                    {renderDays()}
                    {renderCells()}
                </div>
            )}
        </div>
    );
};

export default DatePicker;
