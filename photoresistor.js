const five = require('johnny-five');

/**
 * Photoresistor Class
 *
 * This class encapsulates all functionalities required to monitor a photoresistor sensor.
 * It listens to sensor data and performs actions based on the sensor readings.
 * 
 * Author: Gareth Blake Hall
 * GitHub: https://github.com/gbhall
 */
class Photoresistor {
  /**
   * Creates an instance of Photoresistor.
   * @param {object} board - The Johnny-Five board instance.
   * @param {object} options - Configuration options for the sensor.
   * @param {number} options.pin - The analog pin the sensor is connected to.
   * @param {number} [options.freq=250] - Frequency in milliseconds to read the sensor.
   * @param {function} [options.onData] - Callback function to handle sensor data.
   */
  constructor(board, options = {}) {
    if (!board) {
      throw new Error('A Johnny-Five board instance is required.');
    }

    this.board = board;
    this.pin = options.pin || 'A0';
    this.freq = options.freq || 250;
    this.onData = options.onData || function () {};

    // Initialize the photoresistor sensor
    this.sensor = new five.Sensor({
      pin: this.pin,
      freq: this.freq
    });

    // Inject the sensor into the REPL (optional)
    this.board.repl.inject({
      pot: this.sensor
    });

    // Bind the data event
    this.sensor.on("data", this.handleData.bind(this));
  }

  /**
   * Handles incoming sensor data.
   * @param {number} value - The sensor reading value.
   */
  handleData(value) {
    //console.log(`Photoresistor Level: ${value}`);
    this.onData(value);
  }

  /**
   * Stops monitoring the sensor.
   */
  stop() {
    this.sensor.removeAllListeners("data");
    this.sensor.disable();
    console.log('Photoresistor monitoring stopped.');
  }
}

module.exports = Photoresistor;
