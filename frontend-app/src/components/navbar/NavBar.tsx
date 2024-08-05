// src/components/navbar/NavBar.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentToken, selectCurrentUser, selectIsAuthenticated } from '../../features/auth/authSlice';
import { Link, Navigate } from 'react-router-dom';
import LogoutButton from '../LogoutButton';

const NavBar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const isAuthenticated = useSelector(selectIsAuthenticated);



    const navItems = isAuthenticated 
                        ? ["Logout"] 
                        : ["Login", "Register"];

    return (
        <nav className="bg-gradient-to-r from-[#FF5100] via-[#FF7433] to-[#FF5100] p-4 w-full  shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-white text-lg font-bold cursor-pointer">
                    <Link to="/" className="text-white">
                        RESTfulness
                    </Link>
                    </h1>
                <div className="block lg:hidden">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white focus:outline-none"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                            />
                        </svg>
                    </button>
                </div>
                <div className={`w-full lg:flex lg:items-center lg:w-auto ${isOpen ? "block" : "hidden"}`}>
                <ul className="lg:flex lg:space-x-4">
                    {navItems.map((item) => (
                                <li key={item}>
                                    {item === "Logout" ? (
                                        <LogoutButton />
                                    ) : (
                                        <Link to={`/${item.toLowerCase()}`} className="block text-white px-2 py-1 rounded hover:bg-[#d82b00] transition duration-300 ease-in-out">
                                            {item}
                                        </Link>
                                    )}
                                </li>
                            ))}
                </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;