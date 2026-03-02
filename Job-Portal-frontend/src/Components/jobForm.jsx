import { useEffect, useState } from "react";
import "../styles/JobForm.css";


const JobForm = ({ job, onSubmit }) => {
  const [form, setForm] = useState({
    title: "",
    role: "", // Added to match schema
    location: "",
    salaryMin: "", // Updated field name
    salaryMax: "", // Updated field name
    description: "",
    status: "open",
  });

  useEffect(() => {
    if (job) setForm(job);
  }, [job]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <form className="job-form" onSubmit={(e) => onSubmit(e, form)}>
      <h3>{job ? "Edit Job" : "Post New Job"}</h3>

      <input
        name="title"
        placeholder="Job Title"
        value={form.title}
        onChange={handleChange}
        required
      />

      {/* Added Role input to match schema */}
      <input
        name="role"
        placeholder="Role (e.g. Senior Developer)"
        value={form.role}
        onChange={handleChange}
      />

      <input
        name="location"
        placeholder="Location"
        value={form.location}
        onChange={handleChange}
        required
      />

      <div className="salary-range">
        <input
          type="number"
          name="salaryMin"
          placeholder="Min Salary"
          value={form.salaryMin}
          onChange={handleChange}
        />
        <input
          type="number"
          name="salaryMax"
          placeholder="Max Salary"
          value={form.salaryMax}
          onChange={handleChange}
        />
      </div>

      <select name="status" value={form.status} onChange={handleChange}>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
        <option value="draft">Draft</option>
      </select>

      <textarea
        name="description"
        placeholder="Job Description"
        value={form.description}
        onChange={handleChange}
        rows={4}
        required
      />

      <button type="submit">
        {job ? "Update Job" : "Post Job"}
      </button>
    </form>
  );
};

export default JobForm;