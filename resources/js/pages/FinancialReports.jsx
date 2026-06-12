import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
    useReactTable,
    getCoreRowModel
} from '@tanstack/react-table';
import { 
    Download, 
    CreditCard, 
    ArrowUpRight, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Loader2, 
    Banknote, 
    TrendingUp, 
    Search, 
    RefreshCw
} from 'lucide-react';
import { 
    fetchPendingWithdrawals, 
    approveWithdrawal, 
    rejectWithdrawal, 
    fetchFinancialReports,
    fetchCashFlow,
    fetchWithdrawalsReport,
    setCashFlowParams,
    setWithdrawalsParams,
    setDepositParams,
    invalidateCache
} from '../store/slices/transactionSlice';

// Base Components imports
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Table from '../components/Table';

const FinancialReports = () => {
    const dispatch = useDispatch();
    
    // Select state from Redux
    const { 
        withdrawals, 
        financialReport, 
        cashFlowData, 
        withdrawalsReportData, 
        loading,
        
        // Cache Flags
        payoutsFetched,
        cashFlowFetched,
        depositsFetched,
        withdrawalsReportFetched,

        // Query parameters
        cashFlowParams,
        withdrawalsParams,
        depositParams
    } = useSelector((state) => state.transaction);

    // Active tab state: 'payouts', 'cash-flow', 'deposits', 'withdrawals'
    const [activeTab, setActiveTab] = useState('payouts');
    
    // Local search input
    const [searchInput, setSearchInput] = useState('');

    // Fetch initial Overview Cards & Payout Requests
    useEffect(() => {
        dispatch(fetchFinancialReports());
    }, [dispatch]);

    // Reactively fetch data when active tab or filters change
    useEffect(() => {
        if (activeTab === 'payouts' && !payoutsFetched) {
            dispatch(fetchPendingWithdrawals());
        } else if (activeTab === 'cash-flow' && !cashFlowFetched) {
            dispatch(fetchCashFlow(cashFlowParams));
        } else if (activeTab === 'deposits' && !depositsFetched) {
            dispatch(fetchCashFlow({ ...depositParams, type: 'deposit' }));
        } else if (activeTab === 'withdrawals' && !withdrawalsReportFetched) {
            dispatch(fetchWithdrawalsReport(withdrawalsParams));
        }
    }, [
        dispatch, 
        activeTab, 
        payoutsFetched,
        cashFlowFetched,
        depositsFetched,
        withdrawalsReportFetched,
        cashFlowParams,
        withdrawalsParams,
        depositParams
    ]);

    // Sync local search input with redux parameters
    useEffect(() => {
        if (activeTab === 'cash-flow') {
            setSearchInput(cashFlowParams.search);
        } else if (activeTab === 'deposits') {
            setSearchInput(depositParams.search);
        } else if (activeTab === 'withdrawals') {
            setSearchInput(withdrawalsParams.search);
        } else {
            setSearchInput('');
        }
    }, [activeTab, cashFlowParams.search, depositParams.search, withdrawalsParams.search]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    const handleRefresh = () => {
        dispatch(invalidateCache());
        dispatch(fetchFinancialReports());
    };

    const handleApprove = (id) => {
        if (confirm('Apakah Anda yakin ingin menyetujui penarikan dana ini?')) {
            dispatch(approveWithdrawal(id)).then(() => {
                dispatch(fetchFinancialReports());
            });
        }
    };

    const handleReject = (id) => {
        const reason = prompt('Masukkan alasan penolakan penarikan dana ini (Refund otomatis):');
        if (reason) {
            dispatch(rejectWithdrawal({ id, admin_notes: reason })).then(() => {
                dispatch(fetchFinancialReports());
            });
        }
    };

    // Excel Document Exporter
    const handleDownloadExcel = () => {
        let headers = [];
        let data = [];
        let filename = "";

        if (activeTab === 'payouts') {
            filename = "permintaan_pencairan.xls";
            headers = ["ID", "Nama Partner", "Email", "Jumlah Penarikan", "Bank", "No. Rekening", "Nama Rekening", "Tanggal Permintaan"];
            data = withdrawals.map(w => [
                w.id,
                w.user?.name || '',
                w.user?.email || '',
                `Rp ${Number(w.amount).toLocaleString('id-ID')}`,
                w.bank_name || '',
                w.account_number || '',
                w.account_name || '',
                new Date(w.created_at).toLocaleDateString('id-ID')
            ]);
        } else if (activeTab === 'cash-flow') {
            filename = "arus_kas_buku_besar.xls";
            headers = ["ID Transaksi", "Tanggal", "User", "Role", "Tipe Mutasi", "Nominal", "Keterangan"];
            data = (cashFlowData?.data || []).map(item => {
                const isPositive = Number(item.amount) > 0;
                const prefix = isPositive ? '+' : '';
                return [
                    item.id,
                    new Date(item.created_at).toLocaleString('id-ID'),
                    item.wallet?.user?.name || 'System',
                    item.wallet?.user?.role || 'system',
                    item.type,
                    `${prefix}Rp ${Number(item.amount).toLocaleString('id-ID')}`,
                    item.description || ''
                ];
            });
        } else if (activeTab === 'deposits') {
            filename = "laporan_uang_masuk.xls";
            headers = ["ID Transaksi", "Tanggal", "User", "Role", "Nominal Top-up", "Keterangan"];
            data = (cashFlowData?.data || []).map(item => [
                item.id,
                new Date(item.created_at).toLocaleString('id-ID'),
                item.wallet?.user?.name || 'System',
                item.wallet?.user?.role || 'system',
                `+Rp ${Number(item.amount).toLocaleString('id-ID')}`,
                item.description || ''
            ]);
        } else if (activeTab === 'withdrawals') {
            filename = "laporan_uang_keluar.xls";
            headers = ["ID Penarikan", "Tanggal", "Mitra / User", "Email", "Nominal Penarikan", "Bank", "No. Rekening", "Nama Rekening", "Status", "Catatan Admin"];
            data = (withdrawalsReportData?.data || []).map(w => [
                w.id,
                new Date(w.created_at).toLocaleDateString('id-ID'),
                w.user?.name || '',
                w.user?.email || '',
                `-Rp ${Number(w.amount).toLocaleString('id-ID')}`,
                w.bank_name || '',
                w.account_number || '',
                w.account_name || '',
                w.status,
                w.admin_notes || ''
            ]);
        }

        let html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>GoTam Laporan Keuangan</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
                <style>
                    table { border-collapse: collapse; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px 0; }
                    th { background-color: #0d9488; color: #FFFFFF; font-weight: bold; font-size: 14px; padding: 12px 18px; border: 1px solid #cbd5e1; text-align: left; }
                    td { padding: 10px 18px; border: 1px solid #e2e8f0; font-size: 13px; text-align: left; color: #334155; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                </style>
            </head>
            <body>
                <h2 style="font-family: sans-serif; color: #0f172a; margin-left: 20px;">Laporan Keuangan GoTam - ${activeTab.toUpperCase()}</h2>
                <p style="font-family: sans-serif; color: #64748b; margin-left: 20px;">Diekspor pada tanggal: ${new Date().toLocaleString('id-ID')}</p>
                <table>
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                ${row.map(cell => `<td>${cell}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter submit handler
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'cash-flow') {
            dispatch(setCashFlowParams({ search: searchInput, page: 1 }));
        } else if (activeTab === 'deposits') {
            dispatch(setDepositParams({ search: searchInput, page: 1 }));
        } else if (activeTab === 'withdrawals') {
            dispatch(setWithdrawalsParams({ search: searchInput, page: 1 }));
        }
    };

    const renderTypeBadge = (type) => {
        const variant = {
            deposit: 'success',
            withdrawal: 'danger',
            commission_deduction: 'warning',
            earnings: 'info',
            payment: 'purple'
        }[type] || 'secondary';

        const label = {
            deposit: 'Top-up',
            withdrawal: 'Penarikan',
            commission_deduction: 'Komisi Platform',
            earnings: 'Pendapatan Mitra',
            payment: 'Pembayaran'
        }[type] || type;

        return <Badge variant={variant}>{label}</Badge>;
    };

    const renderStatusBadge = (status) => {
        const variant = {
            pending: 'warning',
            completed: 'success',
            rejected: 'danger'
        }[status] || 'secondary';

        const label = {
            pending: 'Tertunda',
            completed: 'Sukses',
            rejected: 'Ditolak'
        }[status] || status;

        const icon = {
            pending: <Clock size={10} />,
            completed: <CheckCircle2 size={10} />,
            rejected: <XCircle size={10} />
        }[status];

        return <Badge variant={variant} icon={icon}>{label}</Badge>;
    };

    const renderPaginationControls = (data, updateParamsAction) => {
        if (!data || data.total === 0) return null;
        return (
            <div className="p-6 border-t border-outline-variant/20 flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-bright">
                <span className="text-[12px] text-on-surface-variant font-semibold">
                    Menampilkan data {data.from || 0} - {data.to || 0} dari {data.total} total item
                </span>
                <div className="flex items-center gap-4">
                    {/* Per Page Selection */}
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-on-surface-variant">Tampilkan:</span>
                        <select
                            value={data.per_page}
                            onChange={(e) => dispatch(updateParamsAction({ per_page: Number(e.target.value), page: 1 }))}
                            className="px-2 py-1 bg-surface-container-low border border-outline-variant/30 rounded-lg text-[11px] font-bold cursor-pointer focus:outline-none"
                        >
                            {[5, 10, 15, 25, 50, 100].map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                    {/* Previous & Next page triggers */}
                    <div className="flex gap-2">
                        <Button
                            disabled={data.current_page === 1}
                            onClick={() => dispatch(updateParamsAction({ page: data.current_page - 1 }))}
                            variant="outlineVariant"
                            size="sm"
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            disabled={data.current_page === data.last_page}
                            onClick={() => dispatch(updateParamsAction({ page: data.current_page + 1 }))}
                            variant="outlineVariant"
                            size="sm"
                        >
                            Selanjutnya
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    // Columns Definitions for TanStack Table
    const payoutColumns = [
        {
            accessorKey: 'user.name',
            header: 'Nama Pengguna/Mitra',
            cell: (info) => {
                const row = info.row.original;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-bold text-xs">
                            {(row.user?.name || '').charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-primary text-[13px] leading-none">{row.user?.name}</p>
                            <p className="text-[10px] font-semibold text-on-surface-variant mt-0.5 leading-none">{row.user?.email} • <span className="capitalize">{row.user?.role}</span></p>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'amount',
            header: 'Jumlah',
            cell: (info) => <span className="font-bold text-[14px] text-primary">Rp {Number(info.getValue()).toLocaleString('id-ID')}</span>
        },
        {
            accessorKey: 'bank_name',
            header: 'Detail Bank',
            cell: (info) => {
                const row = info.row.original;
                return (
                    <div>
                        <p className="font-bold text-on-surface">{row.bank_name}</p>
                        <p className="text-[12px] font-semibold text-on-surface-variant">{row.account_number} • {row.account_name}</p>
                    </div>
                );
            }
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Permintaan',
            cell: (info) => (
                <div className="flex items-center gap-2 text-on-surface-variant font-semibold">
                    <Clock size={16} className="text-outline" />
                    {new Date(info.getValue()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Keputusan</div>,
            cell: (info) => {
                const id = info.row.original.id;
                return (
                    <div className="flex gap-2 justify-end">
                        <Button 
                            onClick={() => handleApprove(id)}
                            variant="success"
                            size="sm"
                        >
                            Setujui
                        </Button>
                        <Button 
                            onClick={() => handleReject(id)}
                            variant="dangerOutline"
                            size="sm"
                        >
                            Tolak
                        </Button>
                    </div>
                );
            }
        }
    ];

    const cashFlowColumns = [
        {
            accessorKey: 'created_at',
            header: 'Tanggal',
            cell: (info) => new Date(info.getValue()).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
        {
            accessorKey: 'id',
            header: 'ID',
            cell: (info) => <span className="font-bold text-primary">#{info.getValue()}</span>
        },
        {
            accessorKey: 'wallet.user.name',
            header: 'Pengguna',
            cell: (info) => {
                const row = info.row.original;
                const userName = row.wallet?.user?.name || 'System';
                const userRole = row.wallet?.user?.role || 'system';
                return (
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-surface-container text-primary flex items-center justify-center font-bold text-[10px]">
                            {userName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-primary text-[13px] leading-none">{userName}</p>
                            <p className="text-[10px] font-semibold text-on-surface-variant mt-0.5 leading-none">{userRole}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'type',
            header: 'Tipe',
            cell: (info) => renderTypeBadge(info.getValue())
        },
        {
            accessorKey: 'amount',
            header: 'Nominal',
            cell: (info) => {
                const val = Number(info.getValue());
                const isPositive = val > 0;
                return (
                    <span className={`font-bold text-[13px] whitespace-nowrap ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}Rp {val.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                    </span>
                );
            }
        },
        {
            accessorKey: 'description',
            header: 'Keterangan',
            cell: (info) => (
                <span className="text-on-surface-variant font-semibold block max-w-xs truncate" title={info.getValue()}>
                    {info.getValue()}
                </span>
            )
        }
    ];

    const depositColumns = [
        {
            accessorKey: 'created_at',
            header: 'Tanggal',
            cell: (info) => new Date(info.getValue()).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
        {
            accessorKey: 'id',
            header: 'ID',
            cell: (info) => <span className="font-bold text-primary">#{info.getValue()}</span>
        },
        {
            accessorKey: 'wallet.user.name',
            header: 'Pengguna',
            cell: (info) => {
                const row = info.row.original;
                const userName = row.wallet?.user?.name || 'System';
                const userRole = row.wallet?.user?.role || 'system';
                return (
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-surface-container text-primary flex items-center justify-center font-bold text-[10px]">
                            {userName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-primary text-[13px] leading-none">{userName}</p>
                            <p className="text-[10px] font-semibold text-on-surface-variant mt-0.5 leading-none">{userRole}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'amount',
            header: 'Nominal',
            cell: (info) => {
                const val = Number(info.getValue());
                return (
                    <span className="font-bold text-[13px] whitespace-nowrap text-green-600">
                        +Rp {val.toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                    </span>
                );
            }
        },
        {
            accessorKey: 'description',
            header: 'Keterangan',
            cell: (info) => (
                <span className="text-on-surface-variant font-semibold block max-w-xs truncate" title={info.getValue()}>
                    {info.getValue()}
                </span>
            )
        }
    ];

    const withdrawalsColumns = [
        {
            accessorKey: 'created_at',
            header: 'Tanggal',
            cell: (info) => new Date(info.getValue()).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })
        },
        {
            accessorKey: 'id',
            header: 'ID',
            cell: (info) => <span className="font-bold text-primary">#{info.getValue()}</span>
        },
        {
            accessorKey: 'user.name',
            header: 'Pengguna/Mitra',
            cell: (info) => {
                const row = info.row.original;
                const userName = row.user?.name || '';
                const userEmail = row.user?.email || '';
                return (
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-surface-container text-primary flex items-center justify-center font-bold text-[10px]">
                            {userName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-primary text-[13px] leading-none">{userName}</p>
                            <p className="text-[10px] font-semibold text-on-surface-variant mt-0.5 leading-none">{userEmail}</p>
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'amount',
            header: 'Jumlah',
            cell: (info) => (
                <span className="font-bold text-[13px] text-red-600">
                    -Rp {Number(info.getValue()).toLocaleString('id-ID', { minimumFractionDigits: 2 })}
                </span>
            )
        },
        {
            accessorKey: 'bank_name',
            header: 'Detail Bank',
            cell: (info) => {
                const row = info.row.original;
                return (
                    <div>
                        <p className="font-bold text-on-surface leading-tight">{row.bank_name}</p>
                        <p className="text-[12px] font-semibold text-on-surface-variant mt-0.5">{row.account_number} • {row.account_name}</p>
                    </div>
                );
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: (info) => renderStatusBadge(info.getValue())
        },
        {
            id: 'actions',
            header: 'Aksi / Catatan Admin',
            cell: (info) => {
                const row = info.row.original;
                if (row.status === 'pending') {
                    return (
                        <div className="flex gap-2">
                            <Button 
                                onClick={() => handleApprove(row.id)}
                                variant="success"
                                size="sm"
                            >
                                Setujui
                            </Button>
                            <Button 
                                onClick={() => handleReject(row.id)}
                                variant="dangerOutline"
                                size="sm"
                            >
                                Tolak
                            </Button>
                        </div>
                    );
                }
                return (
                    <span className="text-[12px] font-semibold text-on-surface-variant block max-w-xs truncate" title={row.admin_notes}>
                        {row.admin_notes || '-'}
                    </span>
                );
            }
        }
    ];

    // TanStack Tables Configuration
    const tablePayouts = useReactTable({
        data: withdrawals || [],
        columns: payoutColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    const tableCashFlow = useReactTable({
        data: cashFlowData?.data || [],
        columns: cashFlowColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    const tableDeposits = useReactTable({
        data: cashFlowData?.data || [],
        columns: depositColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    const tableWithdrawals = useReactTable({
        data: withdrawalsReportData?.data || [],
        columns: withdrawalsColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-[32px] font-bold text-on-background tracking-tight">Laporan Keuangan & Buku Besar</h2>
                    <p className="text-[16px] text-on-surface-variant font-medium">Kelola pencairan dana, lacak pendapatan platform, dan pantau pembukuan perusahaan.</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        onClick={handleRefresh}
                        variant="outlineVariant"
                        size="lg"
                        icon={RefreshCw}
                    >
                        Muat Ulang
                    </Button>
                    <Button 
                        onClick={handleDownloadExcel}
                        variant="outline"
                        size="lg"
                        icon={Download}
                    >
                        Ekspor Excel
                    </Button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Komisi Bersih Platform', value: financialReport?.income_statement?.platform_commission_formatted || 'Rp 0', icon: TrendingUp, color: 'bg-green-50' },
                    { label: 'Total Penarikan Dana', value: financialReport?.balance_sheet?.total_withdrawals_formatted || 'Rp 0', icon: Banknote, color: 'bg-blue-50' },
                    { label: 'Saldo Dompet Mengendap (Liabilitas)', value: financialReport?.balance_sheet?.held_user_balances_liability_formatted || 'Rp 0', icon: CreditCard, color: 'bg-amber-50' },
                    { label: 'Kas Bank Simulasi', value: financialReport?.balance_sheet?.simulated_bank_balance_formatted || 'Rp 0', icon: ArrowUpRight, color: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.color}`}>
                            <stat.icon size={20} className={stat.color.includes('green') ? 'text-green-600' : stat.color.includes('blue') ? 'text-blue-600' : stat.color.includes('amber') ? 'text-amber-600' : 'text-purple-600'} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none">{stat.label}</p>
                            <p className="text-[18px] font-bold text-primary mt-1.5 whitespace-nowrap">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-outline-variant/20">
                {[
                    { id: 'payouts', label: 'Permintaan Pencairan', count: withdrawals.length },
                    { id: 'cash-flow', label: 'Jurnal / Arus Kas' },
                    { id: 'deposits', label: 'Uang Masuk (Deposits)' },
                    { id: 'withdrawals', label: 'Uang Keluar (Penarikan)' },
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
            <Card
                title={
                    activeTab === 'payouts' ? 'Permintaan Pencairan Tertunda' :
                    activeTab === 'cash-flow' ? 'Buku Besar & Arus Kas' :
                    activeTab === 'deposits' ? 'Laporan Uang Masuk' : 'Laporan Uang Keluar (Penarikan)'
                }
                subtitle={
                    activeTab === 'payouts' ? 'Tinjau dan proses permintaan penarikan dana dari mitra.' :
                    activeTab === 'cash-flow' ? 'Catatan kronologis dari seluruh transaksi & mutasi saldo di platform.' :
                    activeTab === 'deposits' ? 'Seluruh transaksi pengisian saldo (top-up) dompet oleh pengguna.' :
                    'Riwayat seluruh permintaan penarikan dana beserta status transaksinya.'
                }
                headerAction={
                    activeTab !== 'payouts' && (
                        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Cari nama atau email..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-on-surface focus:outline-none focus:border-primary w-60 font-semibold"
                                />
                                <Search className="absolute left-3 top-3 text-on-surface-variant/60" size={16} />
                            </div>

                            {activeTab === 'cash-flow' && (
                                <select
                                    value={cashFlowParams.type}
                                    onChange={(e) => {
                                        dispatch(setCashFlowParams({ type: e.target.value, page: 1 }));
                                    }}
                                    className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-on-surface focus:outline-none focus:border-primary font-bold cursor-pointer"
                                >
                                    <option value="">Semua Tipe</option>
                                    <option value="deposit">Top-up (Deposit)</option>
                                    <option value="withdrawal">Penarikan (Withdrawal)</option>
                                    <option value="commission_deduction">Komisi Platform</option>
                                    <option value="earnings">Pendapatan Mitra</option>
                                    <option value="payment">Pembayaran Wallet</option>
                                </select>
                            )}

                            {activeTab === 'withdrawals' && (
                                <select
                                    value={withdrawalsParams.status}
                                    onChange={(e) => {
                                        dispatch(setWithdrawalsParams({ status: e.target.value, page: 1 }));
                                    }}
                                    className="px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[14px] text-on-surface focus:outline-none focus:border-primary font-bold cursor-pointer"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="pending">Tertunda</option>
                                    <option value="completed">Sukses</option>
                                    <option value="rejected">Ditolak</option>
                                </select>
                            )}

                            <Button type="submit">
                                Cari
                            </Button>
                        </form>
                    )
                }
                noPadding
                className="mb-10"
            >
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
                                    <Table tableInstance={tablePayouts} />
                                ) : (
                                    <div className="py-20 text-center flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="text-outline" size={32} />
                                        </div>
                                        <p className="text-on-surface-variant font-bold">Luar biasa! Tidak ada permintaan pencairan dana yang tertunda saat ini.</p>
                                    </div>
                                )
                            )}

                            {/* Tab 2: Jurnal / Arus Kas */}
                            {activeTab === 'cash-flow' && (
                                cashFlowData?.data?.length > 0 ? (
                                    <div className="flex flex-col">
                                        <Table tableInstance={tableCashFlow} />
                                        {renderPaginationControls(cashFlowData, setCashFlowParams)}
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

                            {/* Tab 3: Uang Masuk */}
                            {activeTab === 'deposits' && (
                                cashFlowData?.data?.length > 0 ? (
                                    <div className="flex flex-col">
                                        <Table tableInstance={tableDeposits} />
                                        {renderPaginationControls(cashFlowData, setDepositParams)}
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

                            {/* Tab 4: Uang Keluar */}
                            {activeTab === 'withdrawals' && (
                                withdrawalsReportData?.data?.length > 0 ? (
                                    <div className="flex flex-col">
                                        <Table tableInstance={tableWithdrawals} />
                                        {renderPaginationControls(withdrawalsReportData, setWithdrawalsParams)}
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
            </Card>
        </div>
    );
};

export default FinancialReports;
