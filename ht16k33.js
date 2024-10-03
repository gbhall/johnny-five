/**
 * HT16K33Display Library
 * 
 * Author: Gareth Blake Hall
 * GitHub: https://github.com/gbhall
 * 
 * This library provides functionalities to control the HT16K33 Quad 14 Segment Alphanumeric Display Module.
 */

const { bitmaps, HT16K33, ALPHANUM_SEGMENTS } = require('./bitmap.js'); // Import all exports

/**
 * HT16K33Display Class
 *
 * This class encapsulates all functionalities required to control the HT16K33 Quad 14 Segment Alphanumeric Display Module.
 * It provides methods to initialize the display, set blink rates, adjust brightness, write characters or text, and scroll text.
 */
class HT16K33Display {
  /**
   * Creates an instance of HT16K33Display.
   * @param {object} board - The Johnny-Five board instance.
   * @param {number} [address=0x70] - The I2C address of the HT16K33 display.
   */
  constructor(board, address = 0x70) {
    if (!board) {
      throw new Error('A Johnny-Five board instance is required.');
    }
    this.board = board;
    this.address = address; // HT16K33 I2C address
    this.currentBrightness = 15;

    // Initialize the I2C communication with the HT16K33
    this.board.i2cConfig();
    this.board.i2cWrite(this.address, [0x21]); // Turn on the oscillator
    this.setBlinkRate(HT16K33.BLINK_OFF);      // Turn on display and set blink rate
    this.board.i2cWrite(this.address, [0xEF]); // Set brightness (0 to F or 0 to 15). 0 is the lowest brightness and 15 is the highest brightness

    /**
     * Initializing the Decimal Points (DP) on all four displays.
     * This buffer sets all segments off except for the DP.
     * Each character position uses two registers: one for the lower half (high byte) and one for the upper half (low byte).
     * Ordered as [low byte, high byte].
     * Low byte: the least significant 8 bits (the rightmost 8 bits).
     * High byte: the most significant 8 bits (the leftmost 8 bits).
     * AKA Little-Endian.
     */
    const dpBuffer = [
      0x00,       // Starting register address. (0, 2, 4, or 6)
      0x00, 0x40, // Display 0: All segments off, DP on. DP of 0b0100000000000000 is 0x4000. low byte: 00, high byte: 40 
      0b11111111, 0b01111111, // Display 1: All segments on. 14 bits representing each segment, and the 15th bit representing DP
      0x00, 0x40, // Display 2: All segments off, DP on. 0x4000 = 01000000 00000000 (15th bit)
      0xF7, 0x00  // Display 3: Letter A. A is 0b0000000011110111 which equals 0x00F7. low byte: F7, high byte: 00 
    ];

    // Write the DP buffer to the display to initialize DPs
    this.board.i2cWrite(this.address, dpBuffer); // Sends the entire buffer in one I2C transaction
  }

  /**
   * Function to set the blink rate of the display
   * @param {number} rate - Blink rate (0: no blink, 1: 2Hz, 2: 1Hz, 3: 0.5Hz)
   */
  setBlinkRate(rate) {
    // Ensure blink rate is within bounds
    if (rate < 0 || rate > 3) rate = 0; // Default to off if out of range

    const blinkBits = rate << 1; // Shift rate to bits 1 and 2

    const blinkCommand = HT16K33.BLINK_CMD | HT16K33.BLINK_DISPLAYON | blinkBits;
    console.log(`Setting blink rate to ${rate}:`, [blinkCommand].map(this.toBinary));

    this.board.i2cWrite(this.address, [blinkCommand]);
  }

  /**
   * Function to set the brightness of the display
   * @param {number} level - Brightness level (0 to 15)
   */
  setBrightness(level) {
    // Ensure brightness level is within bounds
    if (level < 0) level = 0;
    if (level > 15) level = 15;

    const brightnessCommand = HT16K33.BRIGHTNESS_CMD | level; // HT16K33 brightness command
    console.log(`Setting brightness to level ${level}:`, [brightnessCommand].map(this.toBinary));
    this.currentBrightness = level;

    this.board.i2cWrite(this.address, [brightnessCommand]);
  }

