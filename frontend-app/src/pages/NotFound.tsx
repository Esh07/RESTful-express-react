// src/pages/NotFound.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[#FF5510] via-[#ff7a38] to-[#ff9a5e] text-white">
    <h1 className="text-9xl font-bold mb-4 drop-shadow-lg">404</h1>
    <h2 className="text-3xl font-semibold mb-4 drop-shadow-md">Page Not Found</h2>
    <p className="text-lg mb-8 drop-shadow-sm">
      Sorry, the page you are looking for does not exist.
    </p>
    <Link to="/" className="px-6 py-3 bg-white text-[#FF5510] rounded-full font-semibold shadow-md hover:bg-gray-100 transition">
      Go back to the homepage
    </Link>
  </div>
  );
};

export default NotFound;
