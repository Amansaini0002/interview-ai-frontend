import React from "react";
import { Outlet } from "react-router";
import Navbar from "../features/auth/components/Navbar.jsx";
import Sidebar from "../features/auth/components/Sidebar.jsx";

const AppLayout = () => {
    return (
        <div className="app-layout">
            <Navbar />

            <div className="app-layout__body">
                <Sidebar />

                <main className="app-layout__content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;