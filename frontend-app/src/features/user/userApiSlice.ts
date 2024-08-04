// Need to use the React-specific entry point to import `createApi`
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../../types';
import { apiSlice } from '../../app/api/apiSlice';


export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: build => ({
    getProfile: build.query<UserProfile, void>({
      query: credentials => ({
        url: '/user/profile',
        method: 'GET',
        body: credentials,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }),

    }),
  }),
  overrideExisting: false,
});

export const { 
    useGetProfileQuery,
 } = userApiSlice;