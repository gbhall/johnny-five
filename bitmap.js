/*
 * bitmap.js
 *
 * This file contains an array of bitmasks used for displaying characters on a 14-segment display.
 * Each index in the array corresponds to the ASCII code of a character. The value at that index 
 * is the bitmask that determines which segments light up to form the character on the display.
 *
 * Example: The character 'A' has an ASCII code of 65, so its bitmask is stored at index 65 in the array.
 * When displaying a character, the code looks up the bitmask by using the character's ASCII code as 
 * the index in this array.
 * 
 *  Adapted from https://github.com/louiemontes/node-led/blob/master/alphaChars.js and https://github.com/adafruit/Adafruit_LED_Backpack/blob/master/Adafruit_LEDBackpack.cpp
 */

module.exports = [
  0b0000000000000001, // 0
  0b0000000000000010, // 1
  0b0000000000000100, // 2
  0b0000000000001000, // 3
  0b0000000000010000, // 4
  0b0000000000100000, // 5
  0b0000000001000000, // 6
  0b0000000010000000, // 7
  0b0000000100000000, // 8
  0b0000001000000000, // 9
  0b0000010000000000, // 10
  0b0000100000000000, // 11
  0b0001000000000000, // 12
  0b0010000000000000, // 13
  0b0100000000000000, // 14
  0b1000000000000000, // 15
  0b0000000000000000, // 16
  0b0000000000000000, // 17
  0b0000000000000000, // 18
  0b0000000000000000, // 19
  0b0000000000000000, // 20
  0b0000000000000000, // 21
  0b0000000000000000, // 22
  0b0000000000000000, // 23
  0b0001001011001001, // 24
  0b0001010111000000, // 25
  0b0001001011111001, // 26
  0b0000000011100011, // 27
  0b0000010100110000, // 28
  0b0001001011001000, // 29
  0b0011101000000000, // 30
  0b0001011100000000, // 31
  0b0000000000000000, // 32 (Space)
  0b0000000000000110, // 33 '!'
  0b0000001000100000, // 34 '"'
  0b0001001011001110, // 35 '#'
  0b0001001011101101, // 36 '$'
  0b0000110000100100, // 37 '%'
  0b0010001101011101, // 38 '&'
  0b0000010000000000, // 39 '''
  0b0010010000000000, // 40 '('
  0b0000100100000000, // 41 ')'
  0b0011111111000000, // 42 '*'
  0b0001001011000000, // 43 '+'
  0b0000100000000000, // 44 ','
  0b0000000011000000, // 45 '-'
  0b0000000000000000, // 46 '.' (Dot)
  0b0000110000000000, // 47 '/'
  0b0000110000111111, // 48 '0'
  0b0000000000000110, // 49 '1'
  0b0000000011011011, // 50 '2'
  0b0000000010001111, // 51 '3'
  0b0000000011100110, // 52 '4'
  0b0010000001101001, // 53 '5'
  0b0000000011111101, // 54 '6'
  0b0000000000000111, // 55 '7'
  0b0000000011111111, // 56 '8'
  0b0000000011101111, // 57 '9'
  0b0001001000000000, // 58 ':'
  0b0000101000000000, // 59 ';'
  0b0010010000000000, // 60 '<'
  0b0000000011001000, // 61 '='
  0b0000100100000000, // 62 '>'
  0b0001000010000011, // 63 '?'
  0b0000001010111011, // 64 '@'
  0b0000000011110111, // 65 'A'
  0b0001001010001111, // 66 'B'
  0b0000000000111001, // 67 'C'
  0b0001001000001111, // 68 'D'
  0b0000000011111001, // 69 'E'
  0b0000000001110001, // 70 'F'
  0b0000000010111101, // 71 'G'
  0b0000000011110110, // 72 'H'
  0b0001001000000000, // 73 'I'
  0b0000000000011110, // 74 'J'
  0b0010010001110000, // 75 'K'
  0b0000000000111000, // 76 'L'
  0b0000010100110110, // 77 'M'
  0b0010000100110110, // 78 'N'
  0b0000000000111111, // 79 'O'
  0b0000000011110011, // 80 'P'
  0b0010000000111111, // 81 'Q'
  0b0010000011110011, // 82 'R'
  0b0000000011101101, // 83 'S'
  0b0001001000000001, // 84 'T'
  0b0000000000111110, // 85 'U'
  0b0000110000110000, // 86 'V'
  0b0010100000110110, // 87 'W'
  0b0010110100000000, // 88 'X'
  0b0001010100000000, // 89 'Y'
  0b0000110000001001, // 90 'Z'
  0b0000000000111001, // 91 '['
  0b0010000100000000, // 92 '\'
  0b0000000000001111, // 93 ']'
  0b0000110000000011, // 94 '^'
  0b0000000000001000, // 95 '_'
  0b0000000100000000, // 96 '`'
  0b0001000001011000, // 97 'a'
  0b0010000001111000, // 98 'b'
  0b0000000011011000, // 99 'c'
  0b0000100010001110, // 100 'd'
  0b0000100001011000, // 101 'e'
  0b0000000001110001, // 102 'f'
  0b0000010010001110, // 103 'g'
  0b0001000001110000, // 104 'h'
  0b0001000000000000, // 105 'i'
  0b0000000000001110, // 106 'j'
  0b0011011000000000, // 107 'k'
  0b0000000000110000, // 108 'l'
  0b0001000011010100, // 109 'm'
  0b0001000001010000, // 110 'n'
  0b0000000011011100, // 111 'o'
  0b0000000101110000, // 112 'p'
  0b0000010010000110, // 113 'q'
  0b0000000001010000, // 114 'r'
  0b0010000010001000, // 115 's'
  0b0000000001111000, // 116 't'
  0b0000000000011100, // 117 'u'
  0b0010000000000100, // 118 'v'
  0b0010100000010100, // 119 'w'
  0b0010100011000000, // 120 'x'
  0b0010000000001100, // 121 'y'
  0b0000100001001000, // 122 'z'
  0b0000100101001001, // 123 '{'
  0b0001001000000000, // 124 '|'
  0b0010010010001001, // 125 '}'
  0b0000010100100000, // 126 '~'
  0b0011111111111111  // 127 'DEL'
];