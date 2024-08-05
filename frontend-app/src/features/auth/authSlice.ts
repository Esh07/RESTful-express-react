import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    userDetails?: User;
    users?: User[];
}

interface User {
    id: number;
    email: string;
    name: string;
    createdAt?: string;
    users?: User[];
}


const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    userDetails: undefined,
    users: [],
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
            state.userDetails = undefined;
            state.isAuthenticated = false;
        },
        setUserDetails: (state, action: PayloadAction<User>) => {
            state.userDetails = action.payload;
          },
        setUsers: (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
        }
    
    },
    
});

export const { setCredentials, logout, setUserDetails, setUsers } = authSlice.actions;

export default authSlice.reducer;



export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
// check if user is authenticated
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUserDetails = (state: { auth: AuthState }) => state.auth.userDetails;

// get all users if user is admin
export const selectUsers = (state: { auth: AuthState }) => state.auth.users;