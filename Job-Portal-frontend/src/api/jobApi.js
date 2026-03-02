import axios from "axios";

export const postJobApi = (jobData) => {
  const token = localStorage.getItem("token");

  return axios.post(
    "http://localhost:5000/api/jobs/post",
    jobData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
