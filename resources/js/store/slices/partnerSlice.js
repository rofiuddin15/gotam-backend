import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchPartnerRequests = createAsyncThunk(
    'partner/fetchRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/partners/pending');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const verifyPartner = createAsyncThunk(
    'partner/verify',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/admin/partner-verifications/${id}/verify`, { status });
            return { id, status };
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const partnerSlice = createSlice({
    name: 'partner',
    initialState: {
        requests: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPartnerRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPartnerRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload;
            })
            .addCase(verifyPartner.fulfilled, (state, action) => {
                state.requests = state.requests.filter(req => req.id !== action.payload.id);
            });
    }
});

export default partnerSlice.reducer;
