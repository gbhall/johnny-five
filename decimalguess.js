const five = require('johnny-five');
const board = new five.Board();

board.on('ready', function() {
    const address = 0x70;  // HT16K33 I2C address
  
    // Initialize the I2C communication with the HT16K33
    this.i2cConfig();
    this.i2cWrite(address, [0x21]);  // Turn on the oscillator
    this.i2cWrite(address, [0x81]);  // Turn on display, no blinking
    this.i2cWrite(address, [0xE0 | 0x0F]);  // Set brightness to max (0x0 to 0xF)
  
    // Clear the display (ensure all RAM addresses are zeroed)
    const clearDisplayData = [0x00];
    for (let i = 0; i < 16; i++) {
      clearDisplayData.push(0x00);
    }
    this.i2cWrite(address, clearDisplayData);
  
    // Test each bit to find which controls the decimal point for each digit
    const testValues = [0x01, 0x02, 0x04, 0x08];  // Bits corresponding to COM0 to COM3
    let i = 0;
  
    const interval = setInterval(() => {
      if (i < testValues.length) {
        console.log(`Testing value 0x${testValues[i].toString(16)} for full stop`);
  
        // Prepare the data to write to RAM address 0x0E
        const dpData = [0x0E, testValues[i]];  // Address 0x0E, data with the specific bit set
  
        // Write the data to the HT16K33
        board.i2cWrite(address, dpData);
  
        i++;
      } else {
        clearInterval(interval);  // Stop once all values have been tested
      }
    }, 1000);  // 1-second delay between each test
  });
  