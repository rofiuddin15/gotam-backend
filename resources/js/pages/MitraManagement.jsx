import React, { useEffect, useState } from 'react';
import { 
    Search, 
    Filter, 
    ChevronLeft, 
    ChevronRight,
    Building2,
    Clock,
    Loader2,
    Mail,
    Phone,
    MapPin,
    Shield,
    X,
    Coins,
    CheckCircle2,
    Wrench,
    Map
} from 'lucide-react';
import api from '../utils/api';

const MitraManagement = () => {
    const [partners, setPartners] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [localSearch, setLocalSearch] = useState('');
    const [page, setPage] = useState(1);

    // Detail Modal states
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [selectedPartnerLoading, setSelectedPartnerLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users', {
                params: {
                    role: 'partner',
                    search,
                    page
                }
            });
            setPartners(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
                from: response.data.from,
                to: response.data.to,
            });
        } catch (error) {
            console.error('Error fetching partners', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [search, page]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearch(localSearch);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleViewDetail = async (id) => {
        setSelectedPartnerLoading(true);
        setModalVisible(true);
        try {
            const response = await api.get(`/admin/users/${id}`);
            setSelectedPartner(response.data);
        } catch (error) {
            console.error('Error fetching partner details', error);
            setModalVisible(false);
        } finally {
            setSelectedPartnerLoading(false);
        }
    };

    const formatPrice = (val) => {
        return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        return `https://gotam.umediatama.com/storage/${path}`;
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-[32px] font-bold text-on-background tracking-tight">Manajemen Mitra</h2>
                    <p className="text-[16px] text-on-surface-variant font-medium">Kelola dan lihat profil lengkap serta katalog layanan mitra terdaftar.</p>
                </div>
            </div>

            {/* Main Content Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col overflow-hidden mb-10">
                {/* Filters Header */}
                <div className="p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-bright">
                    <div className="flex items-center gap-2">
                        <span className="px-4 py-2 bg-primary-fixed text-on-primary-fixed-variant rounded-lg text-[12px] font-bold">
                            Total Mitra: {pagination?.total || 0}
                        </span>
                    </div>

                    <form onSubmit={handleSearchSubmit} className="flex items-center space-x-4">
                        <div className="relative w-80">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-outline">
                                <Search size={18} />
                            </span>
                            <input 
                                type="text" 
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="block w-full pl-11 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] placeholder:text-outline focus:ring-2 focus:ring-primary/10 transition-all" 
                                placeholder="Cari mitra berdasarkan nama atau email..."
                            />
                        </div>
                        <button type="submit" className="p-2.5 text-primary hover:bg-primary-fixed border border-primary rounded-xl transition-all active:scale-90">
                            <Filter size={20} />
                        </button>
                    </form>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto w-full">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loader2 className="animate-spin text-secondary-container" size={32} />
                        </div>
                    ) : partners.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center">
                                <Building2 className="text-outline" size={32} />
                            </div>
                            <p className="text-on-surface-variant font-bold">Tidak ada mitra terdaftar yang ditemukan.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant text-[12px] uppercase tracking-widest border-b border-outline-variant/30">
                                    <th className="px-10 py-5 font-bold">Nama Bengkel / Mitra</th>
                                    <th className="px-10 py-5 font-bold">Keahlian</th>
                                    <th className="px-10 py-5 font-bold">Layanan</th>
                                    <th className="px-10 py-5 font-bold text-center">Status</th>
                                    <th className="px-10 py-5 font-bold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px] divide-y divide-outline-variant/10">
                                {partners.map((partner) => {
                                    const profile = partner.mitra_profile || partner.mitraProfile;
                                    const capability = profile?.vehicle_type_capability || 'Tidak ditentukan';
                                    const isMobile = profile?.is_mobile ? 'Bisa Dipanggil (Mobile)' : 'Hanya Bengkel';
                                    const isVerified = profile?.status_verified;
                                    const isOnline = profile?.is_online;

                                    return (
                                        <tr key={partner.id} className="hover:bg-surface-container-low transition-colors group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={getImageUrl(profile?.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'} 
                                                        className="h-10 w-10 rounded-xl object-cover border border-outline-variant/30"
                                                        alt={partner.name}
                                                    />
                                                    <div>
                                                        <p className="font-bold text-primary leading-tight">{partner.name}</p>
                                                        <p className="text-[12px] font-semibold text-on-surface-variant mt-0.5">{partner.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                    {capability}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="font-semibold text-on-surface-variant text-[12px]">
                                                    {isMobile}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6 text-center">
                                                <div className="flex flex-col gap-1 items-center">
                                                    {isVerified ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
                                                            Terverifikasi
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                            Pending
                                                        </span>
                                                    )}
                                                    {isOnline ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-500 mt-1">
                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                            Online
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-outline mt-1">
                                                            <div className="w-1.5 h-1.5 bg-outline rounded-full"></div>
                                                            Offline
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button 
                                                    onClick={() => handleViewDetail(partner.id)}
                                                    className="bg-primary-fixed hover:bg-primary hover:text-white text-primary font-bold px-4 py-2 rounded-lg text-[12px] transition-all active:scale-95 shadow-sm"
                                                >
                                                    Detil
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {pagination && (
                    <div className="p-8 border-t border-outline-variant/20 flex items-center justify-between bg-surface-bright">
                        <p className="text-[12px] font-bold text-on-surface-variant">
                            Menampilkan <span className="text-primary">{pagination.from || 0} sampai {pagination.to || 0}</span> dari {pagination.total} mitra
                        </p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="p-2.5 border border-outline-variant/30 rounded-xl text-outline hover:text-primary transition-all disabled:opacity-30"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button 
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="p-2.5 border border-outline-variant/30 rounded-xl text-outline hover:text-primary transition-all disabled:opacity-30"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {modalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface-container-lowest rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-outline-variant/30">
                        {/* Modal Header */}
                        <div className="px-8 py-5 border-b border-outline-variant/20 flex justify-between items-center bg-surface-bright">
                            <h3 className="text-[20px] font-bold text-primary flex items-center gap-2">
                                <Building2 size={22} />
                                <span>Detail Profil & Layanan Mitra</span>
                            </h3>
                            <button 
                                onClick={() => setModalVisible(false)}
                                className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {selectedPartnerLoading ? (
                                <div className="py-24 flex flex-col items-center gap-3">
                                    <Loader2 className="animate-spin text-primary" size={40} />
                                    <p className="text-on-surface-variant font-semibold">Memuat informasi mitra...</p>
                                </div>
                            ) : selectedPartner ? (
                                <div className="flex flex-col gap-8">
                                    
                                    {/* Profile Banner & Info */}
                                    <div className="relative rounded-xl overflow-hidden border border-outline-variant/30">
                                        <div className="h-44 bg-surface-container-high relative">
                                            <img 
                                                src={getImageUrl(selectedPartner.mitra_profile?.banner) || 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&auto=format&fit=crop'} 
                                                className="w-full h-full object-cover"
                                                alt="Banner"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                                        </div>
                                        
                                        <div className="p-6 bg-surface-bright flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-10 relative z-10">
                                            <img 
                                                src={getImageUrl(selectedPartner.mitra_profile?.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'} 
                                                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                                                alt="Avatar"
                                            />
                                            <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <h4 className="text-2xl font-bold text-primary">{selectedPartner.name}</h4>
                                                    <div className="flex justify-center gap-2 mt-1 sm:mt-0">
                                                        {selectedPartner.mitra_profile?.status_verified ? (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                                                Verified
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                                Unverified
                                                            </span>
                                                        )}
                                                        {selectedPartner.mitra_profile?.is_online ? (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white border border-green-600">
                                                                Online
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-400 text-white border border-slate-500">
                                                                Offline
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-on-surface-variant font-medium text-[14px] mt-1">
                                                    Mekanik / Partner GoTam
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detail Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Contact & Capability */}
                                        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-4">
                                            <h5 className="font-bold text-primary text-[15px] border-b border-outline-variant/30 pb-2">Informasi Akun</h5>
                                            
                                            <div className="flex items-center gap-3 text-on-surface">
                                                <Mail size={18} className="text-outline" />
                                                <div>
                                                    <p className="text-[11px] font-bold text-on-surface-variant">Email</p>
                                                    <p className="font-semibold">{selectedPartner.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-on-surface">
                                                <Phone size={18} className="text-outline" />
                                                <div>
                                                    <p className="text-[11px] font-bold text-on-surface-variant">Nomor Telepon</p>
                                                    <p className="font-semibold">{selectedPartner.phone}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-on-surface">
                                                <Wrench size={18} className="text-outline" />
                                                <div>
                                                    <p className="text-[11px] font-bold text-on-surface-variant">Kemampuan Kendaraan</p>
                                                    <p className="font-semibold">{selectedPartner.mitra_profile?.vehicle_type_capability || 'Tidak ada'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Operating & Wallet */}
                                        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-4">
                                            <h5 className="font-bold text-primary text-[15px] border-b border-outline-variant/30 pb-2">Dompet & Layanan</h5>

                                            <div className="flex items-center gap-3 text-on-surface">
                                                <Coins size={18} className="text-outline" />
                                                <div>
                                                    <p className="text-[11px] font-bold text-on-surface-variant">Saldo Dompet</p>
                                                    <p className="font-bold text-green-600 text-[16px]">{formatPrice(selectedPartner.wallet?.balance)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-on-surface">
                                                <MapPin size={18} className="text-outline" />
                                                <div>
                                                    <p className="text-[11px] font-bold text-on-surface-variant">Tipe Layanan</p>
                                                    <p className="font-semibold">
                                                        {selectedPartner.mitra_profile?.is_mobile ? 'Bisa Dipanggil (Mobile)' : 'Hanya Bengkel Standar'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-on-surface">
                                                <Map size={18} className="text-outline" />
                                                <div>
                                                    <p className="text-[11px] font-bold text-on-surface-variant">Koordinat Lokasi</p>
                                                    <p className="font-semibold text-xs">
                                                        {selectedPartner.mitra_profile?.lat ? `${selectedPartner.mitra_profile.lat}, ${selectedPartner.mitra_profile.lng}` : 'Tidak diketahui'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Catalog Services Section */}
                                    <div className="flex flex-col gap-4">
                                        <h5 className="font-bold text-primary text-[16px] border-b border-outline-variant/30 pb-2">
                                            Katalog Layanan & Produk ({selectedPartner.services?.length || 0})
                                        </h5>
                                        
                                        {!selectedPartner.services || selectedPartner.services.length === 0 ? (
                                            <div className="py-10 text-center bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col items-center gap-2">
                                                <Wrench className="text-outline" size={24} />
                                                <p className="text-on-surface-variant text-[13px] font-semibold">Mitra belum menambahkan layanan atau produk di katalog mereka.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {selectedPartner.services.map((service) => (
                                                    <div 
                                                        key={service.id} 
                                                        className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/20 flex gap-4 hover:shadow-sm transition-all"
                                                    >
                                                        <img 
                                                            src={getImageUrl(service.image) || 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=200&auto=format&fit=crop'} 
                                                            className="w-16 h-16 rounded-lg object-cover border border-outline-variant/30 bg-white"
                                                            alt={service.name}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <p className="font-bold text-primary truncate pr-2" title={service.name}>{service.name}</p>
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                                    service.is_available ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                                                                }`}>
                                                                    {service.is_available ? 'Tersedia' : 'Kosong'}
                                                                </span>
                                                            </div>
                                                            <p className="text-green-600 font-bold text-[13px] mt-1">{formatPrice(service.price)}</p>
                                                            <p className="text-[11px] text-on-surface-variant font-medium mt-1 truncate" title={service.description || 'Tidak ada deskripsi'}>
                                                                {service.description || 'Tidak ada deskripsi.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 border-t border-outline-variant/20 flex justify-end bg-surface-bright">
                            <button 
                                onClick={() => setModalVisible(false)}
                                className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl transition-all hover:bg-primary/95 active:scale-95 shadow-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MitraManagement;
