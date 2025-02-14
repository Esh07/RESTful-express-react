import type {
    BaseQueryApi,
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    FetchBaseQueryMeta,
  } from '@reduxjs/toolkit/query';
  
  import type { RootState } from "../store";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logout } from "../../features/auth/authSlice";

const baseQuery = fetchBaseQuery({ 
    baseUrl: "http://localhost:3000",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token;
        if (token) {
            headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    }
});

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs,  unknown,  FetchBaseQueryError,  {},  FetchBaseQueryMeta>
= async (
    args,
    api,
    extraOptions
) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        console.log("Reauthenticating...");
        // Reauthenticate here and retry the request to get a new token from refresh token
        const reauthResult = await baseQuery({ 
            url: "/user/refreshToken", 
            method: "POST",
            credentials: "include",
        }, api, extraOptions);

        console.log("Reauthentication result:", reauthResult);
        console.log("Reauthentication result.data:", reauthResult?.data);

        if (reauthResult?.data) {
            const user = (api.getState() as RootState).auth.user;

            
            // store the new token in the store
            api.dispatch(setCredentials({...reauthResult.data, user}));
            console.log("New token stored in Redux state");


            // retry the initial request with the new token
            result = await baseQuery(args, api, extraOptions);
            console.log("Retried the initial request with the new token");


        } else {
            // If reauth fails, logout the user
            api.dispatch(logout());
            console.log("Reauthentication failed, user logged out");
        }
    }
    return result;
}

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({}),
});