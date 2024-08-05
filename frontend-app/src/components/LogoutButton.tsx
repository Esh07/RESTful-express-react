// src/components/LogoutButton.tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { useLogoutMutation } from '../features/auth/authApiSlice';

const LogoutButton: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutApi, { isLoading }] = useLogoutMutation();

    const handleLogout = async () => {
        console.log('Logging out...');
        const resultLogout = await logoutApi();
        console.log('resultLogout', resultLogout);
        if (resultLogout.error) {
            console.error('Failed to logout');
            return;
        }
        dispatch(logout());
        console.log('Logged out');
        navigate('/', { replace: true });
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-[#FF5100] text-white px-4 py-2 rounded-md hover:bg-red-600 ml-2"
        >
            Logout
        </button>
    );
};

export default LogoutButton;
