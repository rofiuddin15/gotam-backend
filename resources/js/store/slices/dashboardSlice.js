import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/stats');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchLiveMonitoring = createAsyncThunk(
    'dashboard/fetchMonitoring',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/monitoring');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        stats: null,
        monitoring: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchLiveMonitoring.fulfilled, (state, action) => {
                state.monitoring = action.payload;
            });
    }
});

export default dashboardSlice.reducer;
