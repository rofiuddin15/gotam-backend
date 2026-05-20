import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import serviceReducer from './slices/serviceSlice';
import transactionReducer from './slices/transactionSlice';
import userReducer from './slices/userSlice';
import partnerReducer from './slices/partnerSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
        service: serviceReducer,
        transaction: transactionReducer,
        user: userReducer,
        partner: partnerReducer,
    },
});
