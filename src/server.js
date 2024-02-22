const mysql = require('mysql'); // mySQL module for database interaction/manipulation
const axios = require('axios'); // For making API requests (for our routes/JSearch API functionality)
const express = require('express'); // Express framework (web applications and APIs)
const cors = require('cors') // Require CORS middleware to facilitate server/web page communication
const path = require('path'); // Module to work with file and directory paths
const bodyParser = require('body-parser'); // Body parser module to parse incoming request bodies into the correct format (e.g. json or xml)
const nodemailer = require('nodemailer'); // Send emails
const url = require('url'); // For job data API


const app = express(); // Create an Express instance called app. 
app.use(cors()); // Utilize Cross Origin Resource Sharing from express instance
app.use(bodyParser.json()); //Parse JSON's




//==================
// POST/GET Routes
//==================

// Repopulate database witH job data. Calls searchJobsByKeyword() to pull job data from API
// Then insertDataIntoDatabase() to purge old company data and repopulate with new data.
app.post('/insertData', async (req, res) => {
  const { jobTitle } = req.body;

  try {
    // Get database connection
    const dbConnection = await connectToDatabase();

    console.log('Awaiting JSearch API...');

    // Call function that handles API 
    const apiData = await searchJobsByKeyword(jobTitle);

    console.log('JSearch API connection successful!');

    // If data not empty or null
    if (apiData.length > 0) {

      // Call insertDataIntoDatabase() function and passs it the database connection and array of api data
      await insertDataIntoDatabase(dbConnection, apiData);
      res.status(200).json({ message: 'Data inserted successfully' });
    } else {
      console.log('No job listings found.');
      res.status(404).json({ message: 'No job listings found' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Enroll a new user into the database and send email (Enroll.js)
app.post('/enroll', (req, res) => {
  const { firstname, lastname, emailaddress } = req.body;

  const sqlQuery = `INSERT INTO users (firstname, lastname, emailaddress) VALUES (?, ?, ?)`;
  const values = [firstname, lastname, emailaddress];

  connection.query(sqlQuery, values, (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    } else {

      // Success message if user enrolled successfully
      const message = `Success!`;
      console.log('New user enrolled:', firstname, lastname,", Email:", emailaddress);

      // Send email
      sendEmail(firstname, lastname, emailaddress);

      console.log('Server-side email sent to the following user: ', emailaddress);

      res.status(201).json({ message, style: 'color: white;' });
    }
  });
});


// Enroll a new user into the database (Enroll.js)
app.post('/enroll', (req, res) => {
  const { firstname, lastname, emailaddress } = req.body;

  const sqlQuery = `INSERT INTO users (firstname, lastname, emailaddress) VALUES (?, ?, ?)`;
  const values = [firstname, lastname, emailaddress];

  connection.query(sqlQuery, values, (err, result) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    } else {
      const message = `User enrolled successfully: ${firstname} ${lastname}, Email: ${emailaddress}`;
      console.log('New user enrolled:', firstname, lastname,", Email:", emailaddress);


      // Add an inline style to change the text color to white
      res.status(201).json({ message, style: 'color: white;' });
    }
    
  });
});


// Validate user by checking if email address already exists (Enroll.js)
app.post('/checkuser', (req, res) => {

  // Note: Using POST instead of GET since GET is less secure (email is sent as part of URL)

  const { emailaddress } = req.body;

  const sqlQuery = 'SELECT * FROM users WHERE emailaddress = ?';
  const values = [emailaddress];

  connection.query(sqlQuery, values, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ exists: false }); // Return exists as false to handle the error
    } else {
      if (results.length > 0) {
        // User with the given email address already exists
        res.status(200).json({ exists: true });
      } else {
        // User with the given email address does not exist
        res.status(200).json({ exists: false });
      }
    }
  });
});


