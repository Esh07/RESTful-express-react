import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentToken, selectIsAuthenticated } from "./authSlice";

const RequireAuth: React.FC = () => {

	const isAuthenticated = useSelector(selectIsAuthenticated);
	const location = useLocation();

	const content = isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname }} replace />

	return (
		<div>
			{content}
		</div>
	);
}

export default RequireAuth;