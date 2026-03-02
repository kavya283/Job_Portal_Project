import axios from "axios";

export const applyJobApi = (jobId) => {
  const token = localStorage.getItem("token");

  return axios.post(
    `http://localhost:5000/api/applications/apply/${jobId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
