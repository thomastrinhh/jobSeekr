//============
// Home.js
//============

// Import required modules
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
//import { databaseRead } from './client'; // Import the databaseRead function
import axios from 'axios'; // Import axios for making HTTP requests
import './App.css';

// Home page
function Home() {
  const [jobTitle, setJobTitle] = useState('i.e. software engineer'); // Set the default value

  // Navigates user to internshipData page after clicking 'Generate' or pressing 'ENTER'
  const handleGenerateClick = async () => {
    try {

      // Append "internship" to the jobTitle
      const formattedJobTitle = `${jobTitle} internship`;

      // Send a POST request to insertData endpoint with the formatted jobTitle
      await axios.post('http://localhost:2020/insertData', { jobTitle: formattedJobTitle });

      // Fetch updated internship data after inserting
      const internships = await databaseRead();

      // Optionally, you can do something with the fetched data (e.g., update state)
      console.log('Fetched internship data:', internships);
    } catch (error) {
      console.error('Error generating data:', error);
    } finally {
      // Redirect the user to /internships using the Link component
      window.location.href = '/internships';
    }
  };

  const handleInputChange = (event) => {
    setJobTitle(event.target.value);
  };


  return (
    <div className="container">
      <nav className="navbar background">
        <ul className="nav-list rightnav">
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/enroll">Mailing List</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </nav>

      <div className="center-container">
        Enter job title: <br></br>
        <input
          type="text"
          id="keyword"
          value={jobTitle}
          onChange={handleInputChange}
          className="italic-input"
        /><br />
        <button onClick={handleGenerateClick} className="generate-button">
          Generate
        </button>
      </div>
    </div>
  );
}

export default Home;