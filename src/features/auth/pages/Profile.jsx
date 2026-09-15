import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { FiChevronLeft, FiBarChart2, FiTrendingUp, FiCalendar, FiTrash2, FiStar, FiClock, FiBook, FiTag } from "react-icons/fi";

import { useAuth } from "../hooks/useAuth.js";
import { useInterview } from "../../interview/hooks/useInterview.js";
import { useToastContext } from "../../../Toast/Toast.jsx";
import "../../../style/profile.scss";
import { getProfile } from "../../interview/services/profile.api.js";


const scoreClass = (score) => {
  if (score == null) return "";
  if (score >= 80) return "score--high";
  if (score >= 60) return "score--mid";
  return "score--low";
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) : "";


// Small presentational components //
const StatPill = ({ icon, value, label, valueClass = "" }) => (
  <div className="profile-pill">
    <div className="profile-pill__icon">{icon}</div>

    <strong className={valueClass} title={typeof value === "string" ? value : undefined}>
      {value}
    </strong>

    <span>{label}</span>
  </div>
);

const SnapshotItem = ({ icon, label, value, className = "" }) => (
  <div className={`profile-snapshot__item ${className}`}>
    <div className="profile-snapshot__item-icon">{icon}</div>

    <div className="profile-snapshot__item-body">
      <span>{label}</span>
      <strong title={typeof value === "string" ? value : undefined}>{value}</strong>
    </div>
  </div>
);


