import { useState } from "react";
import { fetchJobs } from "../api/jobApi";

function JobSearch({ setJobs }) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");

  const cities = [
    "Ahmedabad",
    "Surat",
    "Mumbai",
    "Delhi",
    "Bangalore"
  ];

  const handleSearch = async () => {
    const res = await fetchJobs(keyword, location);
    setJobs(res.data);
  };

  return (
    <div className="search-box">
      <input
        placeholder="Job Keyword"
        onChange={(e) => setKeyword(e.target.value)}
      />

      <select onChange={(e) => setLocation(e.target.value)}>
        <option value="">Select Location</option>
        {cities.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>

      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default JobSearch;
