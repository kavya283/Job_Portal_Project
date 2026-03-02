import { Routes, Route } from "react-router-dom";
/* Auth Pages */
import EmpLoginPage from "./pages/EmpLoginPage.jsx";
import EmpSignupPage from "./pages/EmpSignupPage.jsx";
import CandidateLoginPage from "./pages/CandidateLoginPage.jsx";
import CandidateSignupPage from "./pages/CandidateSignupPage.jsx";
/* Common */
import Masterpage from "./pages/Masterpage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx"; 
import LoginSuccess from "./components/LoginSuccess.jsx";
/* Context */
import { NotificationProvider } from "./context/NotificationContext.jsx";
import EmpNotifications from "./pages/EmpNotifications.jsx";
import CandNotifications from "./pages/CandNotifications.jsx";

/* Candidate Pages */
import CandidateHome from "./pages/CandidateHome.jsx";
import CandidateProfile from "./pages/CandidateProfile.jsx";
import JobSearch from "./pages/JobSearch.jsx";
import MyApplications from "./pages/MyApplications.jsx";
import JobDetailsPage from "./pages/JobDetailsPage.jsx"; // Fixed the ReferenceError
import ResumeEditor from "./pages/ResumeEditor.jsx";

/* Employer Pages */
import EmpHomePage from "./pages/EmpHomePage.jsx";
import EmployerProfile from "./pages/EmployerProfile.jsx";
import PostJob from "./pages/PostJob.jsx";
import MyJobs from "./pages/MyJobs.jsx";
import JobApplicants from "./pages/JobApplicants.jsx";

function App() {
  return (
    <NotificationProvider>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Masterpage />} />
          <Route path="/emplogin" element={<EmpLoginPage />} />
          <Route path="/empsignup" element={<EmpSignupPage />} />
          <Route path="/candidate/login" element={<CandidateLoginPage />} />
          <Route path="/signup" element={<CandidateSignupPage />} />
          <Route path="/login-success" element={<LoginSuccess />} />
          
          <Route path="/jobs/:id" element={<JobDetailsPage />} />

          {/* Candidate Protected Routes */}
          <Route path="/candidate/home" element={<ProtectedRoute role="candidate"><CandidateHome /></ProtectedRoute>} />
          <Route path="/candidate/profile" element={<ProtectedRoute role="candidate"><CandidateProfile /></ProtectedRoute>} />
          <Route path="/candidate/jobs" element={<ProtectedRoute role="candidate"><JobSearch /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute role="candidate"><MyApplications /></ProtectedRoute>} />
          <Route path="/candidate/notifications" element={<ProtectedRoute role="candidate"> <CandNotifications /></ProtectedRoute> }/>
          <Route path="/candidate/resume-editor" element={<ResumeEditor/>}/>

          
          {/* Employer Protected Routes */}
          <Route path="/employer/home" element={<ProtectedRoute role="employer"><EmpHomePage /></ProtectedRoute>} />
          <Route path="/employer/profile" element={<ProtectedRoute role="employer"><EmployerProfile /></ProtectedRoute>} />
          <Route path="/employer/post-job" element={<ProtectedRoute role="employer"><PostJob /></ProtectedRoute>} />
          <Route path="/employer/my-jobs" element={<ProtectedRoute role="employer"><MyJobs /></ProtectedRoute>} />
          <Route path="/job-applicants/:jobId" element={<ProtectedRoute role="employer"><JobApplicants /></ProtectedRoute>} />
          <Route path="/employer/notifications" element={<ProtectedRoute role="employer"> <EmpNotifications /></ProtectedRoute> }/>
        </Routes>
      </main>
    </NotificationProvider>
  );
}

export default App;