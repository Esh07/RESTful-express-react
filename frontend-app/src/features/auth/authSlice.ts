import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

interface User {
    id: number;
    email: string;
    name: string;
}


const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false
};


const authSlice = createSlice({
    name: "auth",
    initialState: { ...initialState},
    reducers: {
        setCredentials: (state: AuthState, action: PayloadAction<{ user: User; accessToken: string }>) => {
            const { user, accessToken } = action.payload;
            state.user = user;
            state.token = accessToken;
            state.isAuthenticated = true;

        },
        logout: (state: AuthState) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
    },
    
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;



export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
// check if user is authenticated
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;