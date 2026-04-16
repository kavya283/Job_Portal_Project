import { Routes, Route } from "react-router-dom";

/* ================= AUTH PAGES ================= */
import EmpLoginPage from "./pages/EmpLoginPage.jsx";
import EmpSignupPage from "./pages/EmpSignupPage.jsx";
import CandidateLoginPage from "./pages/CandidateLoginPage.jsx";
import CandidateSignupPage from "./pages/CandidateSignupPage.jsx";

/* ================= COMMON ================= */
import Masterpage from "./pages/Masterpage.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import Navbar from "./Components/Navbar.jsx";
import LoginSuccess from "./pages/LoginSuccess.jsx";

/* ================= CONTEXT ================= */
import { NotificationProvider } from "./context/NotificationContext.jsx";
import EmpNotifications from "./pages/EmpNotifications.jsx";
import CandNotifications from "./pages/CandNotifications.jsx";

/* ================= CANDIDATE PAGES ================= */
import CandidateHome from "./pages/CandidateHome.jsx";
import CandidateProfile from "./pages/CandidateProfile.jsx";
import JobSearch from "./pages/JobSearch.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import JobDetailsPage from "./pages/JobDetailsPage.jsx";
import ResumeEditor from "./pages/ResumeEditor.jsx";
import CandidateInterviews from "./pages/CandidateInterviews.jsx";
import OfferLetterPage from "./Components/OfferLetterPage.jsx";

/* ================= EMPLOYER PAGES ================= */
import EmpHomePage from "./pages/EmpHomePage.jsx";
import EmployerProfile from "./pages/EmployerProfile.jsx";
import PostJob from "./pages/PostJob.jsx";
import MyJobs from "./pages/MyJobs.jsx";
import JobApplicants from "./pages/JobApplicants.jsx";
import EmployerInterviewPage from "./pages/EmployerInterviewPage.jsx";
import SendOfferPage from "./pages/SendOfferPage.jsx";

/* ================= INTERVIEW SYSTEM ================= */
import ScheduleInterview from "./Components/ScheduleInterview.jsx"; // ✅ from Components
import EmailPreview from "./Components/EmailPreview.jsx";
import InterviewWizard from "./Components/InterviewWizard.jsx";
import ProgressTracker from "./Components/ProgressTracker.jsx";
import RoundTimeline from "./Components/RoundTimeline.jsx";
import InterviewCard from "./Components/InterviewCard.jsx";
/* ================= ASSESSMENT ================= */
import AssessmentStart from "./pages/AssessmentStart";
import AssessmentTest from "./pages/AssessmentTest";
import AssessmentResult from "./pages/AssessmentResult";
import AssessmentUpload from "./pages/AssessmentUpload";


function App() {
  return (
    <NotificationProvider>
      <Navbar />
      <main className="main-content">
        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Masterpage />} />
          <Route path="/emplogin" element={<EmpLoginPage />} />
          <Route path="/empsignup" element={<EmpSignupPage />} />
          <Route path="/candidate/login" element={<CandidateLoginPage />} />
          <Route path="/signup" element={<CandidateSignupPage />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />

          {/* ================= CANDIDATE PROTECTED ================= */}
          <Route
            path="/candidate/home"
            element={
              <ProtectedRoute role="candidate">
                <CandidateHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/profile"
            element={
              <ProtectedRoute role="candidate">
                <CandidateProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/jobs"
            element={
              <ProtectedRoute role="candidate">
                <JobSearch />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-applications"
            element={
              <ProtectedRoute role="candidate">
                <MyApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/notifications"
            element={
              <ProtectedRoute role="candidate">
                <CandNotifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/resume-editor"
            element={
              <ProtectedRoute role="candidate">
                <ResumeEditor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/candidate/interviews"
            element={
              <ProtectedRoute role="candidate">
                <CandidateInterviews />
              </ProtectedRoute>
            }
          />

          {/* ================= EMPLOYER PROTECTED ================= */}
          <Route
            path="/employer/home"
            element={
              <ProtectedRoute role="employer">
                <EmpHomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/profile"
            element={
              <ProtectedRoute role="employer">
                <EmployerProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/post-job"
            element={
              <ProtectedRoute role="employer">
                <PostJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/my-jobs"
            element={
              <ProtectedRoute role="employer">
                <MyJobs />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job-applicants/:jobId"
            element={
              <ProtectedRoute role="employer">
                <JobApplicants />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employer/notifications"
            element={
              <ProtectedRoute role="employer">
                <EmpNotifications />
              </ProtectedRoute>
            }
          />

          <Route path="/employer/interview/:applicationId"    
            element={
              <ProtectedRoute role="employer">
                <EmployerInterviewPage />
              </ProtectedRoute>
            }  />

          <Route
            path="/schedule-interview/:applicationId"
            element={
              <ProtectedRoute role="employer">
                <ScheduleInterview />
              </ProtectedRoute>
            }
          />

          {/* Assessment Routes */}
          <Route
            path="/assessment-upload/:jobId"
            element={<AssessmentUpload />}
          />

          <Route 
            path="/assessment/start/:jobId" 
            element={<AssessmentStart />} 
          />

          <Route 
            path="/assessment/test/:jobId" 
            element={<AssessmentTest />} 
          />

          <Route 
            path="/assessment/result/:jobId" 
            element={<AssessmentResult />} 
          />

          <Route
            path="/offers"
            element={
              <ProtectedRoute role="candidate">
                <OfferLetterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/send-offer/:jobId"
            element={
              <ProtectedRoute role="employer">
                <SendOfferPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </main>
    </NotificationProvider>
  );
}

export default App;
