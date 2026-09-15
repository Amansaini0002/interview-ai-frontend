import React from "react";
import { useLocation, useNavigate } from "react-router";
import { FiTrash2, FiLogOut } from "react-icons/fi";

import { useInterview } from "../../interview/hooks/useInterview.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useSidebar } from "../../../context/SidebarContext.jsx";
import { useToastContext } from "../../../Toast/Toast.jsx";
import "../../../style/sidebar.scss";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { reports, reportsLoading, deleteReport } = useInterview();
  const { user, handleLogout: logout } = useAuth();
  const { isOpen, closeSidebar } = useSidebar();
  const { showConfirm, showToast } = useToastContext();

  const handleNewInterview = () => {
    navigate("/");
    closeSidebar();
  };

  const handleReportClick = (reportId) => {
    navigate(`/interview/${reportId}`);
    closeSidebar();
  };

  const handleDelete = (event, reportId) => {
    event.stopPropagation();

    showConfirm( "Delete this interview report?",
      async () => {
        await deleteReport(reportId);

        // If the deleted report is currently open //
        // return to the home page //
        if (location.pathname === `/interview/${reportId}`) {
          navigate("/");
        }

        showToast("Report deleted.", "success");
      }, "Delete" );
  };

  const handleLogout = () => {
    showConfirm( "Log out of your account?",
      async () => {
        await logout();
        navigate("/login");
      }, "Log out" );
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const displayName = user?.username || user?.name || user?.email || "Guest";

  return (
    <>
      {/* Backdrop, only rendered on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="sidebar__backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        {/* New Interview */}
        <div className="sidebar__header">
          <button type="button" className="sidebar__new-interview"
            onClick={handleNewInterview}
          >
            <span className="sidebar__new-icon">+</span>

            <span>New Interview</span>
          </button>
        </div>

        {/* Reports */}
        <div className="sidebar__content">
          <div className="sidebar__section-header">
            <div className="sidebar__section-title">
              <span>My Reports</span>

              <span className="sidebar__count">
                {reportsLoading ? "..." : reports.length}
              </span>

            </div>
          </div>

          <div className="sidebar__reports">
            {reportsLoading ? (
              <>
                <div className="sidebar__report-skeleton">
                  <div className="sidebar__skeleton-icon" />

                  <div className="sidebar__skeleton-info">
                    <div className="sidebar__skeleton-title" />
                    <div className="sidebar__skeleton-date" />
                  </div>
                </div>

                <div className="sidebar__report-skeleton">
                  <div className="sidebar__skeleton-icon" />

                  <div className="sidebar__skeleton-info">
                    <div className="sidebar__skeleton-title" />
                    <div className="sidebar__skeleton-date" />
                  </div>
                </div>

                <div className="sidebar__report-skeleton">
                  <div className="sidebar__skeleton-icon" />

                  <div className="sidebar__skeleton-info">
                    <div className="sidebar__skeleton-title" />
                    <div className="sidebar__skeleton-date" />
                  </div>
                </div>
              </>
            ) : reports.length === 0 ? (
              <div className="sidebar__empty">
                <div className="sidebar__empty-icon">+</div>

                <p>No interview reports yet</p>

                <span>Create your first interview plan</span>
              </div>
            ) : (
              reports.map((report) => {
                const isActive = location.pathname === `/interview/${report._id}`;

                return (
                  <div key={report._id}
                    className={`sidebar__report ${isActive ? "sidebar__report--active" : ""}`}
                    onClick={() => handleReportClick(report._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        handleReportClick(report._id);
                      }
                    }}
                  >
                    <div className="sidebar__report-icon">
                      {report.title?.charAt(0)?.toUpperCase() || "I"}
                    </div>

                    <div className="sidebar__report-info">
                      <h4 title={report.title || "Untitled Position"}>
                        {report.title || "Untitled Position"}
                      </h4>

                      <span>{formatDate(report.createdAt)}</span>
                    </div>

                    <button type="button"
                      className="sidebar__delete"
                      onClick={(event) => handleDelete(event, report._id)}
                      aria-label={`Delete ${report.title || "interview report"}`}
                      title="Delete report"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* User / Logout */}
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="sidebar__user-info">
              <h4 title={displayName}>{displayName}</h4>
            </div>
          </div>

          <button type="button"
            className="sidebar__logout"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <FiLogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;