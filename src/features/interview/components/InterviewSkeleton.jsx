import React from "react";
import "../style/interview-skeleton.scss";

const InterviewSkeleton = () => {
    return (
        <div className="interview-skeleton">
            {/* Left Navigation */}
            <aside className="interview-skeleton__nav">
                <div className="skeleton skeleton--label" />

                <div className="skeleton skeleton--nav-item" />
                <div className="skeleton skeleton--nav-item" />
                <div className="skeleton skeleton--nav-item" />

                <div className="skeleton skeleton--button" />
            </aside>

            {/* Center Content */}
            <main className="interview-skeleton__content">
                <div className="interview-skeleton__header">
                    <div className="skeleton skeleton--heading" />
                    <div className="skeleton skeleton--count" />
                </div>

                <div className="interview-skeleton__questions">
                    <div className="skeleton skeleton--question" />
                    <div className="skeleton skeleton--question" />
                    <div className="skeleton skeleton--question" />
                    <div className="skeleton skeleton--question" />
                    <div className="skeleton skeleton--question" />
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className="interview-skeleton__sidebar">
                <div className="skeleton skeleton--score-label" />
                <div className="skeleton skeleton--score-ring" />
                <div className="skeleton skeleton--score-text" />

                <div className="skeleton skeleton--skill-label" />

                <div className="interview-skeleton__skills">
                    <div className="skeleton skeleton--skill" />
                    <div className="skeleton skeleton--skill" />
                    <div className="skeleton skeleton--skill" />
                    <div className="skeleton skeleton--skill" />
                </div>
            </aside>
        </div>
    );
};

export default InterviewSkeleton;