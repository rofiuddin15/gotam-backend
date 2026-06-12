import React, { useState, useEffect } from 'react';
import { 
    History, 
    User, 
    Calendar, 
    Terminal, 
    Database, 
    ShieldAlert,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Eye,
    Clock,
    Activity
} from 'lucide-react';
import api from '../utils/api';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/logs?page=${page}`);
            setLogs(res.data.data);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total
            });
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getModuleColor = (module) => {
        switch (module.toLowerCase()) {
            case 'financial': return 'bg-green-50 text-green-600 border-green-100';
            case 'users': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'services': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'partners': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-surface-container text-on-surface-variant border-outline-variant/10';
        }
    };

    const moduleLabels = {
        financial: 'Keuangan',
        users: 'Pengguna',
        services: 'Layanan',
        partners: 'Mitra'
    };

    const actionLabels = {
        create: 'tambah',
        update: 'ubah',
        delete: 'hapus',
        approve: 'setujui',
        reject: 'tolak',
        login: 'masuk',
        logout: 'keluar'
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-[32px] font-bold text-on-background tracking-tight">Riwayat Audit</h2>
                    <p className="text-[16px] text-on-surface-variant font-medium">Pantau semua aktivitas administratif dan perubahan platform.</p>
                </div>
            </div>

            {/* Logs Table Area */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col overflow-hidden mb-10">
                <div className="p-8 border-b border-outline-variant/20 bg-surface-bright flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary-fixed text-primary rounded-xl">
                            <History size={20} />
                        </div>
                        <h3 className="text-[20px] font-bold text-primary">Log Aktivitas Sistem</h3>
                    </div>
                    <button className="text-[12px] font-bold text-primary hover:underline transition-colors">Ekspor Seluruh Riwayat</button>
                </div>

                <div className="overflow-x-auto w-full">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loader2 className="animate-spin text-secondary-container" size={32} />
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                                    <th className="px-4 py-2 font-bold">Waktu</th>
                                    <th className="px-4 py-2 font-bold">Aktor</th>
                                    <th className="px-4 py-2 font-bold">Modul</th>
                                    <th className="px-4 py-2 font-bold">Tindakan</th>
                                    <th className="px-4 py-2 font-bold">Keterangan</th>
                                    <th className="px-4 py-2 font-bold text-right">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px] divide-y divide-outline-variant/10">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-surface-container-low transition-colors group">
                                        <td className="px-4 py-1.5">
                                            <div className="flex items-center gap-2 text-on-surface-variant font-semibold text-[13px]">
                                                <Clock size={14} className="text-outline" />
                                                {new Date(log.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-outline">
                                                    <User size={14} />
                                                </div>
                                                <span className="font-bold text-primary">{log.user?.name || 'Sistem Otomatis'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getModuleColor(log.module)}`}>
                                                {moduleLabels[log.module.toLowerCase()] || log.module}
                                            </span>
                                        </td>
                                        <td className="px-4 py-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                                                <span className="font-bold text-on-surface capitalize">
                                                    {actionLabels[log.action.toLowerCase()] || log.action}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5">
                                            <p className="text-[13px] font-medium text-on-surface-variant max-w-xs truncate" title={log.description}>
                                                {log.description}
                                            </p>
                                        </td>
                                        <td className="px-4 py-1.5 text-right">
                                            <button className="text-outline hover:text-primary transition-all p-1">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {pagination && (
                    <div className="p-8 border-t border-outline-variant/20 flex items-center justify-between bg-surface-bright">
                        <p className="text-[12px] font-bold text-on-surface-variant">
                            Halaman <span className="text-primary">{pagination.current_page}</span> dari {pagination.last_page}
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="p-2.5 border border-outline-variant/30 rounded-xl text-outline hover:text-primary transition-all disabled:opacity-30"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button 
                                onClick={() => setPage(page + 1)}
                                disabled={page === pagination.last_page}
                                className="p-2.5 border border-outline-variant/30 rounded-xl text-outline hover:text-primary transition-all disabled:opacity-30"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
