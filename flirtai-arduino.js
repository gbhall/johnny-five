const five = require("johnny-five");
const admin = require("firebase-admin");
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const chalk = require('chalk');  // Importing chalk for colored output

const serviceAccount = require("./flirtai-service-firebase-adminsdk-1tszc-f7568c9c13.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const board = new five.Board();

// Object to store how many times each userId has been seen
const userCount = {};

board.on("ready", async function() {
  const db = getFirestore();
  var led = new five.Led(13);

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
      });
    }, (error) => {
      console.error(chalk.red('Error fetching documents: '), error);
    });
});
