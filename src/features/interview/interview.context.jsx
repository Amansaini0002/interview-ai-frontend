import { createContext, useEffect, useState } from "react";
import { getAllInterviewReports } from "./services/interview.api";
import { useAuth } from "../auth/hooks/useAuth.js";

export const InterviewContext = createContext();

export const InterviewProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportError, setReportError] = useState(null);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setReports([]);
      setReport(null);
      setReportsLoading(false);
      return;
    }

    const fetchReports = async () => {
      setReportsLoading(true);
      setReportError(null);

      try {
        const response = await getAllInterviewReports();
        setReports(response.interviewReports || []);
      } catch (error) {
        console.log("Failed to fetch interview reports:", error);
        setReports([]);
        setReportError(error);
      } finally {
        setReportsLoading(false);
      }
    };

    fetchReports();
  }, [user, authLoading]);

  return (
    <InterviewContext.Provider
      value={{ loading, setLoading, downloading, setDownloading, reportsLoading, setReportsLoading, report, setReport, reportError, setReportError, reports, setReports }}>
      {children}
    </InterviewContext.Provider>
  );
};