  /**
   * Function to get the bitmap index based on ASCII value
   * @param {char} char - The character to display
   * @returns {number} - The corresponding bitmap index
   */
  getBitmapIndex(char) {
    const ascii = char.charCodeAt(0);
    if (ascii < 0 || ascii > 127) {
      return 127; // Use 'DEL' for unsupported characters
    }
    return ascii; // Direct mapping since bitmap.js is ordered by ASCII
  }

  /**
   * Function to write a single character to the 14-segment display
   * @param {char} char - The character to display
   * @param {number} position - The display position (0 to 3)
   * @param {boolean} dot - Whether to illuminate the DP
   */
  writeCharacter(char, position, dot = false) {
    const index = this.getBitmapIndex(char);
    const bitmap = bitmaps[index] || 0x0000; // Default to 'DEL' if undefined

    // If dot is true, set the DP bit (assuming DP is the 15th bit)
    const finalBitmap = dot ? (bitmap | 0x4000) : bitmap;

    /**
     * Preparing data for I2C write:
     * - Each character position is controlled by two consecutive registers.
     * - Register addresses:
     *   - Position 0: Register 0 (lower byte) and Register 1 (upper byte)
     *   - Position 1: Register 2 (lower byte) and Register 3 (upper byte)
     *   - Position 2: Register 4 (lower byte) and Register 5 (upper byte)
     *   - Position 3: Register 6 (lower byte) and Register 7 (upper byte)
     *
     * Therefore, the starting register for a given position is `position * 2`.
     * 
     * LOWER:
     * ------
     * Bitwise AND operator example:
     *   0100 0001 1110 0111 (example)
     * & 0000 0000 1111 1111 (control)
     * ------------------------
     *   0000 0000 1110 0111 (result = rightmost 8 bits)
     * 
     * UPPER:
     * ------
     * Right Shift by 8 Bits example:
     *     0100 0001 1110 0111 (example)
     * >>8 0000 0000 0100 0001 (shifted)
     *   & 0000 0000 1111 1111 (control)
     * ------------------------
     *     0000 0000 0100 0001 (result = leftmost 8 bits)
     */
    const register = position * 2; // Calculates the starting register address

    const data = [
      register,                        // Register address for the character
      finalBitmap & 0b11111111,        // Lower byte (rightmost 8 bits): Extracts bits 0-7
      (finalBitmap >> 8) & 0b11111111  // Upper byte (leftmost 8 bits): Shifts right by 8 bits and extracts bits 8-15
    ];

    // Debugging: Log the data being sent
    console.log(`Writing to Register ${register}:`, data.map(this.toBinary));

    // Write the data to the display via I2C
    this.board.i2cWrite(this.address, data);
  }

  // Function to convert a byte to a binary string with leading zeros
  toBinary(byte) {
    return '0b' + byte.toString(2).padStart(8, '0');
  }

  /**
   * Function to write a string to the 4x14 segment display
   * @param {string} str - The string to display (max 4 characters)
   * @param {Array<boolean>} dots - Array indicating which characters have DPs (e.g., [false, true, false, true])
   */
  writeText(str, dots = [], log = true) {
    // Ensure the string has exactly 4 characters by padding with spaces or trimming
    const paddedStr = str.padEnd(4, ' ').substring(0, 4);

    // Convert each character to its corresponding bitmap, setting DP if required
    const desiredBits = paddedStr.split('').map(function (c, idx) {
      let bitmap = bitmaps[this.getBitmapIndex(c)] || 0x0000; // Get bitmap or default to 'DEL'
      if (dots[idx]) {
        bitmap |= 0x4000; // Set DP bit for this character
      }
      return bitmap;
    }, this); // Bind 'this' to access class methods

    // Prepare the output buffer starting with the initial register address (0x00)
    const output = [0x00]; // Starting register address

    // Append lower and upper bytes for each character to the buffer
    desiredBits.forEach(function (bitmap) {
      output.push(bitmap & 0xFF);        // Lower byte: Standard segments
      output.push((bitmap >> 8) & 0xFF); // Upper byte: Additional segments (like DP)
    });

    // Debugging: Log the entire buffer being sent
    if (log) {
      console.log(`Writing Text '${str}':`, output.map(this.toBinary));
    }

    // Write the entire buffer to the display in a single I2C transaction
    this.board.i2cWrite(this.address, output);
  }

