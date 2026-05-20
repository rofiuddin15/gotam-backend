import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    Shield, 
    Lock, 
    Plus, 
    CheckCircle2, 
    ChevronRight,
    Loader2,
    Key,
    ShieldAlert
} from 'lucide-react';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesRes, permsRes] = await Promise.all([
                api.get('/admin/roles'),
                api.get('/admin/permissions')
            ]);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
            if (rolesRes.data.length > 0) setSelectedRole(rolesRes.data[0]);
        } catch (error) {
            console.error('Failed to fetch RBAC data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePermission = async (permName) => {
        // Logic to sync with backend
        console.log(`Toggling ${permName} for ${selectedRole.name}`);
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <div>
                <h2 className="text-[32px] font-bold text-on-background tracking-tight">System Settings</h2>
                <p className="text-[16px] text-on-surface-variant font-medium">Manage administrative roles, staff permissions, and access control.</p>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="animate-spin text-secondary-container" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Roles List */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[14px] font-black text-on-surface-variant uppercase tracking-widest">Available Roles</h3>
                            <button className="text-primary hover:text-secondary font-bold text-[12px] flex items-center gap-1">
                                <Plus size={14} /> Add Role
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${
                                        selectedRole?.id === role.id 
                                        ? 'bg-secondary-container border-secondary text-on-secondary-container shadow-md' 
                                        : 'bg-white border-outline-variant/20 text-on-surface-variant hover:border-primary'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${selectedRole?.id === role.id ? 'bg-secondary/20' : 'bg-surface-container'}`}>
                                            <Shield size={18} />
                                        </div>
                                        <span className="font-bold text-[14px] capitalize">{role.name}</span>
                                    </div>
                                    <ChevronRight size={16} opacity={selectedRole?.id === role.id ? 1 : 0.3} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Permissions Grid */}
                    <div className="lg:col-span-2">
                        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 overflow-hidden">
                            <div className="p-8 border-b border-outline-variant/20 bg-surface-bright flex justify-between items-center">
                                <div>
                                    <h3 className="text-[20px] font-bold text-primary capitalize">{selectedRole?.name} Permissions</h3>
                                    <p className="text-[14px] text-on-surface-variant font-medium">Fine-tune what this role can see and do.</p>
                                </div>
                                <div className="p-3 bg-primary-fixed text-primary rounded-xl">
                                    <Lock size={20} />
                                </div>
                            </div>
                            
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {permissions.map((perm) => (
                                    <div 
                                        key={perm.id}
                                        onClick={() => handleTogglePermission(perm.name)}
                                        className="flex items-center justify-between p-4 rounded-xl border border-outline-variant/10 hover:bg-surface-container-low transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                                                <Key size={14} />
                                            </div>
                                            <span className="text-[13px] font-bold text-on-surface capitalize">{perm.name.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedRole?.permissions?.find(p => p.id === perm.id)
                                            ? 'bg-secondary border-secondary text-white'
                                            : 'border-outline-variant/30'
                                        }`}>
                                            {selectedRole?.permissions?.find(p => p.id === perm.id) && <CheckCircle2 size={12} />}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-surface-bright border-t border-outline-variant/20 flex justify-end gap-3">
                                <button className="px-6 py-2.5 rounded-lg text-[12px] font-bold text-on-surface-variant hover:bg-surface-container transition-all">Reset Changes</button>
                                <button className="px-8 py-2.5 bg-primary text-on-primary rounded-lg text-[12px] font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95">Save Permissions</button>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-4">
                            <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                            <p className="text-[12px] font-semibold text-amber-800">
                                <span className="font-bold">Security Note:</span> Modifying core permissions can affect platform stability. Ensure you understand the impact of granting administrative access to non-staff roles.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
