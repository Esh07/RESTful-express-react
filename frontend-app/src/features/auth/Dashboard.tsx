import React from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectCurrentToken } from "./authSlice";
import { Link } from "react-router-dom";
import LogoutButton from "../../../src/components/LogoutButton";


const Dashboard: React.FC = () => {
    const token = useSelector(selectCurrentToken);
    const user = useSelector(selectCurrentUser);

    const welcome = user ? `Welcome, ${user.name}!` : "Welcome!";

    const content = (<div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
            <div className="md:flex">
                <div className="md:flex-shrink-0">
                    <img className="h-48 w-full object-cover md:w-48 rounded-l-xl" src="https://via.placeholder.com/150" alt="User Avatar" />
                </div>
                <div className="p-8">
                    <div className="uppercase tracking-wide text-sm text-[#FF5100] font-semibold">Profile</div>
                    <h1 className="block mt-1 text-2xl leading-tight font-bold text-gray-900">John Doe</h1>
                    <p className="mt-2 text-gray-600">Email: john.doe@example.com</p>
                    <p className="mt-2 text-gray-600">User ID: 123456</p>
                    <p className="mt-2 text-gray-600">Joined: January 1, 2023</p>
                    <div className="mt-4">
                        <button className="bg-[#FF5100] text-white px-4 py-2 rounded-md hover:bg-[#d82b00] disabled:bg-gray-300 cursor-not-allowed w-32" disabled>Edit Profile</button>
                        {/* <button className="bg-[#FF5100] text-white px-4 py-2 rounded-md hover:bg-red-600 ml-2 w-32">Logout</button> */}
                        <LogoutButton />
                    </div>
                </div>
            </div>
        </div>
        );

    return (
        <>
         {content}
        </>
    );
}

export default Dashboard;