import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Receipt, 
    Wallet, 
    Wrench, 
    Handshake, 
    ChevronDown, 
    Filter, 
    MoreVertical,
    Activity,
    Database,
    Loader2
} from 'lucide-react';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { stats, loading } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    return (
        <div className="flex flex-col gap-10">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h2 className="text-[32px] font-bold text-on-background tracking-tight">Dashboard Overview</h2>
                <p className="text-[16px] text-on-surface-variant font-medium">Real-time metrics and operational status for GoTam network.</p>
            </div>

            {/* Metrics Grid (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric 1 */}
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                            <Receipt size={20} />
                        </div>
                        <span className="bg-surface-container p-1 rounded text-primary text-[12px] font-bold">+5.2%</span>
                    </div>
                    <div>
                        <p className="text-[14px] text-on-surface-variant font-medium">Total Transactions</p>
                        <p className="text-[24px] font-bold text-primary mt-1">{stats?.total_transactions?.toLocaleString() || '1,420'}</p>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-primary p-6 rounded-xl shadow-md border border-primary flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="h-10 w-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                            <Wallet size={20} />
                        </div>
                        <span className="bg-secondary p-1 rounded text-on-secondary text-[12px] font-bold">+12.4%</span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[14px] text-primary-fixed-dim font-medium">Total Revenue</p>
                        <p className="text-[24px] font-bold text-on-primary mt-1">Rp {stats?.total_revenue?.toLocaleString() || '124.5M'}</p>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                            <Wrench size={20} />
                        </div>
                        <span className="bg-error-container text-on-error-container p-1 rounded text-[12px] font-bold">-2.1%</span>
                    </div>
                    <div>
                        <p className="text-[14px] text-on-surface-variant font-medium">Active Bookings</p>
                        <p className="text-[24px] font-bold text-primary mt-1">{stats?.active_bookings || '84'}</p>
                    </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-lg bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                            <Handshake size={20} />
                        </div>
                        <span className="bg-surface-container p-1 rounded text-primary text-[12px] font-bold">+8.0%</span>
                    </div>
                    <div>
                        <p className="text-[14px] text-on-surface-variant font-medium">New Partners</p>
                        <p className="text-[24px] font-bold text-primary mt-1">{stats?.total_partners || '24'}</p>
                    </div>
                </div>
            </div>

            {/* Chart & Analytics Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart (Spans 2 cols) */}
                <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-[20px] font-bold text-primary">Monthly Revenue</h3>
                            <p className="text-[14px] text-on-surface-variant font-medium">Year to date performance</p>
                        </div>
                        <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-semibold text-[14px]">
                            Last 6 Months <ChevronDown size={16} />
                        </button>
                    </div>
                    
                    {/* Visual Chart Placeholder */}
                    <div className="flex-1 w-full min-h-[250px] relative mt-4 flex items-end justify-between px-2 pb-6 border-b border-outline-variant/20">
                        <div className="absolute inset-0 flex flex-col justify-between">
                            {[1, 2, 3, 4].map(i => <div key={i} className="border-t border-outline-variant/10 w-full flex-1"></div>)}
                        </div>
                        {[
                            { h: '40%', active: false },
                            { h: '55%', active: false },
                            { h: '45%', active: false },
                            { h: '70%', active: false },
                            { h: '60%', active: true },
                            { h: '85%', active: true },
                        ].map((bar, i) => (
                            <div 
                                key={i} 
                                className={`w-[12%] rounded-t-sm transition-all relative group z-10 ${bar.active ? 'bg-gradient-to-t from-secondary-container to-transparent border-t-2 border-secondary' : 'bg-gradient-to-t from-primary-fixed to-transparent'}`} 
                                style={{height: bar.h}}
                            ></div>
                        ))}
                        {/* X Axis Labels */}
                        <div className="absolute -bottom-6 w-full flex justify-between px-2 text-[12px] text-on-surface-variant font-bold">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => <span key={m}>{m}</span>)}
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col">
                    <h3 className="text-[20px] font-bold text-primary mb-6">System Status</h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
                                <Activity size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-bold text-on-surface">Core API Services</p>
                                <p className="text-[12px] font-semibold text-on-surface-variant">99.98% Uptime</p>
                            </div>
                            <span className="h-3 w-3 rounded-full bg-[#10b981]"></span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="h-12 w-12 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant">
                                <Database size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-bold text-on-surface">Partner Sync DB</p>
                                <p className="text-[12px] font-semibold text-on-surface-variant">Syncing 45ms</p>
                            </div>
                            <span className="h-3 w-3 rounded-full bg-[#10b981]"></span>
                        </div>
                        <div className="mt-6 pt-6 border-t border-outline-variant/20">
                            <p className="text-[12px] font-black text-on-surface-variant mb-3 uppercase tracking-widest">PARTNER ONBOARDING PIPELINE</p>
                            <div className="w-full bg-surface-container rounded-full h-2 mb-2">
                                <div className="bg-primary h-2 rounded-full" style={{width: '65%'}}></div>
                            </div>
                            <div className="flex justify-between text-[12px] font-bold text-on-surface-variant">
                                <span>65 Verified</span>
                                <span>100 Target</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Monitoring Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col overflow-hidden mb-10">
                <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-bright">
                    <div>
                        <h3 className="text-[20px] font-bold text-primary">Live Monitoring</h3>
                        <p className="text-[14px] text-on-surface-variant font-medium">Recent active bookings across network.</p>
                    </div>
                    <button className="text-primary hover:bg-primary-fixed px-4 py-2 rounded-lg font-bold text-[14px] transition-colors flex items-center gap-2 border border-primary active:scale-95">
                        <Filter size={16} /> Filter
                    </button>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container-low text-on-surface-variant text-[12px] uppercase tracking-widest border-b border-outline-variant/30">
                                <th className="p-4 font-bold w-24">ID</th>
                                <th className="p-4 font-bold">Customer</th>
                                <th className="p-4 font-bold">Service Type</th>
                                <th className="p-4 font-bold">Partner Assigned</th>
                                <th className="p-4 font-bold text-center w-32">Status</th>
                                <th className="p-4 font-bold text-right w-20">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] divide-y divide-outline-variant/10">
                            {[
                                { id: '#BK-9021', name: 'Ahmad Surya', type: 'Darurat - Mogok', partner: 'Auto Jaya Motor', status: 'Menuju Lokasi', statusColor: 'bg-secondary-container text-on-secondary-container' },
                                { id: '#BK-9020', name: 'Budi Wijaya', type: 'Servis Berkala 10k', partner: 'Berkah Mandiri', status: 'Dikerjakan', statusColor: 'bg-primary-fixed text-primary' },
                                { id: '#BK-9018', name: 'Citra Dewi', type: 'Ganti Oli & Filter', partner: 'Maju Mapan Auto', status: 'Dikerjakan', statusColor: 'bg-primary-fixed text-primary' },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-surface-container-low transition-colors group">
                                    <td className="p-4 font-bold text-primary">{row.id}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-xs">
                                                {row.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-on-surface font-semibold">{row.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-on-surface-variant font-medium">{row.type}</td>
                                    <td className="p-4 text-on-surface font-medium">{row.partner}</td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap ${row.statusColor}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-on-surface-variant hover:text-primary transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-surface-bright border-t border-outline-variant/20 flex justify-center">
                    <button className="text-primary font-bold text-[14px] hover:underline active:scale-95 transition-all">View All Active Bookings</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
