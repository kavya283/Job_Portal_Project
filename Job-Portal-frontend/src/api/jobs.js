fetch("http://localhost:5000/api/jobs", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: localStorage.getItem("token"),
  },
  body: JSON.stringify(jobData),
});
