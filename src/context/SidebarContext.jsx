import React, { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen((prev) => !prev);
    const closeSidebar = () => setIsOpen(false);

    // Close the mobile sidebar automatically if the viewport
    // is resized back up to desktop width.
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <SidebarContext.Provider
            value={{ isOpen, toggleSidebar, closeSidebar }}
        >
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);

    if (!context) {
        throw new Error(
            "useSidebar must be used within a SidebarProvider"
        );
    }

    return context;
};