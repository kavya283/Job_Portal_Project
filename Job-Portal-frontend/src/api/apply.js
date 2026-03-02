fetch(`http://localhost:5000/api/jobs/apply/${jobId}`, {
  method: "POST",
  headers: {
    Authorization: localStorage.getItem("token"),
  },
});
