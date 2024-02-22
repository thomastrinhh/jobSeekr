//=========================================
// Enroll.js
// Enroll a new user to the mailing list
//=========================================

// Import required modules
import React from 'react';
import {Link} from 'react-router-dom'; // Import the Link component from the react-router-dom library for creating client side navigation links
import './App.css'; // Import css styling 


// Function to write user's credentials to the database
function databaseWrite() {
  console.log('Enrolling user...');

  const firstNameInput = document.getElementById('first_name');
  const lastNameInput = document.getElementById('last_name');
  const emailAddressInput = document.getElementById('email_address');
  const resultContainer = document.getElementById('database_server_write_result');

  if (!firstNameInput || !lastNameInput || !emailAddressInput || !resultContainer) {
    console.error('Error: Required elements not found in the DOM');
    return;
  }

  const first_name = firstNameInput.value;
  const last_name = lastNameInput.value;
  const email_address = emailAddressInput.value;

  const user = {
    firstname: first_name,
    lastname: last_name,
    emailaddress: email_address,
  };

  console.log('Object prepared for user inputs.');

  // Check if the user already exists in the database
  fetch('//localhost:2020/checkuser', {
    method: 'POST',
    body: JSON.stringify({ emailaddress: email_address }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {

      // If user already exists
      if (data.exists) {
        const infoMessage = document.createElement('div');
        infoMessage.textContent = 'You are already enrolled in the mailing list!';
        infoMessage.style.color = 'black';
        resultContainer.innerHTML = '';
        resultContainer.appendChild(infoMessage);

      // If user does not exist, enroll them into database
      } else {
        const requestInfo = {
          method: 'POST',
          body: JSON.stringify(user),
          headers: { 'Content-Type': 'application/json' },
        };

        // Fetch data from '/enroll' route
        fetch('//localhost:2020/enroll', requestInfo)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
          })
          .then((enrollData) => {
            console.log('Enrollment response:', enrollData.message);

            const successMessage = document.createElement('div');
            successMessage.textContent = enrollData.message;
            successMessage.style.color = 'green';
            resultContainer.innerHTML = '';
            resultContainer.appendChild(successMessage);

            setTimeout(() => {
              const redirectUrl = window.location.origin + '/home';
              window.location.href = redirectUrl;
            }, 2000);
          })
          .catch((error) => {
            console.error('Error:', error);
            resultContainer.innerHTML = 'Error';
          });


      }
    })
    .catch((error) => {
      console.error('Error:', error);
      resultContainer.innerHTML = 'Error';
    });
}


// Function to enroll new user
function Enroll() {
  const writeToDatabase = () => {
    databaseWrite();
  };
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
      Enroll into our mailing list to receive notifications on new internship opportunities!<br></br>

      <br></br>
        <input type="text" id="first_name" defaultValue="i.e. john" className="italic-input" /><br></br>
        <input type="text" id="last_name" defaultValue="i.e. doe" className="italic-input" /><br></br>
        <input type="text" id="email_address" defaultValue="i.e. email@domain.org" className="italic-input" /><br></br>
        <br></br>
        <button className="generate-button" onClick={writeToDatabase}>Enroll</button><br />
        <br></br>
        <div id="database_server_write_result"></div>
        <br></br>
      </div>
    </div>
  );
}

export default Enroll;
