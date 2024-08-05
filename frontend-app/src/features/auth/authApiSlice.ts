// Need to use the React-specific entry point to import `createApi`
import { apiSlice } from '../../app/api/apiSlice';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../../types';


export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
});

export const { 
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
 } = authApiSlice;