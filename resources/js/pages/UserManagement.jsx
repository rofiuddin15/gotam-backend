import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Search, 
    Filter, 
    ChevronLeft, 
    ChevronRight,
    UserPlus,
    UserCircle,
    Shield,
    Clock,
    Loader2,
    Mail,
    Phone
} from 'lucide-react';
import { fetchUsers, setFilters } from '../store/slices/userSlice';

const UserManagement = () => {
    const dispatch = useDispatch();
    const { users, pagination, loading, filters } = useSelector((state) => state.user);
    const [localSearch, setLocalSearch] = useState(filters.search);

    useEffect(() => {
        dispatch(fetchUsers({ ...filters, page: 1 }));
    }, [dispatch, filters.role]);

    const handleSearch = (e) => {
        e.preventDefault();
        dispatch(setFilters({ search: localSearch }));
        dispatch(fetchUsers({ ...filters, search: localSearch, page: 1 }));
    };

    const handleRoleFilter = (role) => {
        dispatch(setFilters({ role }));
    };

    const handlePageChange = (page) => {
        dispatch(fetchUsers({ ...filters, page }));
    };

    const roleLabels = {
        admin: 'Staf Admin',
        customer: 'Pelanggan',
        partner: 'Mitra'
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-[32px] font-bold text-on-background tracking-tight">Manajemen Pengguna</h2>
                    <p className="text-[16px] text-on-surface-variant font-medium">Kelola pengguna platform, peran staf, dan izin akun.</p>
                </div>
                <button className="bg-primary text-on-primary font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm active:scale-95">
                    <UserPlus size={20} />
                    <span>Tambah Staf Baru</span>
                </button>
            </div>

            {/* Main Content Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col overflow-hidden mb-10">
                {/* Filters Header */}
                <div className="p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-bright">
                    <div className="flex bg-surface-container-low p-1 rounded-xl">
                        {[
                            { label: 'Semua Pengguna', value: '' },
                            { label: 'Pelanggan', value: 'customer' },
                            { label: 'Mitra', value: 'partner' },
                            { label: 'Staf', value: 'admin' }
                        ].map((role) => (
                            <button 
                                key={role.value}
                                onClick={() => handleRoleFilter(role.value)}
                                className={`px-6 py-2.5 rounded-lg text-[12px] font-bold transition-all ${
                                    filters.role === role.value 
                                    ? 'bg-white shadow-sm text-primary' 
                                    : 'text-on-surface-variant opacity-60 hover:opacity-100'
                                }`}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="flex items-center space-x-4">
                        <div className="relative w-80">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-outline">
                                <Search size={18} />
                            </span>
                            <input 
                                type="text" 
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="block w-full pl-11 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] placeholder:text-outline focus:ring-2 focus:ring-primary/10 transition-all" 
                                placeholder="Cari berdasarkan nama atau email..."
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
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant text-[12px] uppercase tracking-widest border-b border-outline-variant/30">
                                    <th className="px-10 py-5 font-bold">Pengguna</th>
                                    <th className="px-10 py-5 font-bold">Peran & Izin</th>
                                    <th className="px-10 py-5 font-bold">Kontak</th>
                                    <th className="px-10 py-5 font-bold text-center">Status</th>
                                    <th className="px-10 py-5 font-bold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px] divide-y divide-outline-variant/10">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-surface-container-low transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold text-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary leading-tight">{user.name}</p>
                                                    <p className="text-[12px] font-semibold text-on-surface-variant mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                    user.roles?.[0]?.name === 'admin' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container text-on-surface-variant'
                                                }`}>
                                                    {roleLabels[user.roles?.[0]?.name] || user.roles?.[0]?.name || 'Pengguna'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-1 text-[12px] font-semibold text-on-surface-variant">
                                                <div className="flex items-center gap-2">
                                                    <Phone size={12} className="text-outline" /> {user.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            {user.roles?.[0]?.name === 'partner' ? (
                                                (user.mitra_profile?.status_verified || user.mitraProfile?.status_verified) ? (
                                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                        Terverifikasi
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                                        Pending Verifikasi
                                                    </span>
                                                )
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                    Aktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button className="text-primary font-bold hover:underline transition-all active:scale-95">
                                                Kelola
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
                            Menampilkan <span className="text-primary">{pagination.from || 0} sampai {pagination.to || 0}</span> dari {pagination.total} pengguna
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
        </div>
    );
};

export default UserManagement;
