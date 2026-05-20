import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchCategories = createAsyncThunk(
    'service/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/admin/service-categories');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'service/deleteCategory',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/admin/service-categories/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const serviceSlice = createSlice({
    name: 'service',
    initialState: {
        categories: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c.id !== action.payload);
            });
    }
});

export default serviceSlice.reducer;
