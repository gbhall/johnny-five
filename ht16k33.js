const five = require('johnny-five');
const board = new five.Board();
const bitmaps = require('./bitmap.js'); // Import the bitmap array

board.on('ready', function() {
  const address = 0x70;  // HT16K33 I2C address

  // Initialize the I2C communication with the HT16K33
  this.i2cConfig();
  this.i2cWrite(address, [0x21]);  // Turn on the oscillator
  this.i2cWrite(address, [0x81]);  // Turn on display, no blinking
  this.i2cWrite(address, [0xEF]);  // Set brightness to max (0x0 to 0xF)

  // Illuminate the decimal points on all four displays initially
  const dpBuffer = [
    0x00,       // Starting address for display RAM
    0x00, 0x40, // Display 1: All segments off, DP on
    0x00, 0x40, // Display 2: All segments off, DP on
    0x00, 0x40, // Display 3: All segments off, DP on
    0x00, 0x40  // Display 4: All segments off, DP on
  ];

  this.i2cWrite(address, dpBuffer); // Write the buffer to the display

  // Function to get the bitmap index based on ASCII value
  function getBitmapIndex(char) {
    const ascii = char.charCodeAt(0);
    if (ascii < 32 || ascii > 127) {
      return 127; // Use 'DEL' for unsupported characters
    }
    return ascii; // Direct mapping
  }

  // Function to write a character to the 14-segment display
  function writeCharacter(char, position, dot = false) {
    const index = getBitmapIndex(char);
    const bitmap = bitmaps[index] || 0x0000; // Default to 0x0000 if undefined

    // If dot is true, set the DP bit (assuming DP is the 15th bit)
    const finalBitmap = dot ? (bitmap | 0x4000) : bitmap;

    // Each display uses two bytes: [Lower Byte, Upper Byte]
    const data = [
      position * 2,                // Address for the digit (each character position on the display is controlled by two consecutive registers)
      finalBitmap & 0xFF,          // Lower byte
      (finalBitmap >> 8) & 0xFF    // Upper byte
    ];

    board.i2cWrite(address, data);
  }

  // Example usage: Write "A1B2" to the 14-segment display with dots
  writeCharacter('A', 0, false);  // First digit (position 0)
  writeCharacter('1', 1, true);   // Second digit (position 1) with DP
  writeCharacter('B', 2, false);  // Third digit (position 2)
  writeCharacter('2', 3, true);   // Fourth digit (position 3) with DP
});