  /**
   * Function to scroll text on the display
   * @param {string} text - The text to scroll
   * @param {number} [interval=500] - Interval in milliseconds between scroll steps
   * @param {Array<boolean>} [dots=[]] - Array indicating which characters have DPs
   * @param {boolean} [stop=false] - Whether to stop scrolling after one complete cycle
   * @returns {object} - The Interval ID for the scrolling process
   */
  scrollText(text, interval = 500, dots = [], stop = false) {
    const displayWidth = 4;
    const paddedText = '    ' + text + '    '; // Padding with spaces so text starts and ends with blanks
    const paddedDots = [false, false, false, false, ...dots, false, false, false, false];
    let currentStep = 0;
    const totalSteps = displayWidth + text.length; // We don't need to animate the last 4 spaces out of view. Just the last char.

    /*
      Example: HELLO
      --------------
      Step 0: "    "    // All 4 spaces
      Step 1: "   H"
      Step 2: "  HE"
      Step 3: " HEL"
      Step 4: "HELL"
      Step 5: "ELLO"
      Step 6: "LLO "
      Step 7: "LO  "
      Step 8: "O   "
      Step 9: "    "    // All 4 spaces again
    */

    const scrollInterval = setInterval(() => {
      if (currentStep <= totalSteps) {
        const textSlice = paddedText.slice(currentStep, currentStep + displayWidth);
        const dotsSlice = paddedDots.slice(currentStep, currentStep + displayWidth);
        // Write the text and dots
        this.writeText(textSlice, dotsSlice);

        currentStep++;
      } else {
        currentStep = 0;
        if (stop) {
          clearInterval(scrollInterval); // Stop scrolling after all steps
        }
      }
    }, interval);

    return scrollInterval; // Return the Interval ID
  }

  /**
   * Function to clear the display
   */
  clearDisplay() {
    const address = this.address; // HT16K33 I2C address

    const clearAll = [
      0x00,       // Starting register address
      0x00, 0x00, // Display 0: All segments and DP off
      0x02, 0x00, // Display 1: All segments and DP off
      0x04, 0x00, // Display 2: All segments and DP off
      0x06, 0x00  // Display 3: All segments and DP off
    ];
    this.board.i2cWrite(address, clearAll);
    console.log('Display Cleared');
  }
}

// Export the HT16K33Display class
module.exports = HT16K33Display;

/**
 * Example usage:
 * Uncomment the following lines to test the module independently.
 * Make sure to comment them out when importing this module elsewhere.
 */

// const five = require('johnny-five');
// const board = new five.Board();

// board.on('ready', function () {
//   const display = new HT16K33Display(this);

//   // Example usage: Write "A3B2" to the display with DPs on 'A' and 'B'
//   display.writeText("A3B2", [true, false, true, false]);

//   // Alternatively, using writeCharacter for individual control:
//   // display.writeCharacter('A', 0, false);  // First digit (position 0), DP off
//   // display.writeCharacter('1', 1, true);   // Second digit (position 1), DP on
//   // display.writeCharacter('B', 2, false);  // Third digit (position 2), DP off
//   // display.writeCharacter('2', 3, true);   // Fourth digit (position 3), DP on

//   // Start scrolling "HELLO"
//   // display.scrollText("HELLO", 500, [false, false, false, false], false);
// });
