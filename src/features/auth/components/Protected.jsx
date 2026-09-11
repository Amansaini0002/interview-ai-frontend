import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from "react";

const Protected = ({ children }) => {
    const { loading, user } = useAuth();

   if (loading) {
    return (
        <main className="protected-loading">
            <div className="protected-loading__spinner"></div>
            <p>Loading...</p>
        </main>
    );
}

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default Protected;