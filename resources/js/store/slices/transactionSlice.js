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

const transactionSlice = createSlice({
    name: 'transaction',
    initialState: {
        withdrawals: [],
        earnings: null,
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPendingWithdrawals.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPendingWithdrawals.fulfilled, (state, action) => {
                state.loading = false;
                state.withdrawals = action.payload.data || [];
            })
            .addCase(fetchPendingWithdrawals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(approveWithdrawal.fulfilled, (state, action) => {
                state.withdrawals = state.withdrawals.filter(w => w.id !== action.payload);
            });
    }
});

export default transactionSlice.reducer;
