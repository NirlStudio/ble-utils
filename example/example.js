/**
 * Copyright 2018 Nirl Studio, V-Lab. 
 * Licensed under the MIT license <http://opensource.org/licenses/MIT>.
 */
var Buffer = Buffer || require('buffer/').Buffer;
var parser = require('../');

var payload = new Buffer([
  2, 1, 6,
  17, 7, 102, 154, 12, 32, 0, 8, 31, 152, 227, 17, 197, 108, 160, 199, 200, 8
]);

// Parse (big-endian by default)
var packets = parser.parse(payload);

console.log('packets: 2?', packets.length);

console.log('Flags?', packets[0].type); 
console.log('[ "LE General Discoverable Mode", "BR/EDR Not Supported" ]?')
console.log(packets[0].data);

console.log('Complete List of 128-bit Service Class UUIDs?');
console.log(packets[1].type);
console.log('[ \'08c8c7a06cc511e3981f0800200c9a66\' ]?')
console.log(packets[1].data);
