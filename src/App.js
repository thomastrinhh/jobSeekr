//=========================
// Required modules
//=========================

import React from 'react'; 

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // react-router-dom allows screen changes using routes and links

// Define react pages
import Home from './Home'; 
import Enroll from './Enroll'; 
import About from './About'; 
import InternshipData from './InternshipData'; 


// Main application provides routes to other pages
function App() {
  return (
    // Create 'router' component to enable routing in the application
    <Router>
      <div>


        <Routes>
          {/* Route for root path, renders 'enroll' component */}
          <Route path="/" element={<Enroll />} />

          {/* Route for root path, renders 'Home' component */}
          <Route path="/enroll" element={<Enroll />} />

          {/* Route for the '/about' path that renders 'about' component */}
          <Route path="/home" element={<Home />} />

          {/* Route for the '/about' path that renders 'about' component */}
          <Route path="/about" element={<About />} />

		      {/* Route for the '/internships' path that renders InternshipData component */}
		      <Route path="/internships" element={<InternshipData />} />
        </Routes>

      </div>
    </Router>
  );
}

// Export 'App' component to make it accessible to other parts of the application
export default App;
