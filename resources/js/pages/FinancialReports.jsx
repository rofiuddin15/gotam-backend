import React, { useEffect, useState } from 'react';
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
    TrendingUp,
    Search
} from 'lucide-react';
import { 
    fetchPendingWithdrawals, 
    approveWithdrawal, 
    rejectWithdrawal, 
    fetchFinancialReports,
    fetchCashFlow,
    fetchWithdrawalsReport
} from '../store/slices/transactionSlice';

const FinancialReports = () => {
    const dispatch = useDispatch();
    
    // Select state from Redux
    const { 
        withdrawals, 
        financialReport, 
        cashFlowData, 
        withdrawalsReportData, 
        loading 
    } = useSelector((state) => state.transaction);

    // Active tab state: 'payouts', 'cash-flow', 'deposits', 'withdrawals'
    const [activeTab, setActiveTab] = useState('payouts');

    // Filter states
    const [cashFlowPage, setCashFlowPage] = useState(1);
    const [cfSearchInput, setCfSearchInput] = useState('');
    const [cashFlowSearch, setCashFlowSearch] = useState('');
    const [cashFlowType, setCashFlowType] = useState('');

    const [depositPage, setDepositPage] = useState(1);
    const [depSearchInput, setDepSearchInput] = useState('');
    const [depositSearch, setDepositSearch] = useState('');

    const [withdrawalsPage, setWithdrawalsPage] = useState(1);
    const [wSearchInput, setWSearchInput] = useState('');
    const [withdrawalsSearch, setWithdrawalsSearch] = useState('');
    const [withdrawalsStatus, setWithdrawalsStatus] = useState('');

    // Fetch initial Overview Cards & Payout Requests
    useEffect(() => {
        dispatch(fetchFinancialReports());
    }, [dispatch]);

    // Reactively fetch data when active tab or filters change
    useEffect(() => {
        if (activeTab === 'payouts') {
            dispatch(fetchPendingWithdrawals());
        } else if (activeTab === 'cash-flow') {
            dispatch(fetchCashFlow({ 
                page: cashFlowPage, 
                search: cashFlowSearch, 
                type: cashFlowType 
            }));
        } else if (activeTab === 'deposits') {
            dispatch(fetchCashFlow({ 
                page: depositPage, 
                search: depositSearch, 
                type: 'deposit' 
            }));
        } else if (activeTab === 'withdrawals') {
            dispatch(fetchWithdrawalsReport({ 
                page: withdrawalsPage, 
                search: withdrawalsSearch, 
                status: withdrawalsStatus 
            }));
        }
    }, [
        dispatch, 
        activeTab, 
        cashFlowPage, 
        cashFlowSearch, 
        cashFlowType, 
        depositPage, 
        depositSearch, 
        withdrawalsPage, 
        withdrawalsSearch, 
        withdrawalsStatus
    ]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        // Reset pages and searches on tab change to prevent overlaps
        setCfSearchInput('');
        setDepSearchInput('');
        setWSearchInput('');
        setCashFlowSearch('');
        setDepositSearch('');
        setWithdrawalsSearch('');
        setCashFlowPage(1);
        setDepositPage(1);
        setWithdrawalsPage(1);
    };

    const handleApprove = (id) => {
        if (confirm('Apakah Anda yakin ingin menyetujui penarikan dana ini?')) {
            dispatch(approveWithdrawal(id)).then(() => {
                dispatch(fetchFinancialReports());
                if (activeTab === 'withdrawals') {
                    dispatch(fetchWithdrawalsReport({ 
                        page: withdrawalsPage, 
                        search: withdrawalsSearch, 
                        status: withdrawalsStatus 
                    }));
                }
            });
        }
    };

    const handleReject = (id) => {
        const reason = prompt('Masukkan alasan penolakan penarikan dana ini (Refund otomatis):');
        if (reason) {
            dispatch(rejectWithdrawal({ id, admin_notes: reason })).then(() => {
                dispatch(fetchFinancialReports());
                if (activeTab === 'withdrawals') {
                    dispatch(fetchWithdrawalsReport({ 
                        page: withdrawalsPage, 
                        search: withdrawalsSearch, 
                        status: withdrawalsStatus 
                    }));
                }
            });
        }
    };

    // CSV Downloader
    const handleDownloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        let filename = "";
        
        if (activeTab === 'payouts') {
            filename = "payout_requests.csv";
            csvContent += "ID,Name,Email,Amount,Bank,Account Number,Account Name,Date\n";
            withdrawals.forEach(w => {
                csvContent += `"${w.id}","${w.user?.name}","${w.user?.email}","${w.amount}","${w.bank_name}","${w.account_number}","${w.account_name}","${w.created_at}"\n`;
            });
        } else if (activeTab === 'cash-flow') {
            filename = "cash_flow_ledger.csv";
            csvContent += "ID,Date,User,Role,Type,Amount,Description\n";
            cashFlowData?.data?.forEach(item => {
                csvContent += `"${item.id}","${item.created_at}","${item.wallet?.user?.name || 'System'}","${item.wallet?.user?.role || 'system'}","${item.type}","${item.amount}","${item.description}"\n`;
            });
        } else if (activeTab === 'deposits') {
            filename = "deposit_incoming_report.csv";
            csvContent += "ID,Date,User,Role,Amount,Description\n";
            cashFlowData?.data?.forEach(item => {
                csvContent += `"${item.id}","${item.created_at}","${item.wallet?.user?.name || 'System'}","${item.wallet?.user?.role || 'system'}","${item.amount}","${item.description}"\n`;
            });
        } else if (activeTab === 'withdrawals') {
            filename = "withdrawals_outgoing_report.csv";
            csvContent += "ID,Date,User,Role,Amount,Bank,Account Number,Account Name,Status,Admin Notes\n";
            withdrawalsReportData?.data?.forEach(w => {
                csvContent += `"${w.id}","${w.created_at}","${w.user?.name || ''}","${w.user?.role || ''}","${w.amount}","${w.bank_name}","${w.account_number}","${w.account_name}","${w.status}","${w.admin_notes || ''}"\n`;
            });
        }
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter submit handlers
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'cash-flow') {
            setCashFlowSearch(cfSearchInput);
            setCashFlowPage(1);
        } else if (activeTab === 'deposits') {
            setDepositSearch(depSearchInput);
            setDepositPage(1);
        } else if (activeTab === 'withdrawals') {
            setWithdrawalsSearch(wSearchInput);
            setWithdrawalsPage(1);
        }
    };

    const renderTypeBadge = (type) => {
        switch (type) {
            case 'deposit':
                return <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-extrabold capitalize">Top-up</span>;
            case 'withdrawal':
                return <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-[11px] font-extrabold capitalize">Penarikan</span>;
            case 'commission_deduction':
                return <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-extrabold capitalize">Platform Fee</span>;
            case 'earnings':
                return <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-extrabold capitalize">Earnings</span>;
            case 'payment':
                return <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-[11px] font-extrabold capitalize">Payment</span>;
            default:
                return <span className="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-[11px] font-extrabold capitalize">{type}</span>;
        }
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="flex items-center gap-1.5 w-fit px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-extrabold">
                        <Clock size={12} /> Pending
                    </span>
                );
            case 'completed':
                return (
                    <span className="flex items-center gap-1.5 w-fit px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[11px] font-extrabold">
                        <CheckCircle2 size={12} /> Success
                    </span>
                );
            case 'rejected':
                return (
                    <span className="flex items-center gap-1.5 w-fit px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-[11px] font-extrabold">
                        <XCircle size={12} /> Rejected
                    </span>
                );
            default:
                return <span className="px-3 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-full text-[11px] font-extrabold capitalize">{status}</span>;
        }
    };

    const renderPagination = (data, setPage) => {
        if (!data || data.last_page <= 1) return null;
        return (
            <div className="p-6 border-t border-outline-variant/20 flex items-center justify-between bg-surface-bright">
                <span className="text-[12px] text-on-surface-variant font-semibold">
                    Menampilkan halaman {data.current_page} dari {data.last_page} ({data.total} total item)
                </span>
                <div className="flex gap-2">
                    <button
                        disabled={data.current_page === 1}
                        onClick={() => setPage(data.current_page - 1)}
                        className="px-4 py-2 border border-outline-variant/30 rounded-lg text-[12px] font-bold text-primary disabled:opacity-50 hover:bg-surface-container transition-colors"
                    >
                        Sebelumnya
                    </button>
                    <button
                        disabled={data.current_page === data.last_page}
                        onClick={() => setPage(data.current_page + 1)}
                        className="px-4 py-2 border border-outline-variant/30 rounded-lg text-[12px] font-bold text-primary disabled:opacity-50 hover:bg-surface-container transition-colors"
                    >
                        Selanjutnya
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-[32px] font-bold text-on-background tracking-tight">Financial Reports & Ledger</h2>
                    <p className="text-[16px] text-on-surface-variant font-medium">Manage payouts, track platform revenue, and monitor company ledger sheets.</p>
                </div>
                <button 
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-2 text-primary hover:bg-primary-fixed px-6 py-3 rounded-xl font-bold text-[14px] transition-colors border border-primary active:scale-95"
                >
                    <Download size={20} />
                    <span>Download data CSV</span>
                </button>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Platform Net Commission', value: financialReport?.income_statement?.platform_commission_formatted || 'Rp 0', icon: <TrendingUp className="text-green-600" />, color: 'bg-green-50' },
                    { label: 'Total Withdrawals', value: financialReport?.balance_sheet?.total_withdrawals_formatted || 'Rp 0', icon: <Banknote className="text-blue-600" />, color: 'bg-blue-50' },
                    { label: 'Held Wallet Balances (Liability)', value: financialReport?.balance_sheet?.held_user_balances_liability_formatted || 'Rp 0', icon: <CreditCard className="text-amber-600" />, color: 'bg-amber-50' },
                    { label: 'Simulated Bank Cash', value: financialReport?.balance_sheet?.simulated_bank_balance_formatted || 'Rp 0', icon: <ArrowUpRight className="text-purple-600" />, color: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none">{stat.label}</p>
                                <p className="text-[18px] font-bold text-primary mt-1.5 whitespace-nowrap">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-outline-variant/20">
                {[
                    { id: 'payouts', label: 'Payout Requests', count: withdrawals.length },
                    { id: 'cash-flow', label: 'Jurnal / Arus Kas' },
                    { id: 'deposits', label: 'Uang Masuk (Deposits)' },
                    { id: 'withdrawals', label: 'Uang Keluar (Withdrawals)' },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`px-6 py-4 font-bold text-[14px] border-b-2 transition-all relative ${
                                isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-on-surface-variant hover:text-primary opacity-60 hover:opacity-100'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-2 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Main Content Card */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,15,34,0.05)] border border-outline-variant/20 flex flex-col overflow-hidden mb-10">
                
                {/* Dynamic Filters header based on Active Tab */}
                <div className="p-8 border-b border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface-bright">
                    <div>
                        <h3 className="text-[20px] font-bold text-primary">
                            {activeTab === 'payouts' && 'Pending Payout Requests'}
                            {activeTab === 'cash-flow' && 'Buku Besar & Arus Kas'}
                            {activeTab === 'deposits' && 'Laporan Uang Masuk'}
                            {activeTab === 'withdrawals' && 'Laporan Uang Keluar (Penarikan)'}
                        </h3>
                        <p className="text-[14px] text-on-surface-variant font-medium">
                            {activeTab === 'payouts' && 'Review and process partner withdrawal requests.'}
                            {activeTab === 'cash-flow' && 'Catatan kronologis dari seluruh transaksi & mutasi saldo di platform.'}
                            {activeTab === 'deposits' && 'Seluruh transaksi pengisian saldo (top-up) dompet oleh pengguna.'}
                            {activeTab === 'withdrawals' && 'Riwayat seluruh permintaan penarikan dana beserta status transaksinya.'}
                        </p>
                    </div>

                    {/* Filter controls */}
                    {activeTab !== 'payouts' && (
                        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari nama atau email..."
                                    value={
                                        activeTab === 'cash-flow' ? cfSearchInput :
                                        activeTab === 'deposits' ? depSearchInput : wSearchInput
                                    }
                                    onChange={(e) => {
                                        if (activeTab === 'cash-flow') setCfSearchInput(e.target.value);
                                        else if (activeTab === 'deposits') setDepSearchInput(e.target.value);
                                        else setWSearchInput(e.target.value);
                                    }}
                                    className="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-on-surface focus:outline-none focus:border-primary w-60 font-semibold"
                                />
                                <Search className="absolute left-3 top-3 text-on-surface-variant/60" size={16} />
                            </div>

                            {activeTab === 'cash-flow' && (
                                <select
                                    value={cashFlowType}
                                    onChange={(e) => {
                                        setCashFlowType(e.target.value);
                                        setCashFlowPage(1);
                                    }}
                                    className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-on-surface focus:outline-none focus:border-primary font-bold cursor-pointer"
                                >
                                    <option value="">Semua Tipe</option>
                                    <option value="deposit">Top-up (Deposit)</option>
                                    <option value="withdrawal">Penarikan (Withdrawal)</option>
                                    <option value="commission_deduction">Platform Fee</option>
                                    <option value="earnings">Earnings</option>
                                    <option value="payment">Payment</option>
                                </select>
                            )}

                            {activeTab === 'withdrawals' && (
                                <select
                                    value={withdrawalsStatus}
                                    onChange={(e) => {
                                        setWithdrawalsStatus(e.target.value);
                                        setWithdrawalsPage(1);
                                    }}
                                    className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-on-surface focus:outline-none focus:border-primary font-bold cursor-pointer"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Success</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            )}

                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-primary text-white font-bold text-[14px] rounded-xl hover:bg-primary/95 transition-all active:scale-95 shadow-sm"
                            >
                                Cari
                            </button>
                        </form>
                    )}
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto w-full">
                    {loading ? (
                        <div className="py-20 flex justify-center">
                            <Loader2 className="animate-spin text-secondary-container" size={32} />
                        </div>
                    ) : (
                        <>
                            {/* Tab 1: Payout Requests */}
                            {activeTab === 'payouts' && (
                                withdrawals.length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-surface-container-low text-on-surface-variant text-[12px] uppercase tracking-widest border-b border-outline-variant/30">
                                                <th className="px-10 py-5 font-bold">User/Partner Name</th>
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
                                                                <p className="text-[12px] font-semibold text-on-surface-variant mt-0.5">{item.user?.email} • <span className="capitalize">{item.user?.role}</span></p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6">
                                                        <span className="font-bold text-[16px] text-primary">Rp {Number(item.amount).toLocaleString('id-ID')}</span>
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
                                                        <div className="flex gap-2 justify-end">
                                                            <button 
                                                                onClick={() => handleApprove(item.id)}
                                                                className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-[12px] font-bold hover:bg-green-700 transition-all active:scale-95 shadow-sm"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReject(item.id)}
                                                                className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[12px] font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-sm"
                                                            >
                                                                Reject
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
                                        <p className="text-on-surface-variant font-bold">Great! No pending payout requests at the moment.</p>
                                    </div>
                                )
                            )}

                            {/* Tab 2 & 3: Jurnal / Arus Kas & Deposits (both use cashFlowData) */}
                            {(activeTab === 'cash-flow' || activeTab === 'deposits') && (
                                cashFlowData?.data?.length > 0 ? (
                                    <div className="flex flex-col">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-surface-container-low text-on-surface-variant text-[12px] uppercase tracking-widest border-b border-outline-variant/30">
                                                    <th className="px-10 py-5 font-bold">Tanggal</th>
                                                    <th className="px-10 py-5 font-bold">ID</th>
                                                    <th className="px-10 py-5 font-bold">User</th>
                                                    <th className="px-10 py-5 font-bold">Tipe</th>
                                                    <th className="px-10 py-5 font-bold">Nominal</th>
                                                    <th className="px-10 py-5 font-bold">Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[14px] divide-y divide-outline-variant/10">
                                                {cashFlowData.data.map((item) => {
                                                    const isPositive = Number(item.amount) > 0;
                                                    return (
                                                        <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                                                            <td className="px-10 py-6 whitespace-nowrap text-on-surface-variant font-semibold">
                                                                {new Date(item.created_at).toLocaleString('id-ID', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </td>
                                                            <td className="px-10 py-6 font-bold text-primary">#{item.id}</td>
                                                            <td className="px-10 py-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-[12px]">
                                                                        {(item.wallet?.user?.name || 'S').charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-primary leading-tight">{item.wallet?.user?.name || 'System'}</p>
                                                                        <p className="text-[11px] font-semibold text-on-surface-variant mt-0.5">{item.wallet?.user?.role || 'system'}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-10 py-6">
                                                                {renderTypeBadge(item.type)}
                                                            </td>
                                                            <td className={`px-10 py-6 font-bold text-[15px] whitespace-nowrap ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                                {isPositive ? '+' : ''}Rp {Number(item.amount).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="px-10 py-6 text-on-surface-variant font-semibold max-w-xs truncate" title={item.description}>
                                                                {item.description}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                        {activeTab === 'cash-flow' 
                                            ? renderPagination(cashFlowData, setCashFlowPage)
                                            : renderPagination(cashFlowData, setDepositPage)
                                        }
                                    </div>
                                ) : (
                                    <div className="py-20 text-center flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center">
                                            <Search className="text-outline" size={32} />
                                        </div>
                                        <p className="text-on-surface-variant font-bold">Tidak ada data transaksi yang ditemukan.</p>
                                    </div>
                                )
                            )}

                            {/* Tab 4: Withdrawals (Uang Keluar) */}
                            {activeTab === 'withdrawals' && (
                                withdrawalsReportData?.data?.length > 0 ? (
                                    <div className="flex flex-col">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-surface-container-low text-on-surface-variant text-[12px] uppercase tracking-widest border-b border-outline-variant/30">
                                                    <th className="px-10 py-5 font-bold">Tanggal</th>
                                                    <th className="px-10 py-5 font-bold">ID</th>
                                                    <th className="px-10 py-5 font-bold">User/Mitra</th>
                                                    <th className="px-10 py-5 font-bold">Jumlah</th>
                                                    <th className="px-10 py-5 font-bold">Bank Details</th>
                                                    <th className="px-10 py-5 font-bold">Status</th>
                                                    <th className="px-10 py-5 font-bold">Aksi / Catatan Admin</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[14px] divide-y divide-outline-variant/10">
                                                {withdrawalsReportData.data.map((item) => (
                                                    <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                                                        <td className="px-10 py-6 whitespace-nowrap text-on-surface-variant font-semibold">
                                                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </td>
                                                        <td className="px-10 py-6 font-bold text-primary">#{item.id}</td>
                                                        <td className="px-10 py-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-lg bg-surface-container text-primary flex items-center justify-center font-bold text-[12px]">
                                                                    {(item.user?.name || 'U').charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-primary leading-tight">{item.user?.name}</p>
                                                                    <p className="text-[11px] font-semibold text-on-surface-variant mt-0.5">{item.user?.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-6 font-bold text-[15px] text-red-600">
                                                            -Rp {Number(item.amount).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-10 py-6">
                                                            <p className="font-bold text-on-surface leading-tight">{item.bank_name}</p>
                                                            <p className="text-[12px] font-semibold text-on-surface-variant mt-0.5">{item.account_number} • {item.account_name}</p>
                                                        </td>
                                                        <td className="px-10 py-6">
                                                            {renderStatusBadge(item.status)}
                                                        </td>
                                                        <td className="px-10 py-6">
                                                            {item.status === 'pending' ? (
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => handleApprove(item.id)}
                                                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[11px] font-bold hover:bg-green-700 transition-all active:scale-95"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleReject(item.id)}
                                                                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[12px] font-semibold text-on-surface-variant block max-w-xs truncate" title={item.admin_notes}>
                                                                    {item.admin_notes || '-'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {renderPagination(withdrawalsReportData, setWithdrawalsPage)}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center">
                                            <Search className="text-outline" size={32} />
                                        </div>
                                        <p className="text-on-surface-variant font-bold">Tidak ada data penarikan yang ditemukan.</p>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;
