// src/components/LogoutButton.tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { useLogoutMutation } from '../features/auth/authApiSlice';
import {  persistor } from '../../src/app/store';
import { selectCurrentToken } from '../features/auth/authSlice';

const LogoutButton: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector(selectCurrentToken);

    const [logoutApi, { isLoading }] = useLogoutMutation();

    const handleLogout = async () => {
        try {

            if (!token) {
                console.error('No token found, cannot logout');
                return;
            }

            console.log('Initiating logout request');
            const resultLogout = await logoutApi(token).unwrap(); // Call logoutApi
            console.log('Logout successful:', resultLogout);

            // If no error is thrown, logout was successful
            dispatch(logout());
            persistor.purge(); // Clear persisted state
            navigate('/'); // Navigate to the home page
          } catch (error) {
            console.error('Logout request failed', error);
          }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`bg-[#FF5100] text-white px-4 py-2 rounded-md ml-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
        >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                'Logout'
            )}
        </button>
    );
};

export default LogoutButton;
