import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Upload, 
    Trash2, 
    Edit3, 
    Plus, 
    Search,
    CloudUpload,
    Wrench,
    CheckCircle2,
    XCircle,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';
import { fetchCategories, deleteCategory } from '../store/slices/serviceSlice';

const ServiceContent = () => {
    const dispatch = useDispatch();
    const { categories, loading } = useSelector((state) => state.service);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus kategori layanan ini?')) {
            dispatch(deleteCategory(id));
        }
    };

    const filteredCategories = Array.isArray(categories) 
        ? categories.filter(c => c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : [];

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <div>
                <h2 className="text-[32px] font-bold text-on-background tracking-tight">Content Management</h2>
                <p className="text-[16px] text-on-surface-variant font-medium">Update promotional materials and standardize service pricing.</p>
            </div>

            {/* Promo Banners Section */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-[20px] font-bold text-primary">Promo Banners</h3>
                        <p className="text-[14px] text-on-surface-variant font-medium">Manage carousel banners for consumer app homepage.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Card */}
                    <div className="lg:col-span-2 border-2 border-dashed border-outline-variant/30 rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-surface-container transition-all cursor-pointer group">
                        <div className="w-16 h-16 bg-primary text-secondary-container rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <CloudUpload size={28} />
                        </div>
                        <div className="text-center">
                            <h4 className="text-[16px] font-bold text-primary">Click to upload or drag and drop</h4>
                            <p className="text-[12px] font-semibold text-outline mt-1">SVG, PNG, JPG (MAX. 1200×600px)</p>
                        </div>
                    </div>

                    {/* Preview Area */}
                    <div className="space-y-4">
                        <div className="relative group overflow-hidden rounded-xl border border-outline-variant/20 shadow-sm">
                            <img 
                                src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=400&auto=format&fit=crop" 
                                className="w-full h-40 object-cover"
                                alt="Banner"
                            />
                            <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="p-2 bg-white text-primary rounded-lg shadow-xl"><Edit3 size={16} /></button>
                                <button className="p-2 bg-white text-error rounded-lg shadow-xl"><Trash2 size={16} /></button>
                            </div>
                            <div className="absolute top-3 right-3">
                                <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-black uppercase rounded-full">Live</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Categories Section */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col overflow-hidden mb-10">
                <div className="p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-bright">
                    <div>
                        <h3 className="text-[20px] font-bold text-primary">Service Categories</h3>
                        <p className="text-[14px] text-on-surface-variant font-medium">Standard baseline pricing for all partners.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-outline">
                                <Search size={18} />
                            </span>
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-11 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] placeholder:text-outline focus:ring-2 focus:ring-primary/10 transition-all" 
                                placeholder="Search services..."
                            />
                        </div>
                        <button className="bg-primary text-on-primary font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm active:scale-95">
                            <Plus size={18} />
                            <span>Add New</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loader2 className="animate-spin text-secondary-container" size={32} />
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant text-[12px] uppercase tracking-widest border-b border-outline-variant/30">
                                    <th className="px-10 py-5 font-bold">Category Name</th>
                                    <th className="px-10 py-5 font-bold">Base Pricing</th>
                                    <th className="px-10 py-5 font-bold">Vehicle Type</th>
                                    <th className="px-10 py-5 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px] divide-y divide-outline-variant/10">
                                {filteredCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-surface-container-low transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-tertiary-fixed text-on-tertiary-fixed rounded-xl flex items-center justify-center font-bold">
                                                    <Wrench size={20} />
                                                </div>
                                                <span className="font-bold text-primary">{cat.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="font-bold text-on-surface">Rp {Number(cat.base_price).toLocaleString()}</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-primary-fixed text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider">{cat.vehicle_type}</span>
                                                <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-lg text-[10px] font-bold uppercase tracking-wider">{cat.tire_type?.replace('_', ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button className="text-outline hover:text-primary transition-all p-1"><Edit3 size={18} /></button>
                                                <button 
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="text-outline hover:text-error transition-all p-1"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceContent;
