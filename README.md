# HT16K33 Display Library

## Table of Contents
- [Introduction](#introduction)
- [Author](#author)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Importing the Library](#importing-the-library)
  - [Initializing the Display](#initializing-the-display)
  - [Control Methods](#control-methods)
    - [Setting Blink Rate](#setting-blink-rate)
    - [Setting Brightness](#setting-brightness)
    - [Writing Characters](#writing-characters)
    - [Writing Text](#writing-text)
    - [Scrolling Text](#scrolling-text)
    - [Clearing the Display](#clearing-the-display)
- [API Documentation](#api-documentation)
  - [HT16K33Display Class](#ht16k33display-class)
    - [Constructor](#constructor)
    - [Methods](#methods)
- [Example](#example)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Introduction

This **HT16K33 Display Library** is a JavaScript module designed to interface with the **HT16K33 Quad 14 Segment Alphanumeric Display Module** using the [Johnny-Five](https://github.com/rwaldron/johnny-five) robotics and IoT library. This library provides a class-based structure to easily control and manipulate the display, offering functionalities such as setting blink rates, adjusting brightness, displaying characters and text, scrolling messages, and clearing the display.

## Author

**Gareth Blake Hall**

## Features

- **Class-Based Structure:** Encapsulates all display functionalities within a reusable class.
- **Blink Rate Control:** Set the display to blink at various rates or remain steady.
- **Brightness Adjustment:** Dynamically adjust the display brightness from minimum to maximum.
- **Character Display:** Render individual characters with optional decimal points.
- **Text Display:** Show up to four characters simultaneously.
- **Text Scrolling:** Scroll longer messages across the display.
- **Display Clearing:** Easily clear all segments and decimal points.
- **Debugging Support:** Logs I2C communication data in binary format for troubleshooting.

## Installation

1. **Clone the Repository:**
   
   ```bash
   git clone https://github.com/gbhall/johnny-five.git
   cd johnny-five
   ```

2. **Install Dependencies:**
   
   Ensure you have [Node.js](https://nodejs.org/) installed. Then, install the necessary packages:
   
   ```bash
   npm install johnny-five
   ```

3. **Library Files:**
   
   Ensure that the following files are present in your project directory:
   
   - `ht16k33.js` — The main display control class.
   - `bitmap.js` — Contains the bitmap mappings for characters.
   
   *Note: Ensure that the `bitmap.js` file is correctly referenced in `ht16k33.js`.*

## Usage

### Importing the Library

First, import the `HT16K33Display` class into your project:

```javascript
const five = require("johnny-five");
const HT16K33Display = require('./ht16k33'); // Adjust the path as necessary
```

### Initializing the Display

Initialize the Johnny-Five board and the HT16K33 display within the board's `ready` event:

```javascript
const board = new five.Board();

board.on("ready", function() {
  // Initialize the HT16K33 Display
  const display = new HT16K33Display(this);
  
  // Optionally set initial blink rate and brightness
  display.setBlinkRate(HT16K33.BLINK_OFF); // No blink
  display.setBrightness(15); // Maximum brightness
  
  // Your additional code here...
});
```

### Control Methods

#### Setting Blink Rate

Control the blink rate of the display. Available rates:
- `HT16K33.BLINK_OFF` (0): No blinking.
- `HT16K33.BLINK_2HZ` (1): 2 Hz blink.
- `HT16K33.BLINK_1HZ` (2): 1 Hz blink.
- `HT16K33.BLINK_HALFHZ` (3): 0.5 Hz blink.

```javascript
// Turn off blinking
display.setBlinkRate(HT16K33.BLINK_OFF);

// Set to blink at 1 Hz
display.setBlinkRate(HT16K33.BLINK_1HZ);
```

#### Setting Brightness

Adjust the brightness level of the display. Brightness levels range from `0` (minimum) to `15` (maximum).

```javascript
// Set brightness to half
display.setBrightness(7);

// Set brightness to maximum
display.setBrightness(15);
```

#### Writing Characters

Display a single character at a specified position with an optional decimal point.

```javascript
// Write 'A' to position 0 without DP
display.writeCharacter('A', 0, false);

// Write '3' to position 1 with DP
display.writeCharacter('3', 1, true);
```

#### Writing Text

Display a string of up to four characters with optional decimal points for each character.

```javascript
// Display "A3B2" with DPs on 'A' and 'B'
display.writeText("A3B2", [true, false, true, false]);
```

#### Scrolling Text

Scroll a longer text message across the display at specified intervals.

```javascript
// Start scrolling "HELLO" with no DPs and 500ms interval
const scrollInterval = display.scrollText("HELLO", 500, [false, false, false, false], false);

// To stop scrolling after one complete cycle
// const scrollInterval = display.scrollText("HELLO", 500, [false, false, false, false], true);
```

#### Clearing the Display

Clear all characters and decimal points from the display.

```javascript
display.clearDisplay();
```

## API Documentation

### HT16K33Display Class

The `HT16K33Display` class provides methods to control the HT16K33 Quad 14 Segment Alphanumeric Display.

#### Constructor

```javascript
new HT16K33Display(board, address = 0x70)
```

- **Parameters:**
  - `board` (object): The Johnny-Five board instance.
  - `address` (number, optional): The I2C address of the HT16K33 display. Default is `0x70`.

- **Description:**
  Initializes the display by configuring I2C communication, turning on the oscillator, setting the blink rate, and initializing brightness.

#### Methods

##### `setBlinkRate(rate)`

```javascript
setBlinkRate(rate)
```

- **Parameters:**
  - `rate` (number): Blink rate setting.
    - `HT16K33.BLINK_OFF` (0): No blinking.
    - `HT16K33.BLINK_2HZ` (1): 2 Hz blink.
    - `HT16K33.BLINK_1HZ` (2): 1 Hz blink.
    - `HT16K33.BLINK_HALFHZ` (3): 0.5 Hz blink.

- **Description:**
  Sets the blink rate of the display based on predefined constants.

##### `setBrightness(level)`

```javascript
setBrightness(level)
```

- **Parameters:**
  - `level` (number): Brightness level (0 to 15).

- **Description:**
  Adjusts the brightness of the display. Ensures that the brightness level stays within the valid range.

##### `writeCharacter(char, position, dot = false)`

```javascript
writeCharacter(char, position, dot = false)
```

- **Parameters:**
  - `char` (string): The character to display.
  - `position` (number): The display position (0 to 3).
  - `dot` (boolean, optional): Whether to illuminate the decimal point (DP). Default is `false`.

- **Description:**
  Writes a single character to a specified position on the display, optionally activating the DP.

##### `writeText(str, dots = [])`

```javascript
writeText(str, dots = [])
```

- **Parameters:**
  - `str` (string): The string to display (maximum 4 characters).
  - `dots` (array of boolean, optional): Indicates which characters have DPs (e.g., `[false, true, false, true]`).

- **Description:**
  Displays a string on the 4x14 segment display, handling up to four characters and their respective DPs.

##### `scrollText(text, interval = 500, dots = [], stop = false)`

```javascript
scrollText(text, interval = 500, dots = [], stop = false)
```

- **Parameters:**
  - `text` (string): The text to scroll.
  - `interval` (number, optional): Interval in milliseconds between scroll steps. Default is `500`.
  - `dots` (array of boolean, optional): Indicates which characters have DPs.
  - `stop` (boolean, optional): Whether to stop scrolling after one complete cycle. Default is `false`.

- **Returns:**
  - `Interval ID` (object): The Interval ID for the scrolling process, which can be used to stop scrolling.

- **Description:**
  Scrolls a given text across the display at specified intervals. Pads the text with spaces to ensure smooth scrolling.

##### `clearDisplay()`

```javascript
clearDisplay()
```

- **Description:**
  Clears all characters and DPs from the display by writing zeros to all segment registers.

##### `toBinary(byte)`

```javascript
toBinary(byte)
```

- **Parameters:**
  - `byte` (number): The byte to convert.

- **Returns:**
  - `string`: Binary representation of the byte with leading zeros.

- **Description:**
  Converts a byte to its binary string representation, prefixed with `0b` and padded with leading zeros for consistency in logging.

## Example

Below is an example demonstrating how to use the `HT16K33Display` class within a Johnny-Five board setup. This example initializes the display, sets blink rate and brightness, displays text, scrolls a message, and handles graceful shutdown.

```javascript
// example.js

const five = require("johnny-five");
const HT16K33Display = require('./ht16k33'); // Adjust the path as necessary

const board = new five.Board();

board.on("ready", function() {
  // Initialize the HT16K33 Display
  const display = new HT16K33Display(this);

  // Set blink rate to 1 Hz
  display.setBlinkRate(HT16K33.BLINK_1HZ);

  // Set brightness to medium
  display.setBrightness(8);

  // Display "Hi! "
  display.writeText("Hi! ", [false, false, false, false]);

  // Scroll "Welcome" across the display every 500ms
  const scrollInterval = display.scrollText("Welcome", 500, [false, false, false, false], false);

  // Stop scrolling after 10 seconds
  setTimeout(() => {
    clearInterval(scrollInterval);
    display.clearDisplay();
    console.log("Scrolling stopped and display cleared.");
  }, 10000);
});
```

**Running the Example:**

1. **Ensure Hardware Connection:**
   - Connect the HT16K33 display module via I2C to your microcontroller (e.g., Arduino).

2. **Execute the Script:**

   ```bash
   node example.js
   ```

**Expected Behavior:**

- The display will blink at 1 Hz.
- Brightness is set to a medium level.
- The text "Hi! " is displayed initially.
- The word "Welcome" scrolls across the display every 500 milliseconds.
- After 10 seconds, scrolling stops, and the display is cleared.

## Troubleshooting

### Common Issues

1. **I2C Communication Errors:**
   - **Symptom:** Display not responding or showing unexpected characters.
   - **Solution:**
     - Verify the I2C connections between the microcontroller and the display.
     - Ensure the correct I2C address is used (`0x70` by default).
     - Check for loose wires or faulty connections.

2. **Brightness Not Adjusting:**
   - **Symptom:** Changes in brightness level have no effect.
   - **Solution:**
     - Confirm that the `setBrightness` method is called with valid values (0 to 15).
     - Ensure that the display is properly initialized.

3. **Blink Rate Not Changing:**
   - **Symptom:** Display does not blink or blinks at incorrect rates.
   - **Solution:**
     - Ensure that the `setBlinkRate` method is called with valid constants (`HT16K33.BLINK_OFF`, `HT16K33.BLINK_2HZ`, etc.).
     - Verify I2C communication.

4. **Display Not Clearing:**
   - **Symptom:** Characters remain displayed even after calling `clearDisplay`.
   - **Solution:**
     - Check the `clearDisplay` method implementation for correctness.
     - Ensure no other parts of the code are writing to the display concurrently.

### Debugging Tips

- **Enable Verbose Logging:**
  - Utilize the `toBinary` method within the class to log I2C commands and verify correct data transmission.

- **Use a Multimeter:**
  - Verify voltage levels on the I2C lines to ensure proper communication.

- **Simplify Your Code:**
  - Start with basic functionality (e.g., displaying a single character) to isolate issues before implementing more complex features.

## License

This project is licensed under the [MIT License](LICENSE.md).

- **GitHub:** [https://github.com/gbhall/](https://github.com/gbhall/)