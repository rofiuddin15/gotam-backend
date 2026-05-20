import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, isDark = false }) => (
    <div className={`p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isDark 
        ? 'bg-[#0F172A] border-slate-800 text-white shadow-2xl shadow-slate-900/20' 
        : 'bg-white border-slate-100 text-slate-900 shadow-lg shadow-slate-200/40'
    }`}>
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <Icon size={24} className={isDark ? 'text-[#FFD700]' : 'text-slate-900'} />
            </div>
            {trend && (
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
                    trend.isPositive 
                    ? 'bg-green-50 text-green-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                    {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                </div>
            )}
        </div>
        <div>
            <p className={`text-sm font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                {label}
            </p>
            <h3 className="text-4xl font-black tracking-tight">{value}</h3>
        </div>
    </div>
);

export default StatCard;
