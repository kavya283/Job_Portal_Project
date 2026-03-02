function JobList({ jobs }) {
    return (
      <div>
        {jobs.map(job => (
          <div key={job._id} className="job-card">
            <h3>{job.title}</h3>
            <p>{job.company}</p>
            <p>{job.location}</p>
          </div>
        ))}
      </div>
    );
  }
  
  export default JobList;
  