import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useNavigate } from "react-router";
import { useSidebar } from "../../../context/SidebarContext.jsx";
import { useToastContext } from "../../../Toast/Toast.jsx";
import { FiMenu, FiZap } from "react-icons/fi";
import "../../../style/navbar.scss";

const Navbar = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const { showConfirm, showToast } = useToastContext();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onLogout = () => {
    setProfileOpen(false);
    showConfirm(
      "Log out of your account?",
      async () => {
        try {
          await handleLogout();
          navigate("/login");
        } catch (err) {
          console.error("Logout failed:", err);
          showToast("Failed to log out. Please try again.", "error");
        }
      },
      "Log out"
    );
  };

  const goToProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  const displayName = user?.username || user?.name || user?.email || "Guest";

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <button
          type="button"
          className="navbar__menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FiMenu />
        </button>

        <span className="navbar__brand">
          <FiZap className="navbar__logo" />
          InterviewAI
        </span>
      </div>

      {user && (
        <div className="navbar__right">
          {/* Profile */}
          <div className="navbar__profile" ref={profileRef}>
            <button
              type="button"
              className="navbar__profile-trigger"
              onClick={() => setProfileOpen((o) => !o)}
              aria-label="Account menu"
            >
              <span className="navbar__avatar">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </button>

            {profileOpen && (
              <div className="navbar__profile-menu">
                <div className="navbar__profile-info">
                  <span className="navbar__profile-name">{displayName}</span>
                  {user?.email && (
                    <span className="navbar__profile-email">{user.email}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="navbar__profile-view"
                  onClick={goToProfile}
                >
                  View Profile
                </button>
                <button
                  type="button"
                  className="navbar__profile-logout"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;