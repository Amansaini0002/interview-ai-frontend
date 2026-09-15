import React, { useState } from "react";
import {
  FiX,
  FiUser,
  FiBook,
  FiCode,
  FiBriefcase,
  FiFolder,
  FiAward,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import "../style/profileBuilder.scss";

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Skills & Experience" },
  { id: 3, label: "Projects & Certifications" },
];

const ProfileBuilder = ({ initialProfile, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState(
    initialProfile || {
      name: "",
      location: "",
      experienceLevel: "",
      education: "",
      skills: "",
      experience: "",
      projects: "",
      certifications: "",
    },
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const goNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const goBack = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(profile);
  };

  return (
    <div className="profile-builder-overlay">
      <div className="profile-builder">
        <div className="profile-builder_header">
          <div className="profile-builder__header-content">
            <div className="profile-builder__header-icon">
              <FiUser size={16} />
            </div>

            <div>
             <h2>{initialProfile ? "Edit Your Profile" : "Build Your Profile"}</h2>
              <p>
  {initialProfile
    ? "Update your profile information to keep your AI preparation accurate."
    : "Create your profile to get more accurate AI interview preparation."}
</p>
            </div>
          </div>

          <button
            type="button"
            className="profile-builder_close"
            onClick={handleClose}
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="profile-builder__steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div
                className={
                  "profile-builder__step" +
                  (step === s.id ? " is-active" : "") +
                  (step > s.id ? " is-done" : "")
                }
              >
                <span className="profile-builder__step-dot">
                  {step > s.id ? <FiCheck size={12} /> : s.id}
                </span>
                <span className="profile-builder__step-label">{s.label}</span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={
                    "profile-builder__step-connector" +
                    (step > s.id ? " is-done" : "")
                  }
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="profile-builder_section">
                <div className="profile-builder_section-title">
                  <FiUser size={18} />
                  <h3>Basic Information</h3>
                </div>

                <div className="profile-builder_grid">
                  <div className="profile-builder_field">
                    <label htmlFor="name">
                      Full Name <span>*</span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={profile.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="profile-builder_field">
                    <label htmlFor="location">Location</label>

                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={profile.location}
                      onChange={handleChange}
                      placeholder="Location"
                    />
                  </div>
                </div>

                <div className="profile-builder_field">
                  <label htmlFor="experienceLevel">
                    Experience Level <span>*</span>
                  </label>

                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={profile.experienceLevel}
                    onChange={handleChange}
                  >
                    <option value="">Select experience Level</option>
                    <option value="Fresher">Fresher</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="2+ years">2+ years</option>
                  </select>
                </div>
              </div>

              <div className="profile-builder__section">
                <div className="profile-builder__section-title">
                  <FiBook size={18} />
                  <h3>Education</h3>
                </div>

                <div className="profile-builder__field">
                  <label htmlFor="education">
                    Highest / Current Education <span>*</span>
                  </label>

                  <textarea
                    id="education"
                    name="education"
                    value={profile.education}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech in Computer Science."
                    rows={3}
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="profile-builder__section">
                <div className="profile-builder__section-title">
                  <FiCode size={18} />
                  <h3>Skills</h3>
                </div>

                <div className="profile-builder__field">
                  <label htmlFor="skills">
                    Technical Skills <span>*</span>
                  </label>

                  <textarea
                    id="skills"
                    name="skills"
                    value={profile.skills}
                    onChange={handleChange}
                    placeholder="e.g. JavaScript, React."
                    rows={3}
                  />

                  <small>Separate skills with commas.</small>
                </div>
              </div>

              <div className="profile-builder__section">
                <div className="profile-builder__section-title">
                  <FiBriefcase size={18} />
                  <h3>Experience</h3>
                  <span className="optional-label">Optional</span>
                </div>

                <div className="profile-builder__field">
                  <label htmlFor="experience">
                    Work / Internship Experience
                  </label>

                  <textarea
                    id="experience"
                    name="experience"
                    value={profile.experience}
                    onChange={handleChange}
                    placeholder="e.g. MERN Stack Intern at ABC Technologies, June 2026 – August 2026. Worked on..."
                    rows={4}
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="profile-builder__section">
                <div className="profile-builder__section-title">
                  <FiFolder size={18} />
                  <h3>Projects</h3>
                  <span className="optional-label">Optional</span>
                </div>

                <div className="profile-builder__field">
                  <label htmlFor="projects">Projects</label>

                  <textarea
                    id="projects"
                    name="projects"
                    value={profile.projects}
                    onChange={handleChange}
                    placeholder={`Example: 
InterviewAI — AI-powered interview preparation platform.
Technologies: React, Node.js, MongoDB, Gemini API.`}
                    rows={5}
                  />
                </div>
              </div>

              <div className="profile-builder__section">
                <div className="profile-builder__section-title">
                  <FiAward size={18} />
                  <h3>Certifications</h3>
                  <span className="optional-label">Optional</span>
                </div>

                <div className="profile-builder__field">
                  <label htmlFor="certifications">Certifications</label>

                  <textarea
                    id="certifications"
                    name="certifications"
                    value={profile.certifications}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Web Development — 2023"
                    rows={3}
                  />
                </div>
              </div>

              <div className="profile-builder__info">
                <strong>Your data stays in your profile</strong>
                <p>
                  {" "}
                  We only use the details you provide here. Nothing about your
                  education, skills, experience, projects, or certifications is
                  invented or inferred.
                </p>
              </div>
            </>
          )}

          <div className="profile-builder_footer">
            {step === 1 ? (
              <button
                type="button"
                onClick={handleClose}
                className="profile-builder_cancel"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={goBack}
                className="profile-builder_cancel"
              >
                <FiArrowLeft size={15} />
                Back
              </button>
            )}

            {step < STEPS.length ? (
              <button
                type="button"
                onClick={goNext}
                className="profile-builder_submit"
              >
                Next
                <FiArrowRight size={15} />
              </button>
            ) : (
              <button type="submit" className="profile-builder_submit">
                {initialProfile ? "Save Profile" : "Generate My Profile"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileBuilder;
