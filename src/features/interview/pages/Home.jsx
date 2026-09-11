import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { FiBriefcase, FiUser, FiUploadCloud, FiInfo, FiZap, FiFileText, FiX, FiCheckCircle, FiLoader } from "react-icons/fi";

import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useToastContext } from "../../../Toast/Toast.jsx";

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
        prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev
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
    if (!resumeFile && !trimmedSelf) {
      return showToast( "Please upload a resume or provide a self description.", "error" );
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
      });

      if (!data) {
        return showToast( "Failed to generate your interview strategy. Please try again.", "error" );
      }

      showToast("Interview strategy generated successfully.", "success");
      navigate(`/interview/${data._id}`);
    } catch (error) {
      console.error("Generate interview report error:", error);
      showToast(error?.message || "Something went wrong. Please try again.", "error");
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
        <p> AI analyzes your profile and job requirements to create a focused preparation plan for your target role.
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

                  <FiCheckCircle className="resume-selected__success" size={17} />
                  <button type="button"
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
                <label htmlFor="resume"
                  className={`dropzone ${dragActive ? "dropzone--active" : ""} ${ fileError ? "dropzone--error" : "" }`}
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
                  <input ref={resumeInputRef}
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
                <textarea id="selfDescription"
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

            <div className="info-box">
              <span className="info-box__icon">
                <FiInfo size={16} />
              </span>

              <p> Either a <strong>Resume</strong> or a{" "}
                <strong>Self Description</strong> is required to generate a
                personalized plan.
              </p>
            </div>
          </div>
        </div>

        <div className="interview-card__footer">
          <span className="footer-info">
            {generating ? "AI is analyzing your profile..." : "Personalized Interview Strategy • Ready in 30s"}
          </span>

          <button type="button"
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
                <div key={step}
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