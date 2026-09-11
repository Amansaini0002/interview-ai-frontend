import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteInterviewReport } from "../services/interview.api"
import { useContext, useEffect } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, downloading, setDownloading, reportsLoading, setReportsLoading, report, setReport, reportError, setReportError, reports, setReports } = context

   const generateReport = async ({ jobDescription, selfDescription, resumeFile
    }) => {
       setLoading(true);
       setReportError(null);

    try {
        const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });

        const newReport = response.interviewReport;

        setReport(newReport);

        // Add new report to sidebar immediately //
        setReports((prev) => [newReport, ...prev]);

        return newReport;

    } catch (error) {
    console.log(error);

    setReportError( error?.response?.data?.message || "Unable to generate your interview plan. Please try again." );

    return null;

    } finally {
        setLoading(false);
    }
};

   const getReportById = async (interviewId) => {
    setLoading(true);
    setReportError(null);

    try {
        const response = await getInterviewReportById(interviewId);

        setReport(response.interviewReport);

        return response.interviewReport;
    } catch (error) { console.log(error);

        setReport(null);

        setReportError( error?.response?.data?.message || "Unable to load your interview plan. Please try again." );

        return null;
    } finally {
        setLoading(false);
    }
   };

  const getReports = async () => {
    setReportsLoading(true);

    try {
        const response = await getAllInterviewReports();
        setReports(response.interviewReports);
        return response.interviewReports;
    } catch (error) {
        console.log(error);
        return null;
    } finally {
        setReportsLoading(false);
    }
};


  const getResumePdf = async (interviewReportId) => {
    setDownloading(true);

    try {
        const response = await generateResumePdf({ interviewReportId });

        const url = window.URL.createObjectURL(
            new Blob([response], { type: "application/pdf" })
        );

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `resume_${interviewReportId}.pdf`);

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.log(error);
    } finally {
        setDownloading(false);
    }
};

    const deleteReport = async (interviewId) => {
        try {
            await deleteInterviewReport(interviewId)
            setReports((prev) => prev.filter((r) => r._id !== interviewId))
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    
  // Main panel report loads only when viewing a specific interview //
    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])

    return { loading, downloading, reportsLoading, report, reportError, reports, generateReport, getReportById, getReports, getResumePdf, deleteReport };

}