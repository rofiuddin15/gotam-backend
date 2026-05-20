import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    Download, 
    Filter, 
    CreditCard, 
    ArrowUpRight, 
    ArrowDownLeft,
    CheckCircle2,
    Clock,
    XCircle,
    Loader2,
    Banknote,
    TrendingUp
} from 'lucide-react';
import { fetchPendingWithdrawals, approveWithdrawal } from '../store/slices/transactionSlice';

const FinancialReports = () => {
    const dispatch = useDispatch();
    const { withdrawals, loading } = useSelector((state) => state.transaction);

    useEffect(() => {
        dispatch(fetchPendingWithdrawals());
    }, [dispatch]);

    const handleApprove = (id) => {
        if (confirm('Apakah Anda yakin ingin menyetujui penarikan dana ini?')) {
            dispatch(approveWithdrawal(id));
        }
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-[32px] font-bold text-on-background tracking-tight">Financial Reports</h2>
                    <p className="text-[16px] text-on-surface-variant font-medium">Manage payouts, track platform revenue, and monitor cashflow.</p>
                </div>
                <button className="flex items-center gap-2 text-primary hover:bg-primary-fixed px-6 py-3 rounded-xl font-bold text-[14px] transition-colors border border-primary active:scale-95">
                    <Download size={20} />
                    <span>Download Report</span>
                </button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Platform Revenue', value: 'Rp 45.2M', icon: <TrendingUp className="text-green-600" />, color: 'bg-green-50' },
                    { label: 'Total Payouts', value: 'Rp 12.8M', icon: <Banknote className="text-blue-600" />, color: 'bg-blue-50' },
                    { label: 'Pending Payouts', value: `Rp ${withdrawals.reduce((acc, w) => acc + Number(w.amount), 0).toLocaleString()}`, icon: <Clock className="text-amber-600" />, color: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[12px] font-black text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
                                <p className="text-[20px] font-bold text-primary mt-1">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending Withdrawals Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col overflow-hidden mb-10">
                <div className="p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-bright">
                    <div>
                        <h3 className="text-[20px] font-bold text-primary">Pending Payout Requests</h3>
                        <p className="text-[14px] text-on-surface-variant font-medium">Review and process partner withdrawal requests.</p>
                    </div>
                    <div className="flex bg-surface-container-low p-1 rounded-xl">
                        <button className="px-6 py-2.5 bg-white shadow-sm rounded-lg text-[12px] font-bold text-primary">All Pending</button>
                        <button className="px-6 py-2.5 text-[12px] font-bold text-on-surface-variant opacity-60">Processing</button>
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    {loading && withdrawals.length === 0 ? (
                        <div className="py-20 flex justify-center">
                            <Loader2 className="animate-spin text-secondary-container" size={32} />
                        </div>
                    ) : withdrawals.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-surface-container-low text-on-surface-variant text-[12px] uppercase tracking-widest border-b border-outline-variant/30">
                                    <th className="px-10 py-5 font-bold">Partner Name</th>
                                    <th className="px-10 py-5 font-bold">Amount</th>
                                    <th className="px-10 py-5 font-bold">Bank Details</th>
                                    <th className="px-10 py-5 font-bold">Request Date</th>
                                    <th className="px-10 py-5 font-bold text-right">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px] divide-y divide-outline-variant/10">
                                {withdrawals.map((item) => (
                                    <tr key={item.id} className="hover:bg-surface-container-low transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold">
                                                    {item.user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-primary leading-tight">{item.user?.name}</p>
                                                    <p className="text-[12px] font-semibold text-on-surface-variant mt-0.5">{item.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="font-bold text-[16px] text-primary">Rp {Number(item.amount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <p className="font-bold text-on-surface">{item.bank_name}</p>
                                            <p className="text-[12px] font-semibold text-on-surface-variant">{item.account_number} • {item.account_name}</p>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-2 text-on-surface-variant font-semibold">
                                                <Clock size={16} className="text-outline" />
                                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <button 
                                                onClick={() => handleApprove(item.id)}
                                                className="px-6 py-2.5 bg-secondary-container text-on-secondary-container rounded-lg text-[12px] font-bold hover:bg-secondary hover:text-white transition-all active:scale-95 shadow-sm"
                                            >
                                                Process Payout
                                            </button>
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
                            <p className="text-on-surface-variant font-bold">Great! No pending payout requests at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;
