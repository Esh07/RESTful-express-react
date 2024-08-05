// Need to use the React-specific entry point to import `createApi`
import { apiSlice } from '../../app/api/apiSlice';
import type { AuthResponse, LoginRequest, RegisterRequest, userDetailsTypes } from '../../types';


export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/user/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/user/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation<void, string | void>({
      query: (token) => ({
        url: '/user/logout',
        method: 'POST',
        body: {token },
      }),
    }),
    getUserDetails: builder.query<userDetailsTypes, void>({
      query: (credentials) => ({
        url: `/user`,
        method: 'GET',
        credentials: 'include',

      }),
    }),
  }),
  overrideExisting: false,
});

export const { 
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetUserDetailsQuery,
 } = authApiSlice;