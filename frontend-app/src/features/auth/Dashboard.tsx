import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectCurrentToken } from "./authSlice";
import { Link } from "react-router-dom";


const Dashboard: React.FC = () => {
    const token = useSelector(selectCurrentToken);
    const user = useSelector(selectCurrentUser);

    const welcome = user ? `Welcome, ${user.name}!` : "Welcome!";

    const content = (  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="text-gray-700 mb-2">This is a protected route.</p>
            <p className="text-gray-700 mb-2">Welcome, <span className="font-semibold">{user?.name}</span>!</p>
            <p className="text-gray-700 mb-4">Your token is: <span className="font-mono break-all">{token}</span></p>
            <Link to="/logout" className="inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
                Logout
            </Link>
        </div>
    </div>);

    return (
        <>
         {content}
        </>
    );
}

export default Dashboard;