// Profile page //
const Profile = () => {
  const { user } = useAuth();
  const { reports, reportsLoading, deleteReport } = useInterview();
  const { showToast } = useToastContext();
  const navigate = useNavigate();

  const [candidateProfile, setCandidateProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const popoverRef = useRef(null);

  // Load candidate profile //
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setCandidateProfile(data.profile);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Failed to load candidate profile:", error);
        }
        setCandidateProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Close delete confirmation popover on outside click //
  useEffect(() => {
    const onClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setConfirmingId(null);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const displayName = user?.username || user?.name || "Guest";
  const profileDisplayName = candidateProfile?.name || displayName;
  const experienceLevel = candidateProfile?.experienceLevel || "Not specified";
  const education = candidateProfile?.education || "Not specified";

  const skills = candidateProfile?.skills
    ? candidateProfile.skills.split(",").map((skill) => skill.trim()).filter(Boolean) : [];

  // Interview statistics
  const avgScore = reports.length ? Math.round(reports.reduce((sum, r) => sum + (r.matchScore || 0), 0) / reports.length) : 0;

  const bestScore = reports.length ? Math.max(...reports.map((r) => r.matchScore || 0)) : 0;

  const mostRecent = reports.length ? reports.reduce((latest, r) =>
        new Date(r.createdAt) > new Date(latest.createdAt) ? r : latest ) : null;

  // Delete confirmation handlers //
  const openConfirm = (e, id) => {
    e.stopPropagation();
    setConfirmingId(id);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setConfirmingId(null);
  };

  const confirmDelete = async (e, id) => {
    e.stopPropagation();
    setConfirmingId(null);
    await deleteReport(id);
    showToast("Report deleted.", "success");
  };

  const goToDashboard = () => navigate("/");

  return (
    <main className="profile-page">
      <button type="button" className="profile-back" onClick={goToDashboard}>
        <FiChevronLeft />
        <span>Back to Dashboard</span>
      </button>

      <div className="profile-grid">
        {/* LEFT: identity + stats + career snapshot */}
        <aside className="profile-rail">
          <div className="profile-rail__glow" />

          <div className="profile-avatar">
            <span>{profileDisplayName.charAt(0).toUpperCase()}</span>
            <div className="profile-avatar__status" />
          </div>

          <h1 className="profile-name" title={profileDisplayName}>
            {profileDisplayName}
          </h1>

          <span className="profile-status">
            <i /> Active
          </span>

          {user?.username && <p className="profile-username">@{user.username}</p>}
          {user?.email && <p className="profile-email">{user.email}</p>}
          {candidateProfile?.location && (
            <p className="profile-location">{candidateProfile.location}</p>
          )}
          {user?.createdAt && (
            <p className="profile-joined">Member since {formatDate(user.createdAt)}</p>
          )}

          <div className="profile-rail__divider" />

          <div className="profile-pills">
            <StatPill icon={<FiBarChart2 />} value={reports.length} label="Reports" />

            <StatPill
              icon={<FiTrendingUp />}
              value={`${avgScore}%`}
              valueClass={scoreClass(avgScore)}
              label="Avg. Match"
            />

            <StatPill
              icon={<FiTrendingUp />}
              value={`${bestScore}%`}
              valueClass={scoreClass(bestScore)}
              label="Best Match"
            />

            <StatPill
              icon={<FiCalendar />}
              value={mostRecent ? formatDate(mostRecent.createdAt) : "—"}
              label="Last Activity"
            />
          </div>

          <div className="profile-rail__divider" />

          {/* Career snapshot now lives at the bottom of the identity rail */}
          <section className="profile-snapshot profile-snapshot--rail">
            <div className="profile-section-heading">
              <div>
                <span>CAREER SNAPSHOT</span>
                <h2>Professional Profile</h2>
              </div>
            </div>

            {profileLoading ? (
              <div className="profile-snapshot__loading">Loading profile...</div>
            ) : candidateProfile ? (
              <div className="profile-snapshot__grid">
                <SnapshotItem icon={<FiClock />} label="Experience Level" value={experienceLevel} />
                <SnapshotItem icon={<FiBook />} label="Education" value={education} />

                <div className="profile-snapshot__item profile-snapshot__item--skills">
                  <div className="profile-snapshot__item-icon">
                    <FiTag />
                  </div>

                  <div className="profile-snapshot__item-body">
                    <span>Core Skills</span>

                    {skills.length > 0 ? (
                      <div className="profile-snapshot__skills">
                        {skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    ) : (
                      <strong className="profile-snapshot__empty">No skills added yet</strong>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="profile-snapshot__empty profile-snapshot__empty--block">
                <strong>Profile not built yet</strong>
                <span>Build your professional profile from the dashboard.</span>
              </div>
            )}
          </section>

          <div className="profile-hero__badge">
            <span>AI Interviewer</span>
            <strong>Candidate</strong>
          </div>
        </aside>

        {/* RIGHT: performance + reports */}
        <div className="profile-main">
          {/* Interview performance */}
          {reports.length > 0 && (
            <section className="profile-performance">
              <div className="profile-section-heading">
                <div>
                  <span>PERFORMANCE</span>
                  <h2>Interview Readiness</h2>
                </div>

                <div
                  className={`performance-ring ${scoreClass(avgScore)}`}
                  style={{ "--pct": Math.min(avgScore, 100) }}
                >
                  <div className="performance-ring__fill" />
                  <div className="performance-ring__hole">
                    <strong>{avgScore}%</strong>
                  </div>
                </div>
              </div>

              <div className="performance-footer">
                <span>Overall interview readiness</span>
                <strong>
                  {avgScore >= 80
                    ? "Excellent performance"
                    : avgScore >= 60
                    ? "Good progress"
                    : "Keep practicing"}
                </strong>
              </div>
            </section>
          )}

          {/* Interview history */}
          <section className="profile-reports">
            <div className="profile-reports__header">
              <div>
                <span className="profile-reports__eyebrow">INTERVIEW HISTORY</span>
                <h2>My Reports</h2>
              </div>

              <span className="profile-reports__count">{reports.length}</span>
            </div>

            {reportsLoading ? (
              <div className="profile-reports__list">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="profile-reports__skeleton" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <div className="profile-reports__empty">
                <div className="profile-reports__empty-icon">
                  <FiStar />
                </div>

                <h3>No reports yet</h3>
                <p>
                  Complete your first AI interview to generate your personalized performance
                  report.
                </p>

                <button type="button" onClick={goToDashboard}>
                  Start Your First Interview
                </button>
              </div>
            ) : (
              <div className="profile-reports__list">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className={`report-card ${
                      confirmingId === report._id ? "report-card--confirming" : ""
                    }`}
                    onClick={() => navigate(`/interview/${report._id}`)}
                  >
                    <div className="report-card__icon">
                      {report.title?.charAt(0)?.toUpperCase() || "I"}
                    </div>

                    <div className="report-card__info">
                      <h3>{report.title || "Untitled Position"}</h3>

                      <div className="report-card__meta">
                        <span>{formatDate(report.createdAt)}</span>
                        <span>•</span>
                        <span>AI Interview</span>
                      </div>
                    </div>

                    {report.matchScore != null && (
                      <div className={`report-card__score ${scoreClass(report.matchScore)}`}>
                        <strong>{report.matchScore}%</strong>
                        <span>Match</span>
                      </div>
                    )}

                    <div className="report-card__actions">
                      <button
                        type="button"
                        className="report-card__delete"
                        onClick={(e) => openConfirm(e, report._id)}
                        aria-label={`Delete ${report.title || "interview report"}`}
                      >
                        <FiTrash2 />
                      </button>

                      {confirmingId === report._id && (
                        <div className="report-card__confirm" ref={popoverRef}>
                          <p>Delete this report?</p>

                          <div>
                            <button
                              type="button"
                              className="report-card__confirm-yes"
                              onClick={(e) => confirmDelete(e, report._id)}
                            >
                              Delete
                            </button>

                            <button
                              type="button"
                              className="report-card__confirm-no"
                              onClick={cancelDelete}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Profile;