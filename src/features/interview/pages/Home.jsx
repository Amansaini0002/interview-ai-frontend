import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { FiBriefcase, FiUser, FiUploadCloud, FiInfo, FiZap, FiFileText, FiX, FiCheckCircle, FiLoader } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useToastContext } from "../../../Toast/Toast.jsx";
import ProfileBuilder from "../components/ProfileBuilder.jsx";
import { createProfile, getProfile, updateProfile, deleteProfile } from "../services/profile.api.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB //
const MAX_JOB_DESCRIPTION = 5000;
const MAX_SELF_DESCRIPTION = 2000;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const GENERATION_STEPS = [
  "Analyzing job description",
  "Analyzing your profile",
  "Identifying skill gaps",
  "Creating interview questions",
  "Building preparation roadmap",
];

// Returns an error message if the resume is invalid, otherwise "". //
function validateResume(file) {
  if (!file) return "Please select a resume.";

  const name = file.name.toLowerCase();
  const hasValidExtension = name.endsWith(".pdf") || name.endsWith(".docx");

  if (!hasValidExtension || !ALLOWED_TYPES.includes(file.type)) {
    return "Only PDF and DOCX files are supported.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Resume must be smaller than 5 MB.";
  }
  return "";
}

const Home = () => {
  const { loading, generateReport } = useInterview();
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const navigate = useNavigate();
  const resumeInputRef = useRef(null);

  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProfileBuilder, setShowProfileBuilder] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(null);

  const handleProfileSubmit = async (profile) => {
    try {
      let data;

      if (candidateProfile) {
        data = await updateProfile(profile);
      } else {
        data = await createProfile(profile);
      }

      setCandidateProfile(data.profile);
      setShowProfileBuilder(false);

      showToast(
        candidateProfile ? "Profile updated successfully." : "Profile created successfully.", "success" );
    } catch (error) {
      console.error("Profile save error:", error);

      showToast(
        error.response?.data?.message || "Failed to save profile. Please try again.", "error" );
    }
  };

  const handleReplaceProfile = async () => {
    try {
      await deleteProfile();

      setCandidateProfile(null);
      setShowReplaceConfirm(false);
      setShowProfileBuilder(true);

      showToast("Profile deleted. You can build a new profile.", "success");
    } catch (error) {
      console.error("Delete profile error:", error);

      showToast(
        error.response?.data?.message || "Failed to delete profile. Please try again.", "error" );
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        setCandidateProfile(data.profile);
      } catch (error) {
        // 404 simply means the user has not created a profile yet //
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

  const generating = loading || isSubmitting;
  const userName = user?.username || user?.name || "Your";

  // Cycle the Building  interview strategy steps while generating //
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!generating) {
      setActiveStep(0);
      return;
    }

    const stepDuration = 5000; // ms per step, tuned to the ~20-30s total wait //
    const interval = setInterval(() => {
      setActiveStep((prev) =>
        prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev,
      );
    }, stepDuration);

    return () => clearInterval(interval);
  }, [generating]);

  const clearResumeInput = () => {
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  };

  const handleResumeFile = (file) => {
    const error = validateResume(file);

    setFileError(error);
    setResumeFile(error ? null : file);

    if (error) {
      clearResumeInput();
      showToast(error, "error");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleResumeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleResumeFile(file);
  };

  const handleRemoveResume = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResumeFile(null);
    setFileError("");
    clearResumeInput();
  };

  const handleGenerateReport = async () => {
    if (generating) return;

    const trimmedJob = jobDescription.trim();
    const trimmedSelf = selfDescription.trim();

    if (!trimmedJob) {
      return showToast("Please enter a job description.", "error");
    }

    if (!resumeFile && !trimmedSelf && !candidateProfile) {
      return showToast( "Please upload a resume, provide a self description, or build your profile.", "error" );
    }

    if (resumeFile) {
      const error = validateResume(resumeFile);
      if (error) {
        setFileError(error);
        return showToast(error, "error");
      }
    }

    try {
      setIsSubmitting(true);

      const data = await generateReport({
        jobDescription: trimmedJob,
        selfDescription: trimmedSelf,
        resumeFile,
        candidateProfile,
      });

      if (!data) {
        return showToast(
          "Failed to generate your interview strategy. Please try again.",
          "error",
        );
      }

      showToast("Interview strategy generated successfully.", "success");
      navigate(`/interview/${data._id}`);
    } catch (error) {
      console.error("Generate interview report error:", error);
      showToast( error?.message || "Something went wrong. Please try again.", "error" );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home-page">
      <header className="page-header">
        <h1>
          Your AI-Powered <span className="highlight">Interview Coach</span>
        </h1>
        <p>
          {" "}
          AI analyzes your profile and job requirements to create a focused
          preparation plan for your target role.
        </p>
      </header>

      <div className="interview-card">
        <div className="interview-card__body">
          {/* Job description */}
          <div className="panel panel--left">
            <div className="panel__header">
              <span className="panel__icon">
                <FiBriefcase size={18} />
              </span>
              <h2>Target Job Description</h2>
              <span className="badge badge--required">Required</span>
            </div>

            <div className="textarea-wrapper">
              <textarea className="panel__textarea"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here..."
                maxLength={MAX_JOB_DESCRIPTION}
                disabled={generating}
              />
              <div className="char-counter">
                {jobDescription.length} / {MAX_JOB_DESCRIPTION} chars
              </div>
            </div>
          </div>

          <div className="panel-divider" />

          {/* Candidate profile */}
          <div className="panel panel--right">
            <div className="panel__header">
              <span className="panel__icon">
                <FiUser size={18} />
              </span>
              <h2>{userName}'s Profile</h2>
            </div>

            <div className="upload-section">
              <label className="section-label">
                Upload Resume
                <span className="badge badge--best">Best Results</span>
              </label>

              {resumeFile ? (
                <div className="resume-selected">
                  <div className="resume-selected__icon">
                    <FiFileText size={20} />
                  </div>

                  <div className="resume-selected__info">
                    <strong title={resumeFile.name}>{resumeFile.name}</strong>
                    <span>{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>

                  <FiCheckCircle
                    className="resume-selected__success"
                    size={17}
                  />
                  <button
                    type="button"
                    className="resume-selected__remove"
                    onClick={handleRemoveResume}
                    disabled={generating}
                    aria-label="Remove resume"
                    title="Remove resume"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="resume"
                  className={`dropzone ${dragActive ? "dropzone--active" : ""} ${fileError ? "dropzone--error" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={handleDrop}
                >
                  <span className="dropzone__icon">
                    <FiUploadCloud size={28} />
                  </span>

                  <p className="dropzone__title">
                    {dragActive ? "Drop your resume here" : "Click to upload or drag & drop"}
                  </p>
                  <p className="dropzone__subtitle">PDF or DOCX (Max 5MB)</p>
                  <input
                    ref={resumeInputRef}
                    hidden
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    disabled={generating}
                  />
                </label>
              )}

              {fileError && <p className="field-error">{fileError}</p>}
            </div>

            <div className="or-divider">
              <span>OR</span>
            </div>

            <div className="self-description">
              <label className="section-label" htmlFor="selfDescription">
                Quick Self-Description
              </label>

              <div className="textarea-wrapper">
                <textarea
                  id="selfDescription"
                  name="selfDescription"
                  className="panel__textarea panel__textarea--short"
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume..."
                  maxLength={MAX_SELF_DESCRIPTION}
                  disabled={generating}
                />
                <div className="char-counter">
                  {selfDescription.length} / {MAX_SELF_DESCRIPTION}
                </div>
              </div>
            </div>

            {candidateProfile && !selfDescription.trim() && (
              <p className="field-hint">
                <HiSparkles size={13} />
                Your self-description will be automatically generated from your
                profile.
              </p>
            )}

            {profileLoading ? (
              <div className="profile-loading">
                <FiLoader className="spin" size={16} />
                Loading your profile...
              </div>
            ) : candidateProfile ? (
              <div className="profile-ready">
                <div className="profile-ready__icon">
                  <FiCheckCircle size={18} />
                </div>

                <div className="profile-ready__content">
                  <strong>Profile Ready</strong>
                  <span>
                    {candidateProfile.name || "Your"}'s profile is ready for AI
                    preparation.
                  </span>
                </div>

                <div className="profile-ready__actions">
                  <button type="button"
                    className="profile-ready__edit"
                    onClick={() => setShowProfileBuilder(true)}
                    disabled={generating}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="profile-ready__replace"
                    onClick={() => setShowReplaceConfirm(true)}
                    disabled={generating}
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="build-profile-button"
                onClick={() => setShowProfileBuilder(true)}
                disabled={generating}
              >
                <HiSparkles size={16} />
                Build My Profile
              </button>
            )}

            <div className="info-box">
              <span className="info-box__icon">
                <FiInfo size={16} />
              </span>

              <p>
                A <strong>Resume</strong>, <strong>Self Description</strong>, or{" "}
                <strong>Candidate Profile</strong> is required to generate a
                personalized plan.
              </p>
            </div>
          </div>
        </div>

        <div className="interview-card__footer">
          <span className="footer-info">
            {generating ? "AI is analyzing your profile..." : "Personalized Interview Strategy • Ready in 30s"}
          </span>

          <button
            type="button"
            className={`generate-btn ${generating ? "generate-btn--loading" : ""}`}
            onClick={handleGenerateReport}
            disabled={generating}
          >
            {generating ? (
              <>
                <FiLoader className="spin" size={16} />
                Generating Strategy...
              </>
            ) : (
              <>
                <FiZap size={16} />
                Generate My Interview Strategy
              </>
            )}
          </button>
        </div>
      </div>

      {generating && (
        <div className="generation-overlay">
          <div className="generation-modal">
            <div className="generation-icon">
              <FiZap size={22} />
            </div>
            <h2>Building your interview strategy</h2>
            <p>Our AI is analyzing the job requirements and your profile.</p>

            <div className="generation-steps">
              {GENERATION_STEPS.map((step, i) => (
                <div
                  key={step}
                  className={`generation-step ${i === activeStep ? "generation-step--active" : ""} ${i < activeStep ? "generation-step--done" : ""}`}
                >
                  <span />
                  {step}
                </div>
              ))}
            </div>

            <div className="generation-progress">
              <span />
            </div>

            <small>This usually takes around 20–30 seconds.</small>
          </div>
        </div>
      )}

      {showProfileBuilder && (
        <ProfileBuilder
          initialProfile={candidateProfile}
          onClose={() => setShowProfileBuilder(false)}
          onSubmit={handleProfileSubmit}
        />
      )}

      {showReplaceConfirm && (
        <div className="replace-profile-overlay">
          <div className="replace-profile-modal">
            <div className="replace-profile-modal__icon">
              <FiUser size={20} />
            </div>

            <h3>Replace Your Profile?</h3>

            <p>
              Your current profile will be cleared and you can create a new
              profile.
            </p>

            <div className="replace-profile-modal__actions">
              <button type="button"
                className="replace-profile-modal__cancel"
                onClick={() => setShowReplaceConfirm(false)}
              >
                Cancel
              </button>

              <button type="button"
                className="replace-profile-modal__confirm"
                onClick={handleReplaceProfile}
              >
                Replace Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="page-footer">
        <span>© {new Date().getFullYear()} InterviewAI</span>
        {/* <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/help">Help Center</a> */}
      </footer>
    </div>
  );
};

export default Home;
