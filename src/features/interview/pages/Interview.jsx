import React, { useState } from "react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate, useParams } from "react-router";
import InterviewSkeleton from "../components/InterviewSkeleton.jsx";
import { FiDownload, FiCode, FiMessageSquare, FiNavigation, FiChevronDown } from "react-icons/fi";

const NAV_ITEMS = [
  {
    id: "technical",
    label: "Technical Questions",
    icon: <FiCode size={16} />
  },

  {
    id: "behavioral",
    label: "Behavioral Questions",
    icon: <FiMessageSquare size={16} />
  },

  {
    id: "roadmap",
    label: "Road Map",
    icon: <FiNavigation size={16} />
  },
];

// Sub-components //
const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="q-card">
      <div className="q-card__header" onClick={() => setOpen((o) => !o)}>
        <span className="q-card__index">Q{index + 1}</span>
        <p className="q-card__question">{item.question}</p>
        <span className={`q-card__chevron ${open ? "q-card__chevron--open" : ""}`} >
          <FiChevronDown size={16} />
        </span>
      </div>

      {open && (
        <div className="q-card__body">
          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--intention">
              Intention
            </span>
            <p>{item.intention}</p>
          </div>

          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--answer">
              Model Answer
            </span>
            <p>{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const RoadMapWeek = ({ milestone }) => (
  <div className="roadmap-day">
    <div className="roadmap-day__header">
      <span className="roadmap-day__badge">Week {milestone.week}</span>
      <h3 className="roadmap-day__focus">{milestone.theme}</h3>
    </div>

    <ul className="roadmap-day__tasks">
      {milestone.goals?.map((goal, i) => (
        <li key={`goal-${i}`}>
          <span className="roadmap-day__bullet" />
          {goal}
        </li>
      ))}
    </ul>

    {milestone.resources?.length > 0 && (
      <div className="roadmap-day__resources">
        <span className="q-card__tag q-card__tag--intention">Resources</span>
        <ul className="roadmap-day__tasks">
          {milestone.resources.map((resource, i) => (
            <li key={`res-${i}`}>
              <span className="roadmap-day__bullet" />
              {resource}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// Main Component //
const Interview = () => {
  const [activeNav, setActiveNav] = useState("technical");
  const { report, reportError, loading, downloading, getResumePdf } = useInterview();
  const { interviewId } = useParams();

  if (loading) {
    return <InterviewSkeleton />;
  }

  if (reportError || !report) {
    return (
      <main className="interview-error">
        <div className="interview-error__content">
          <div className="interview-error__icon">!</div>

          <h1>Unable to load interview plan</h1>

          <p>{reportError || "This interview report could not be found."}</p>

          <button type="button" className="button primary-button" onClick={() => window.history.back()} >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const scoreColor = report.matchScore >= 80 ? "score--high" : report.matchScore >= 60 ? "score--mid" : "score--low";

  return (
    <div className="interview-page">
      <div className="interview-layout">
        
        {/* Left Nav  */}
        <nav className="interview-nav">
          <div className="nav-content">
            <p className="interview-nav__label">Sections</p>
            {NAV_ITEMS.map((item) => (
              <button key={item.id}
                className={`interview-nav__item ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="interview-nav__icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          <button onClick={() => {
              getResumePdf(interviewId);
            }}
            className="button primary-button"
          >
            <FiDownload size={14} style={{ marginRight: "0.8rem" }} />
            {downloading ? "Generating..." : "Download Resume"}
          </button>
        </nav>

        <div className="interview-divider" />

        {/* Center Content */}
        <main className="interview-content">
          {activeNav === "technical" && (
            <section>
              <div className="content-header">
                <h2>Technical Questions</h2>
                <span className="content-header__count">
                  {report.technicalQuestions?.length ?? 0} questions
                </span>
              </div>
              
              <div className="q-list">
                {report.technicalQuestions?.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === "behavioral" && (
            <section>
              <div className="content-header">
                <h2>Behavioral Questions</h2>
                <span className="content-header__count">
                  {report.behavioralQuestions?.length ?? 0} questions
                </span>
              </div>
              <div className="q-list">
                {report.behavioralQuestions?.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === "roadmap" && (
            <section>
              <div className="content-header">
                <h2>Preparation Road Map</h2>
                <span className="content-header__count">
                  {report.roadmap?.durationWeeks ?? report.roadmap?.milestones?.length ?? 0}
                  -week plan
                </span>
              </div>
              <div className="roadmap-list">
                {report.roadmap?.milestones?.map((milestone) => (
                  <RoadMapWeek key={milestone.week} milestone={milestone} />
                ))}
              </div>
            </section>
          )}
        </main>

        <div className="interview-divider" />

        {/* Right Sidebar  */}
        <aside className="interview-sidebar">
          {/* Match Score */}
          <div className="match-score">
            <p className="match-score__label">Match Score</p>
            <div className={`match-score__ring ${scoreColor}`}>
              <span className="match-score__value">{report.matchScore}</span>
              <span className="match-score__pct">%</span>
            </div>
            <p className="match-score__sub">Strong match for this role</p>
          </div>

          <div className="sidebar-divider" />

          {/* Skill Gaps */}
          <div className="skill-gaps">
            <p className="skill-gaps__label">Skill Gaps</p>
            <div className="skill-gaps__list">
              {report.skillGaps?.map((gap, i) => (
                <span key={i} className={`skill-tag skill-tag--${gap.severity}`} >
                  {gap.skill}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Interview;
