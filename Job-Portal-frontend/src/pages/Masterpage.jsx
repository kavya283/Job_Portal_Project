import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../assets/index.css";
import IMG1 from "../assets/masterpage.png";
import { FaUserTie, FaUserGraduate } from "react-icons/fa";

const Masterpage = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    document.body.classList.contains("dark")
  );

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="master-page-wrapper">
      {/* Standalone theme toggle button removed as requested */}

      <div className="custom-master-card">
        <div className="row g-0 master-row">
          {/* ===== Image Section ===== */}
          <div className="col-md-6 d-none d-md-block p-0 master-image-wrapper">
            <img src={IMG1} alt="Role Selection" className="master-image" />
          </div>

          {/* ===== Content Section ===== */}
          <div className="col-md-6 d-flex align-items-center">
            <div className="p-5 w-100">
              <h1 className="theme-heading">
                Select <br /> who you are
              </h1>

              <div className="role-card-container">
                <div
                  className="role-card"
                  onClick={() => navigate("/emplogin")}
                >
                  <FaUserTie className="role-icon" />
                  <h3>Employer</h3>
                  <p>Post jobs & manage applicants</p>
                </div>

                <div
                  className="role-card secondary"
                  onClick={() => navigate("/candidate/login")}
                >
                  <FaUserGraduate className="role-icon" />
                  <h3>Job Seeker</h3>
                  <p>Find jobs & apply instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Masterpage;