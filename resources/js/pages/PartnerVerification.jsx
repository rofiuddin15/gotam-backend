import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Search, 
    Filter, 
    ChevronLeft, 
    ChevronRight,
    Download,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    MapPin,
    Phone,
    User
} from 'lucide-react';
import { fetchPartnerRequests, verifyPartner } from '../store/slices/partnerSlice';

const PartnerVerification = () => {
    const dispatch = useDispatch();
    const { requests, loading } = useSelector((state) => state.partner);

    useEffect(() => {
        dispatch(fetchPartnerRequests());
    }, [dispatch]);

    const handleVerify = (id, status) => {
        const actionLabel = status === 'verified' ? 'menyetujui' : 'menolak';
        if (confirm(`Apakah Anda yakin ingin ${actionLabel} pendaftaran mitra ini?`)) {
            dispatch(verifyPartner({ id, status }));
        }
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-[32px] font-bold text-on-background tracking-tight">Verifikasi Mitra</h2>
                    <p className="text-[16px] text-on-surface-variant font-medium">Tinjau dan setujui permintaan pendaftaran bengkel baru.</p>
                </div>
                <button className="flex items-center gap-2 text-primary hover:bg-primary-fixed px-6 py-3 rounded-xl font-bold text-[14px] transition-colors border border-primary active:scale-95">
                    <Download size={20} />
                    <span>Ekspor Permintaan</span>
                </button>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col overflow-hidden">
                <div className="p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-bright">
                    <div className="flex bg-surface-container-low p-1 rounded-xl">
                        <button className="px-6 py-2.5 bg-white shadow-sm rounded-lg text-[12px] font-bold text-primary">Semua Tertunda</button>
                        <button className="px-6 py-2.5 text-[12px] font-bold text-on-surface-variant opacity-60">Butuh Tindakan</button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative w-64">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-outline">
                                <Search size={18} />
                            </span>
                            <input 
                                className="block w-full pl-11 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] placeholder:text-outline focus:ring-2 focus:ring-primary/10 transition-all" 
                                placeholder="Cari bengkel..."
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loader2 className="animate-spin text-secondary-container" size={32} />
                        </div>
                    ) : Array.isArray(requests) && requests.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider border-b border-outline-variant/30">
                                    <th className="px-4 py-2 font-bold">Nama Bengkel</th>
                                    <th className="px-4 py-2 font-bold">Detail Pemilik</th>
                                    <th className="px-4 py-2 font-bold">Tanggal Pendaftaran</th>
                                    <th className="px-4 py-2 font-bold">Dokumen Bisnis</th>
                                    <th className="px-4 py-2 font-bold text-right">Keputusan</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px] divide-y divide-outline-variant/10">
                                {requests.map((req) => (
                                    <tr key={req.id} className="hover:bg-surface-container-low transition-colors group">
                                        <td className="px-4 py-1.5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-tertiary-fixed text-on-tertiary-fixed rounded-xl flex items-center justify-center transition-all">
                                                    <Building2 size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary leading-tight">{req.name}</p>
                                                    <p className="text-[12px] font-semibold text-on-surface-variant mt-1 flex items-center gap-1">
                                                        <MapPin size={12} /> {req.email || "Alamat belum tersedia"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-bold text-on-surface flex items-center gap-2">
                                                    <User size={14} className="text-outline" /> {req.name}
                                                </p>
                                                <p className="text-[12px] font-semibold text-on-surface-variant flex items-center gap-2">
                                                    <Phone size={14} className="text-outline" /> {req.phone || "No HP belum tersedia"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5">
                                            <div className="flex items-center gap-2 text-on-surface font-semibold">
                                                <Calendar size={16} className="text-outline" />
                                                {new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-primary font-bold text-[11px] uppercase tracking-wider border border-outline-variant/30">
                                                <Clock size={12} />
                                                <span>Sedang Ditinjau</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleVerify(req.id, 'rejected')}
                                                    className="px-4 py-2 bg-error-container text-on-error-container rounded-lg text-[12px] font-bold hover:bg-error hover:text-white transition-all active:scale-95"
                                                >
                                                    Tolak
                                                </button>
                                                <button 
                                                    onClick={() => handleVerify(req.id, 'verified')}
                                                    className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg text-[12px] font-bold hover:bg-secondary hover:text-white transition-all active:scale-95 shadow-sm"
                                                >
                                                    Setujui
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center">
                                <CheckCircle2 className="text-outline" size={32} />
                            </div>
                            <p className="text-on-surface-variant font-bold">Semua selesai! Tidak ada permintaan verifikasi yang tertunda.</p>
                        </div>
                    )}
                </div>

                {Array.isArray(requests) && requests.length > 0 && (
                    <div className="p-8 border-t border-outline-variant/20 flex items-center justify-between bg-surface-bright">
                        <p className="text-[12px] font-bold text-on-surface-variant">
                            Menampilkan <span className="text-primary">{requests.length}</span> pendaftaran tertunda
                        </p>
                        <div className="flex items-center gap-2">
                            <button className="p-2.5 border border-outline-variant/30 rounded-xl text-outline hover:text-primary transition-all disabled:opacity-30">
                                <ChevronLeft size={20} />
                            </button>
                            <button className="p-2.5 border border-outline-variant/30 rounded-xl text-outline hover:text-primary transition-all disabled:opacity-30">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnerVerification;
