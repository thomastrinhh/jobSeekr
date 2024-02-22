// InternshipList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Function to read the job data from the database
function databaseRead() {
  return fetch('//localhost:2020/internships')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    });
};


function InternshipData() {
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    databaseRead()
      .then((data) => setInternships(data))
      .catch((error) => console.error(error));
  }, []);

  return (

      <div className="container"> {/* Use the new container class */}
        <nav className="navbar background">
        <ul className="nav-list rightnav">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/enroll">Mailing List</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </nav>
      <div className="center-container">
        <center><th>Browse through our current list of job opportunities!</th></center>
      </div>

  {/* Table to display internship data*/}
  <div className="internship-container">

        <hr></hr>
        <table className="internship-table">
          <thead>
            <tr>
              <th>Date Posted</th>
              <th>Company Name</th>
              <th>Position</th>
              <th>Location</th>
              <th>Remote</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {internships.map((opportunity, index) => (
              <tr key={index}>
                <td>{opportunity.DatePosted}</td>
                <td>{opportunity.CompanyName}</td>
                <td>{opportunity.Position}</td>
                <td>{opportunity.Location}</td>
                <td>{opportunity.REMOTE}</td>
                <td>
                <button
                    className="generate-button" onClick={() => window.open(opportunity.URL, '_blank')}>
                    Apply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InternshipData;