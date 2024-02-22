// About.js
import React from 'react';
import {Link} from 'react-router-dom'; // Import the Link component from the react-router-dom library for creating client side navigation links
import './App.css'; // Import css styling 





function About() {
  return (
    <div>
      <div className="container">
        <nav className="navbar background">
          <ul className="nav-list rightnav">
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/enroll">Mailing List</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav>
        <div className="center-container">
          This is a full-stack application created in a course called Full Stack Development (CEN 4930). The stack uses Node.js, React, MySQL, Express, and JavaScript.
        </div>
        <div>
        </div>
      </div>
    </div>
  );
}

export default About;

