const five = require("johnny-five");
const admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');
const chalk = require('chalk');  // Importing chalk for colored output

const HT16K33Display = require('./ht16k33');      // Import the display class
const Photoresistor = require('./photoresistor'); // Import the photoresistor class

const fs = require('fs');          // For file operations
const path = require('path');      // For handling file paths
const cron = require('node-cron'); // For scheduling tasks

const serviceAccount = require("./flirtai-service-firebase-adminsdk-1tszc-f7568c9c13.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Initialise board
const board = new five.Board();

// Object to store how many times each userId has been seen
let userCount = {};

// Initialize total posts counter
let totalPosts = 0;

// Initialize a timeout variable for debouncing totalPosts display
let totalPostsTimeout = null;

// Initialize a variable to manage the alternation interval
let alternateInterval = null;

// Flag to track current display state
let showingTotalPosts = true;

// Define the directory to save log files
const logsDir = path.join(__dirname, 'logs');

// Ensure the logs directory exists; if not, create it
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

board.on("ready", function () {
  // Firebase
  const db = getFirestore();

  // Arduino Components
  const led = new five.Led(13);

  // Initialize the HT16K33 Display
  const display = new HT16K33Display(this);

  // Optionally set initial blink rate and brightness
  display.setBlinkRate(HT16K33Display.BLINK_OFF); // No blink
  display.setBrightness(15); // Maximum brightness

  // Initialize and configure the Photoresistor
  const photoresistor = new Photoresistor(this, {
    pin: "A0",
    freq: 250,
    onData: (level) => {
      // Set brightness depending on threshold
      if (level > 1000) {
        if (display.currentBrightness != 0) { // Avoid unnecessary function calls
          display.setBrightness(0);
        }
      } else {
        if (display.currentBrightness != 15) {
          display.setBrightness(15);
        }
      }
    }
  });

  // Listening for the latest response in all user documents
  db.collectionGroup('responses')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const responseData = doc.data();
        const userId = doc.ref.parent.parent.id;  // Get the user ID from the parent document

        // Format the timestamp
        let timestamp = responseData.timestamp;
        let formattedTimestamp = "Unknown";  // Default value if no timestamp exists

        if (timestamp && timestamp.toDate) {
          formattedTimestamp = timestamp.toDate().toLocaleString(); // Convert Firestore timestamp to readable format
        }

        // Increment the count for the userId
        if (userCount[userId]) {
          userCount[userId] += 1;
        } else {
          userCount[userId] = 1;
        }

        // Increment total posts
        totalPosts += 1;

        // Get the number of times this userId has been seen
        const timesSeen = userCount[userId];

        // Logging with better formatting and colors
        console.log(chalk.gray.bold('===== New Response Fetched ====='));
        console.log(`${chalk.black.bold('User ID:')}        ${chalk.redBright.bold(userId)} (${chalk.yellow.bold(timesSeen)} times)`);
        console.log(`${chalk.black.bold('Response ID:')}    ${chalk.redBright(doc.id)}`);
        console.log(`${chalk.black.bold('Timestamp:')}      ${chalk.blueBright.bold(formattedTimestamp)}`);
        console.log(responseData);
        console.log(chalk.gray.bold('==============================\n'));

        // Turn the LED on
        led.on();

        // Turn the LED off after 250 milliseconds
        setTimeout(() => {
          led.off();
        }, 250);

        // Display timesSeen with DP on the fourth digit
        display.writeText(`${timesSeen}`.padStart(4, ' '), [false, false, false, true]);

        // Clear existing alternation interval if active
        if (alternateInterval) {
          clearInterval(alternateInterval);
          alternateInterval = null;
          showingTotalPosts = true; // Reset flag
        }

        // Debounce the totalPosts display
        // If a timeout is already set, clear it
        if (totalPostsTimeout) {
          clearTimeout(totalPostsTimeout);
        }

        // Set a new timeout to display totalPosts after 250ms
        totalPostsTimeout = setTimeout(() => {
          // Display totalPosts without DP
          display.writeText(`${totalPosts}`.padStart(4, ' '), [false, false, false, false]);
          totalPostsTimeout = null; // Reset the timeout variable

          // Start the alternation interval
          alternateInterval = setInterval(() => {
            if (showingTotalPosts) {
              display.writeText(`${totalPosts}`.padStart(4, ' '), [false, false, false, false], false);
            } else {
              // Calculate total number of unique users
              const userCountTotal = Object.keys(userCount).length;
              display.writeText(`U${userCountTotal.toString().padStart(3, ' ')}`, [false, false, false, false], false);
            }
            // Alternate
            showingTotalPosts = !showingTotalPosts;
          }, 1500); // Alternate every 1 second
        }, 500);
      });
    }, (error) => {
      console.error(chalk.red('Error fetching documents: '), error);
    });

  // Schedule a task to run every day at midnight
  cron.schedule('0 0 * * *', () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const timestamp = currentDate.toISOString();

    // Calculate total number of unique users
    const userCountTotal = Object.keys(userCount).length;

    // Prepare JSON data
    const logData = {
      date: timestamp,
      totalUsers: userCountTotal,
      totalPosts: totalPosts,
      userCounts: userCount
    };

    // Define filename with date
    const filename = `log-${formattedDate}.json`;
    const filePath = path.join(logsDir, filename);

    // Write JSON data to file
    fs.writeFile(filePath, JSON.stringify(logData, null, 2), (err) => {
      if (err) {
        console.error(chalk.red(`Error writing log file: ${err.message}`));
      } else {
        console.log(chalk.green(`Log file saved: ${filename}`));
      }
    });

    // Reset userCount and totalPosts
    userCount = {};
    totalPosts = 0;

    // Reset the display
    display.clearDisplay();
  });

  // Optional: Handle process exit to clean up resources
  process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    photoresistor.stop();
    display.clearDisplay();
    process.exit();
  });
});