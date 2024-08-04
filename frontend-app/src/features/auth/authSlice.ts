import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
    user: User | null;
    token: string | null;
}

interface User {
    id: number;
    email: string;
    name: string;
}


const initialState: AuthState = {
    user: null,
    token: null
};


const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        token: null
    },
    reducers: {
        setCredentials: (state: AuthState, action) => {
            const { user, accessToken } = action.payload;
            state.user = user;
            state.token = accessToken;
        },
        logout: (state: AuthState) => {
            state.user = null;
            state.token = null;
        },
    },
    
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;



export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;