import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchPendingWithdrawals = createAsyncThunk(
    'transaction/fetchPendingWithdrawals',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/withdrawals/pending');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const approveWithdrawal = createAsyncThunk(
    'transaction/approveWithdrawal',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/withdrawals/${id}/approve`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const rejectWithdrawal = createAsyncThunk(
    'transaction/rejectWithdrawal',
    async ({ id, admin_notes }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/withdrawals/${id}/reject`, { admin_notes });
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchFinancialReports = createAsyncThunk(
    'transaction/fetchFinancialReports',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/reports/financial');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchCashFlow = createAsyncThunk(
    'transaction/fetchCashFlow',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/reports/cash-flow', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchWithdrawalsReport = createAsyncThunk(
    'transaction/fetchWithdrawalsReport',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/reports/withdrawals', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const transactionSlice = createSlice({
    name: 'transaction',
    initialState: {
        withdrawals: [],
        earnings: null,
        financialReport: null,
        cashFlowData: null,
        withdrawalsReportData: null,
        loading: false,
        error: null,
        
        // Cache flags
        payoutsFetched: false,
        cashFlowFetched: false,
        depositsFetched: false,
        withdrawalsReportFetched: false,

        // Query parameters
        cashFlowParams: { page: 1, per_page: 15, search: '', type: '' },
        withdrawalsParams: { page: 1, per_page: 15, search: '', status: '' },
        depositParams: { page: 1, per_page: 15, search: '' }
    },
    reducers: {
        setCashFlowParams(state, action) {
            state.cashFlowParams = { ...state.cashFlowParams, ...action.payload };
            state.cashFlowFetched = false;
        },
        setWithdrawalsParams(state, action) {
            state.withdrawalsParams = { ...state.withdrawalsParams, ...action.payload };
            state.withdrawalsReportFetched = false;
        },
        setDepositParams(state, action) {
            state.depositParams = { ...state.depositParams, ...action.payload };
            state.depositsFetched = false;
        },
        invalidateCache(state) {
            state.payoutsFetched = false;
            state.cashFlowFetched = false;
            state.depositsFetched = false;
            state.withdrawalsReportFetched = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPendingWithdrawals.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPendingWithdrawals.fulfilled, (state, action) => {
                state.loading = false;
                state.withdrawals = action.payload.data || [];
                state.payoutsFetched = true;
            })
            .addCase(fetchPendingWithdrawals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(approveWithdrawal.fulfilled, (state, action) => {
                state.withdrawals = state.withdrawals.filter(w => w.id !== action.payload);
                state.payoutsFetched = false;
                state.cashFlowFetched = false;
                state.depositsFetched = false;
                state.withdrawalsReportFetched = false;
            })
            .addCase(rejectWithdrawal.fulfilled, (state, action) => {
                state.withdrawals = state.withdrawals.filter(w => w.id !== action.payload);
                state.payoutsFetched = false;
                state.cashFlowFetched = false;
                state.depositsFetched = false;
                state.withdrawalsReportFetched = false;
            })
            .addCase(fetchFinancialReports.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFinancialReports.fulfilled, (state, action) => {
                state.loading = false;
                state.financialReport = action.payload;
            })
            .addCase(fetchFinancialReports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchCashFlow.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCashFlow.fulfilled, (state, action) => {
                state.loading = false;
                state.cashFlowData = action.payload;
                if (action.meta.arg?.type === 'deposit') {
                    state.depositsFetched = true;
                } else {
                    state.cashFlowFetched = true;
                }
            })
            .addCase(fetchCashFlow.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchWithdrawalsReport.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWithdrawalsReport.fulfilled, (state, action) => {
                state.loading = false;
                state.withdrawalsReportData = action.payload;
                state.withdrawalsReportFetched = true;
            })
            .addCase(fetchWithdrawalsReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { 
    setCashFlowParams, 
    setWithdrawalsParams, 
    setDepositParams, 
    invalidateCache 
} = transactionSlice.actions;

export default transactionSlice.reducer;
