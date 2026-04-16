import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../api/axios";
import "../styles/SendOffer.css";

const SendOfferPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const application = state?.application;

  const [salary, setSalary] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!application) {
      toast.error("Application not found");
      navigate("/employer/home");
    }
  }, []);

  const handleSend = async () => {
    if (!salary || !joiningDate) {
      toast.error("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/offers", {
        candidate: application.candidate._id,
        job: application.job._id,
        salary,
        joiningDate,
      });

      toast.success("🎉 Offer Sent!");

      setTimeout(() => {
        navigate(`/job-applicants/${application.job._id}`, {
          state: { refresh: true },
        });
      }, 1200);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error sending offer");
    } finally {
      setLoading(false);
    }
  };

  if (!application) return null;

  return (
    <div className="offer-page">
      <Toaster />

      <h2>Send Offer</h2>

      <p>{application.candidate?.name}</p>

      <input
        type="number"
        placeholder="Salary"
        value={salary}
        onChange={(e) => setSalary(e.target.value)}
      />

      <input
        type="date"
        value={joiningDate}
        onChange={(e) => setJoiningDate(e.target.value)}
      />

      <button onClick={handleSend}>
        {loading ? "Sending..." : "Send Offer"}
      </button>
    </div>
  );
};

export default SendOfferPage;
