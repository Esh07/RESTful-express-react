import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentToken } from "./authSlice";

const RequireAuth: React.FC = () => {
	const token = useSelector(selectCurrentToken);
	const location = useLocation();
	
	const content = token ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname }} replace />

	return (
		<div>
			{content}
		</div>
	);
}

export default RequireAuth;