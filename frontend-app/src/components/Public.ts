import React from "react";
import { Link, Route } from "react-router-dom";


interface PublicProps {}

export const Public: React.FC<PublicProps> = () => {
    return (
        <div>
            <h1>Public Route</h1>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
        </div>
    );
    };
    

export default Public;
