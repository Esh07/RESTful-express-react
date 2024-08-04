// src/components/navbar/NavBar.tsx
import React, { useState } from 'react';

const NavBar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-white text-lg font-bold cursor-pointer">
                    RESTfulness
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
                    {["Home", "Profile", "Login", "Register", "Logout"].map((item) => (
                        <li key={item}>
                            <a href="#" className="block text-white px-2 py-1 rounded hover:bg-gray-700">
                                {item}
                            </a>
                        </li>
                    ))}
                </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;