// Retrieve internship opportunities
app.get('/internships', (req, res) => {

  // Database query, order by most recent job postings
  const sqlQuery = 'SELECT * FROM COMPANIES ORDER BY DatePosted DESC;';

  connection.query(sqlQuery, (err, results) => {
    if (err) {
      console.error('Error executing SQL query:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    } else {
      console.log('Job data successfully populated in database.');
      console.log(results);
      res.status(200).json(results);
    }
  });
});



//=====================================================
// User enrollment email + JSearch API functionalities
//=====================================================

// Function to send email to user using node module nodemailer
function sendEmail(firstname, lastname, email) {
  const transporter = nodemailer.createTransport({
    service: 'zoho',
    auth: {
      user: 'fullstackapp@zohomail.com',
      pass: 'internshipfinder123',
    },
  });

  const mailOptions = {
    from: 'fullstackapp@zohomail.com',
    to: email,
    subject: 'Enrollment Confirmation',
    text: `Dear ${firstname} ${lastname},\n\nThank you for enrolling in our mailing list!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}


// Fetch job data from JSearch API (API retrieved from rapidapi.com)
async function searchJobsByKeyword(jobTitle) {
  const options = {
    method: 'GET',
    url: 'https://jsearch.p.rapidapi.com/search',
    params: {
      query: jobTitle,
      page: '1',
      num_pages: '5'
    },
    headers: {
      'X-RapidAPI-Key': 'e5f12c429fmsh4db7f779c772fcdp1b99d6jsn191627d285de',
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  };

  // Error handling
  try {
    const response = await axios.request(options); // Make request to API using the specified options above
    console.log('Connected to JSearch API!'); // Success message
    const { data: jobData } = response.data; // Pull data from the response
    return jobData || [];// Return the job data or an empty array if jobData is null

    // If API connection fails
  } catch (error) {
    console.error('Error connecting to JSearch API:', error);
    return []; // Return an empty array in case of an error
  }
}


// Purge old job data, insert new job data from API into database using a for loop to iterate through each element of job data array
async function insertDataIntoDatabase(dbConnection, apiData) {

  // SQL query to purge the 'companies' table
  const purgeQuery = 'DELETE FROM companies';

  dbConnection.query(purgeQuery, (error, purgeResults) => {
    if (error) {
      console.error('Error purging data from database:', error);
    } else {
      console.log('Purged', purgeResults.affectedRows, 'rows from companies table');

      
      // SQL query for insertion
      const insertQuery =
        'INSERT INTO companies (DatePosted, CompanyName, Position, Location, Remote, URL) VALUES (?, ?, ?, ?, ?, ?)';


      // For loop to iterate through each job and insert each job listing
      for (const job of apiData) {
        // Assign a variable to store the time data pulled from API
        const utcTime = job.job_posted_at_datetime_utc;

        // Create a Date object from the input UTC time
        const dateObject = new Date(utcTime);

        // Extract year, month, and day components from the Date object
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-indexed
        const day = String(dateObject.getDate()).padStart(2, '0');

        // Format the components into the desired format
        const formattedDate = `${year}-${month}-${day}`;

        // If JSearch returns 1 then company allows remote, changing this to "Yes" for better readability
        if (job.job_is_remote == 1) {
          job.job_is_remote = 'Yes';
        }

        // Create array of data and input the value if it exists, otherwise input unknown
        const data = [
          formattedDate || 'Unknown Time',
          job.employer_name || 'Unknown Company',
          job.job_title || 'Unknown Position',
          job.job_city || 'Unknown Location',
          job.job_is_remote || 'Unknown', // 1 = remote, 0 = not remote
          job.job_apply_link || '',
        ];

        // Execute the query to insert the job data into database
        dbConnection.query(insertQuery, data, (insertError, insertResults) => {
          if (insertError) {
            console.error('Error inserting data into database:', insertError);
          } else {
            console.log('Inserted', insertResults.affectedRows, 'rows');
          }
        });
      }
      console.log('Job data population complete.')
      dbConnection.end(); // Close database connection
    }
  });
}


//====================================================================
// Functions to make database connection and start the node server
//====================================================================


// Create connection to mySQL database for Node.js functionalities
const connection = mysql.createConnection({
  // Credentials for database access
  host: 'localhost',
  user: 'root',
  password: 'fgcu',
  database: 'fullstack'
});


// Make connection to mySQL database for Node.js functionalities
connection.connect((err) => {
  // If connection not successfully made
  if (err) {
    console.error('Error connecting to mySQL database:', err);
    throw err;
  }
  console.log('mySQL database connection successful.'); 
  
});


// Function to connect to the mySQL database for API functionalities
async function connectToDatabase() {
	
  // Return a promise to handle connection (resolve if operation successful, reject if not)
  return new Promise((resolve, reject) => {
    // Create a MySQL connection object with connection details
    const connection = mysql.createConnection({
      host: 'localhost', // mySQL host
      user: 'root',      // mySQL username
      password: 'fgcu',  // mySQL password
      database: 'fullstack' // mySQL database name
    });

    // Attempt to establish a connection to the database
    connection.connect(function(err) {
      if (err) {
        // If there's an error, reject the promise with the error
        reject(err);
      } else {
        // If the connection is successful, log the success message
        console.log('Database connection successful.');
        // Resolve the promise with the connected connection object
        resolve(connection);
      }
    });
  });
}


const port = 2020; // Port number

// Start the server on the port number
app.listen(port, () => {
  // Print to console if server connection was successful
  console.log(`Currently on main server: Port ${port}`);
});
