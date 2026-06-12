import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Receipt, 
    Wallet, 
    Wrench, 
    Handshake, 
    Activity, 
    Database, 
    Loader2
} from 'lucide-react';
import { fetchDashboardStats, fetchLiveMonitoring } from '../store/slices/dashboardSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { stats, monitoring, loading } = useSelector((state) => state.dashboard);

    const vehicleTypeLabels = {
        car: 'Mobil',
        motorcycle: 'Motor'
    };

    const tireTypeLabels = {
        tube: 'Ban Dalam',
        tubeless: 'Tubeless'
    };

    const statusLabels = {
        pending: 'Menunggu',
        accepted: 'Diterima',
        on_the_way: 'Dalam Perjalanan',
        arrived: 'Mekanik Tiba',
        working: 'Sedang Diperbaiki',
        completed: 'Selesai',
        cancelled: 'Dibatalkan'
    };


    useEffect(() => {
        dispatch(fetchDashboardStats());
        dispatch(fetchLiveMonitoring());
    }, [dispatch]);

    // Calculate chart data properties
    const chartData = stats?.revenue_chart || [];
    const maxChartValue = Math.max(...chartData.map(d => Number(d.value) || 0), 1);
    
    // Onboarding progress
    const verifiedOnboarding = stats?.onboarding?.verified || 0;
    const targetOnboarding = stats?.onboarding?.target || 100;
    const onboardingPercentage = Math.min((verifiedOnboarding / targetOnboarding) * 100, 100);

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h2 className="text-[32px] font-bold text-on-background tracking-tight">Ringkasan Dashboard</h2>
                <p className="text-[16px] text-on-surface-variant font-medium">Metrik waktu nyata (real-time) dan status operasional jaringan GoTam.</p>
            </div>

            {/* Metrics Grid (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric 1 */}
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                            <Receipt size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[14px] text-on-surface-variant font-medium">Total Transaksi</p>
                        <p className="text-[24px] font-bold text-primary mt-1">{stats?.stats?.total_transactions || '0'}</p>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-primary p-6 rounded-xl shadow-md border border-primary flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container rounded-full blur-2xl -mr-10 -mt-10 opacity-50"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="h-10 w-10 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
                            <Wallet size={20} />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[14px] text-primary-fixed-dim font-medium">Pendapatan Platform</p>
                        <p className="text-[24px] font-bold text-on-primary mt-1">{stats?.stats?.total_revenue || 'Rp 0'}</p>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                            <Wrench size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[14px] text-on-surface-variant font-medium">Pesanan Aktif</p>
                        <p className="text-[24px] font-bold text-primary mt-1">{stats?.stats?.active_bookings ?? '0'}</p>
                    </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col gap-3 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start">
                        <div className="h-10 w-10 rounded-lg bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                            <Handshake size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-[14px] text-on-surface-variant font-medium">Mitra Baru (30 hari)</p>
                        <p className="text-[24px] font-bold text-primary mt-1">{stats?.stats?.new_partners ?? '0'}</p>
                    </div>
                </div>
            </div>

            {/* Chart & Analytics Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart (Spans 2 cols) */}
                <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-[20px] font-bold text-primary">Tren Pendapatan Bulanan</h3>
                            <p className="text-[14px] text-on-surface-variant font-medium">Transaksi pemesanan terakhir</p>
                        </div>
                    </div>
                    
                    {/* Visual Chart Placeholder */}
                    <div className="flex-1 w-full min-h-[250px] relative mt-4 flex items-end justify-between px-2 pb-6 border-b border-outline-variant/20">
                        <div className="absolute inset-0 flex flex-col justify-between">
                            {[1, 2, 3, 4].map(i => <div key={i} className="border-t border-outline-variant/10 w-full flex-1"></div>)}
                        </div>
                        {chartData.length > 0 ? (
                            chartData.map((bar, i) => {
                                const value = Number(bar.value) || 0;
                                const heightPercentage = (value / maxChartValue) * 85;
                                return (
                                    <div 
                                        key={i} 
                                        className="w-[12%] rounded-t-sm transition-all relative group z-10 bg-gradient-to-t from-primary to-transparent hover:from-primary-fixed-dim" 
                                        style={{ height: `${Math.max(heightPercentage, 8)}%` }}
                                        title={`${bar.name}: Rp ${value.toLocaleString('id-ID')}`}
                                    >
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            Rp {value.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant text-[14px] font-bold">
                                Tidak ada data chart bulanan
                            </div>
                        )}
                        {/* X Axis Labels */}
                        <div className="absolute -bottom-6 w-full flex justify-between px-2 text-[12px] text-on-surface-variant font-bold">
                            {chartData.map((bar, i) => (
                                <span key={i} style={{ width: '12%', textAlign: 'center' }}>{bar.name}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col">
                    <h3 className="text-[20px] font-bold text-primary mb-6">Status Sistem</h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant">
                                <Activity size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-bold text-on-surface">Layanan Core API</p>
                                <p className="text-[12px] font-semibold text-on-surface-variant">{stats?.system_status?.api || '99.9%'}</p>
                            </div>
                            <span className="h-3 w-3 rounded-full bg-[#10b981]"></span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="h-12 w-12 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant">
                                <Database size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[14px] font-bold text-on-surface">Sinkronisasi DB Mitra</p>
                                <p className="text-[12px] font-semibold text-on-surface-variant">Menyinkronkan {stats?.system_status?.db || '45ms'}</p>
                            </div>
                            <span className="h-3 w-3 rounded-full bg-[#10b981]"></span>
                        </div>
                        <div className="mt-6 pt-6 border-t border-outline-variant/20">
                            <p className="text-[12px] font-black text-on-surface-variant mb-3 uppercase tracking-widest">STATUS KEAKTIFAN MITRA</p>
                            <div className="flex justify-between items-center text-[14px] font-bold text-on-surface">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]"></span>
                                    <span>Online / Siaga:</span>
                                </div>
                                <span className="text-primary font-extrabold">{stats?.stats?.partners_online ?? 0} Mekanik</span>
                            </div>
                            <div className="flex justify-between items-center text-[14px] font-bold text-on-surface mt-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="h-2.5 w-2.5 rounded-full bg-outline"></span>
                                    <span>Offline:</span>
                                </div>
                                <span className="text-on-surface-variant/80">{stats?.stats?.partners_offline ?? 0} Mekanik</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-outline-variant/20">
                            <p className="text-[12px] font-black text-on-surface-variant mb-3 uppercase tracking-widest">ALUR PENDAFTARAN MITRA</p>
                            <div className="w-full bg-surface-container rounded-full h-2 mb-2">
                                <div className="bg-primary h-2 rounded-full" style={{width: `${onboardingPercentage}%`}}></div>
                            </div>
                            <div className="flex justify-between text-[12px] font-bold text-on-surface-variant">
                                <span>{verifiedOnboarding} Terverifikasi</span>
                                <span>{targetOnboarding} Target</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Monitoring Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col overflow-hidden mb-10">
                <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-bright">
                    <div>
                        <h3 className="text-[20px] font-bold text-primary">Pemantauan Langsung (Live Monitoring)</h3>
                        <p className="text-[14px] text-on-surface-variant font-medium">Pesanan aktif terbaru di seluruh jaringan.</p>
                    </div>
                </div>
                <div className="overflow-x-auto w-full">
                    {loading && monitoring.length === 0 ? (
                        <div className="py-20 flex justify-center">
                            <Loader2 className="animate-spin text-secondary-container" size={32} />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant text-[12px] uppercase tracking-widest border-b border-outline-variant/30">
                                    <th className="p-4 font-bold w-24">ID</th>
                                    <th className="p-4 font-bold">Pelanggan</th>
                                    <th className="p-4 font-bold">Tipe Layanan</th>
                                    <th className="p-4 font-bold">Mitra Ditugaskan</th>
                                    <th className="p-4 font-bold text-center w-32">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px] divide-y divide-outline-variant/10">
                                {monitoring.length > 0 ? (
                                    monitoring.map((row, i) => (
                                        <tr key={i} className="hover:bg-surface-container-low transition-colors group">
                                            <td className="p-4 font-bold text-primary">#BK-{row.id}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold text-xs">
                                                        {row.customer?.name?.charAt(0) || 'C'}
                                                    </div>
                                                    <span className="text-on-surface font-semibold">{row.customer?.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-on-surface-variant font-medium">
                                                {(vehicleTypeLabels[row.service_category?.vehicle_type?.toLowerCase()] || row.service_category?.vehicle_type)} - {(tireTypeLabels[row.service_category?.tire_type?.toLowerCase()] || row.service_category?.tire_type?.replace('_', ' '))}
                                            </td>
                                            <td className="p-4 text-on-surface font-medium">
                                                {row.mitra?.name || <span className="text-amber-600 animate-pulse font-semibold">Mencari Mekanik...</span>}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap bg-secondary-container text-on-secondary-container capitalize`}>
                                                    {statusLabels[row.status?.toLowerCase()] || row.status?.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-on-surface-variant font-bold">
                                            Tidak ada pesanan aktif saat ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
