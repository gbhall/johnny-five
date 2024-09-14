const five = require('johnny-five');
const board = new five.Board();
const { bitmaps, HT16K33, SEGMENTS } = require('./bitmap.js'); // Import all exports

board.on('ready', function () {
  const address = 0x70;  // HT16K33 I2C address

  // Initialize the I2C communication with the HT16K33
  this.i2cConfig();
  this.i2cWrite(address, [0x21]);  // Turn on the oscillator
  setBlinkRate.call(this, HT16K33.BLINK_OFF);  // Turn on display and set blink rate
  this.i2cWrite(address, [0xEF]);  // Set brightness (0 to F or 0 to 15). 0 is the lowest brightness and 15 is the highest brightness

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
    0x00,       // Starting register address
    0x00, 0x40, // Display 0: All segments off, DP on. DP of 0b0100000000000000 is 0x4000. low byte: 00, high byte: 40 
    0x00, 0x40, // Display 1: All segments off, DP on
    0x00, 0x40, // Display 2: All segments off, DP on
    0xF7, 0x00  // Display 3: Letter A. A is 0b0000000011110111 which equals 0x00F7. low byte: F7, high byte: 00 
  ];

  // Write the DP buffer to the display to initialize DPs
  this.i2cWrite(address, dpBuffer); // Sends the entire buffer in one I2C transaction

  return

  /**
   * Function to set the blink rate of the display
   * @param {number} rate - Blink rate (0: no blink, 1: 2Hz, 2: 1Hz, 3: 0.5Hz)
   */
  function setBlinkRate(rate) {
    // Ensure blink rate is within bounds
    if (rate < 0 || rate > 3) rate = 0; // Default to off if out of range

    const blinkBits = rate << 1; // Shift rate to bits 1 and 2

    const blinkCommand = HT16K33.BLINK_CMD | HT16K33.BLINK_DISPLAYON | blinkBits;
    console.log(`Setting blink rate to ${rate}:`, [blinkCommand]);

    this.i2cWrite(address, [blinkCommand]);
  }

  /**
   * Function to set the brightness of the display
   * @param {number} level - Brightness level (0 to 15)
   */
  function setBrightness(level) {
    // Ensure brightness level is within bounds
    if (level < 0) level = 0;
    if (level > 15) level = 15;

    const brightnessCommand = 0xE0 | level; // HT16K33 brightness command
    console.log(`Setting brightness to level ${level}:`, [brightnessCommand]);

    this.i2cWrite(address, [brightnessCommand]);
  }  

  /**
   * Function to get the bitmap index based on ASCII value
   * @param {char} char - The character to display
   * @returns {number} - The corresponding bitmap index
   */
  function getBitmapIndex(char) {
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
  function writeCharacter(char, position, dot = false) {
    const index = getBitmapIndex(char);
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
     */
    const register = position * 2; // Calculates the starting register address

    const data = [
      register,                  // Register address for the character
      finalBitmap & 0xFF,        // Lower byte: Standard segments
      (finalBitmap >> 8) & 0xFF  // Upper byte: Additional segments (like DP)
    ];

    // Debugging: Log the data being sent
    console.log(`Writing to Register ${register}:`, data);

    // Write the data to the display via I2C
    this.i2cWrite(address, data);
  }

  /**
   * Function to write a string to the 4x14 segment display
   * @param {string} str - The string to display (max 4 characters)
   * @param {Array<boolean>} dots - Array indicating which characters have DPs (e.g., [false, true, false, true])
   */
  function writeText(str, dots = []) {
    // Ensure the string has exactly 4 characters by padding with spaces or trimming
    const paddedStr = str.padEnd(4, ' ').substring(0, 4);

    // Convert each character to its corresponding bitmap, setting DP if required
    const desiredBits = paddedStr.split('').map(function (c, idx) {
      let bitmap = bitmaps[getBitmapIndex(c)] || 0x0000; // Get bitmap or default to 'DEL'
      if (dots[idx]) {
        bitmap |= 0x4000; // Set DP bit for this character
      }
      return bitmap;
    });

    // Prepare the output buffer starting with the initial register address (0x00)
    const output = [0x00]; // Starting register address

    // Append lower and upper bytes for each character to the buffer
    desiredBits.forEach(function (bitmap) {
      output.push(bitmap & 0xFF);        // Lower byte: Standard segments
      output.push((bitmap >> 8) & 0xFF); // Upper byte: Additional segments (like DP)
    });

    // Debugging: Log the entire buffer being sent
    console.log('Writing Text:', output);

    // Write the entire buffer to the display in a single I2C transaction
    this.i2cWrite(address, output);
  }

  // Example usage: Write "A1B2" to the display with DPs on '1' and '2'
  // writeText.call(this, "A1B2", [true, false, true, false]);

  // Alternatively, using writeCharacter for individual control:
  writeCharacter.call(this, 'A', 0, false);  // First digit (position 0), DP off
  writeCharacter.call(this, '1', 1, true);   // Second digit (position 1), DP on
  writeCharacter.call(this, 'B', 2, false);  // Third digit (position 2), DP off
  writeCharacter.call(this, '2', 3, true);   // Fourth digit (position 3), DP on

  // Optional: Clear the display after a delay (e.g., 5 seconds)
  /*
  setTimeout(() => {
    const clearAll = [
      0x00,       // Starting register address
      0x00, 0x00, // Display 0: All segments and DP off
      0x02, 0x00, // Display 1: All segments and DP off
      0x04, 0x00, // Display 2: All segments and DP off
      0x06, 0x00  // Display 3: All segments and DP off
    ];
    this.i2cWrite(address, clearAll);
    console.log('Display Cleared');
  }, 5000); // Clears after 5 seconds
  */
});