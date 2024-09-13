const five = require('johnny-five');
const board = new five.Board();

board.on('ready', function() {
  const address = 0x70;  // HT16K33 I2C address

  // Initialize the I2C communication with the HT16K33
  this.i2cConfig();
  this.i2cWrite(address, [0x21]);  // Turn on the oscillator
  this.i2cWrite(address, [0x81]);  // Turn on display, no blinking
  this.i2cWrite(address, [0xE0 | 0x0F]);  // Set brightness to max (0x0 to 0xF)

  // Clear the display
  this.i2cWrite(address, [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

  // Character mappings for 14-segment display
  const alphaChars = {
    'A': 0xF7,
    'B': 0x128F,
    'C': 0x39,
    'D': 0x5E,
    'E': 0x79,
    'F': 0x71,
    'G': 0x3D,
    'H': 0x76,
    'I': 0x06,
    'J': 0x1E,
    'K': 0x75,
    'L': 0x38,
    'M': 0x37,
    'N': 0x54,
    'O': 0x3F,
    'P': 0x73,
    'Q': 0x67,
    'R': 0x77,
    'S': 0x6D,
    'T': 0x78,
    'U': 0x3E,
    'V': 0x1C,
    'W': 0x2A,
    'X': 0x76,
    'Y': 0x6E,
    'Z': 0x5B,
    'ALL': 0xFFFF
    // Add more alphanumeric characters if needed
  };

  const numChars = {
    '0': 0x3F,
    '1': 0x06,
    '2': 0xDB,
    '3': 0x8F,
    '4': 0x66,
    '5': 0x6D,
    '6': 0x7D,
    '7': 0x07,
    '8': 0x7F,
    '9': 0x6F
  };

  // Function to write a character to the 14-segment display
  function writeCharacter(char, position) {
    const charCode = alphaChars[char] || numChars[char] || 0x00;  // Default to blank
    const data = [(position * 2), charCode & 0xFF, (charCode >> 8) & 0xFF];
    board.i2cWrite(address, data);
  }

  // Example usage: Write "A1B2" to the 14-segment display
  writeCharacter('ALL', 0);  // First digit (position 0)
  writeCharacter('1', 1);  // Second digit (position 1)
  writeCharacter('B', 2);  // Third digit (position 2)
  writeCharacter('3', 3);  // Fourth digit (position 3)
});
