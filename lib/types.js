/**
 * Copyright 2018 Nirl Studio, V-Lab.
 * Licensed under the MIT license <http://opensource.org/licenses/MIT>.
 */
var Buffer = Buffer || require('buffer/').Buffer;

// Converts data flags to an array of readable strings
function toStringArray(data) {
  if (!data || data.length < 1) {
    return ['None'];
  }
  var arr = [];
  if (data[0] & (1 << 0)) {
    arr.push('LE Limited Discoverable Mode');
  }
  if (data[0] & (1 << 1)) {
    arr.push('LE General Discoverable Mode');
  }
  if (data[0] & (1 << 2)) {
    arr.push('BR/EDR Not Supported');
  }
  if (data[0] & (1 << 3)) {
    arr.push('Simultaneous LE and BR/EDR to Same Device Capable (Controller)');
  }
  if (data[0] & (1 << 4)) {
    arr.push('Simultaneous LE and BR/EDR to Same Device Capable (Host)');
  }
  return arr;
}
  
// Converts buffer to array of strings
// (some uuids are 128 bits which we can't represent as numbers b/c it's too big
// and I don't want the user to have to worry about endian-ness)
function toOctetStringArray(numBytes, data, dataType, byteOrder) {
  var uuids = [];
  // If data is undefined, return empty array
  if (!data) return [];
  // Make sure there are enough bytes
  if (numBytes > data.length) {
    throw new Error('Not enough bytes for single UUID');
  }
  // Make sure it will divide nicely
  if (data.length % numBytes) {
    throw new Error('Not enough bytes to complete each UUID. Needs to be multiple of ' + numBytes.toString());
  }
  // Go through the array
  while (data) {
    // grab an octet string
    var uuid = toOctetString(numBytes, data, dataType, byteOrder);
    // Put into the array
    uuids.push(uuid);
    // Move the buffer forward
    data = data.slice(numBytes, data.length);
    // Weird hack
    if (!data || !data.length) data = null;
  }  
  return uuids;
}

// Simply prints buffer, utf8 encoded
function toString(data) {
  return data.toString('utf8');
}

// Only uses for signal strength
function toSignedInt(data) {
  if (!data) return 0;
  return data.readInt8(0);
}

// converts buffer to array of uuid strings
function toOctetString(numOctets, data, dataType, byteOrder) {
  var bytes = [];

  // For each octet
  for (var i = 0; i < numOctets; i++) {
    // Ready as hex string
    var str = data.readUInt8(i).toString(16);
    // If it's only 1 byte, add 0 to front
    if (str.length == 1) str = '0' + str;
    // Put in array
    bytes.push(str);
  }
  // If we're big endian, reverse byte order
  if (byteOrder == 'BE') {
    bytes.reverse();
  }
  // Add '0x' to front
  var uuid = bytes.join('');
  return uuid;
}

function intArrayToByte(data){
  var ret = 0;
  for (var i=0; i<data.length; i++){
    ret |= data[i];
  }
  return Buffer([ret]);
}

function stringToBuffer(data){
  return new Buffer(data);
}

function octetStringToBuffer(data){
  var numBytes = data.length/2;
  if (numBytes % 2) {
    throw new Error('Invalid UUID' + data + '.');
  }

  var buf = new Buffer(numBytes);
  for (var i = 0; i < numBytes; i++) {
    buf.writeUInt8(parseInt(data.substr((i*2), 2), 16), numBytes-i-1);
  }
  return buf;
}

function octetStringArrayToBuffer(data){
  var buffs = [];
  for (var i=0; i< data.length; i++){
    buffs.push(octetStringToBuffer(data[i]));
  }
  return Buffer.concat(buffs);
}

function signedIntToBuffer(data){
  var buf = new Buffer(1);
  buf.writeInt8(data, 0);
  return buf;
}

function arrayToBuffer(data){
  return new Buffer(data);
}

/**
 * Generic Access Profile, 2018-09-09.
 * <https://www.bluetooth.com/specifications/assigned-numbers/generic-access-profile>
 */
var DataTypes = [{
  value: 0x01,
  key: 'flags',
  name: 'Flags',
  parse: toStringArray , 
  serialize: intArrayToByte
}, {
  value: 0x02,
  key: 'incompleteUUID16',
  name: 'Incomplete List of 16-bit Service Class UUIDs',
  parse: toOctetStringArray.bind(null, 2),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x03,
  key: 'completeUUID16',
  name: 'Complete List of 16-bit Service Class UUIDs',
  parse: toOctetStringArray.bind(null, 2),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x04,
  key: 'incompleteUUID32',
  name: 'Incomplete List of 32-bit Service Class UUIDs',
  parse: toOctetStringArray.bind(null, 4),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x05,
  key: 'completeUUID32',
  name: 'Complete List of 32-bit Service Class UUIDs',
  parse: toOctetStringArray.bind(null, 4),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x06,
  key: 'incompleteUUID128',
  name: 'Incomplete List of 128-bit Service Class UUIDs',
  parse: toOctetStringArray.bind(null, 16),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x07,
  key: 'completeUUID128',
  name: 'Complete List of 128-bit Service Class UUIDs',
  parse: toOctetStringArray.bind(null, 16),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x08,
  key: 'shortName',
  name: 'Shortened Local Name',
  parse: toString,
  serialize: stringToBuffer
}, {
  value: 0x09,
  key: 'completeName',
  name: 'Complete Local Name',
  parse: toString,
  serialize: stringToBuffer
}, {
  value: 0x0A,
  key: 'txPower',
  name: 'Tx Power Level',
  parse: toSignedInt,
  serialize: signedIntToBuffer
}, {
  value: 0x0D,
  key: 'deviceClass',
  name: 'Class of Device',
  parse: toOctetString.bind(null, 3),
  serialize: octetStringToBuffer
}, {
  value: 0x0E,
  key: 'pairingHashC',
  name: 'Simple Pairing Hash C',
  alias: 'Simple Pairing Hash C-192',
  parse: toOctetString.bind(null, 16),
  serialize: octetStringToBuffer
}, {
  value: 0x0F,
  key: 'pairingRandomizerR',
  name: 'Simple Pairing Randomizer R',
  alias: 'Simple Pairing Randomizer R-192',
  parse: toOctetString.bind(null, 16),
  serialize: octetStringToBuffer
}, {
  value: 0x10,
  key: 'deviceId', 
  name: 'Device ID',
  alias: 'Security Manager TK Value',
  parse: toOctetString.bind(null, 16),
  serialize: octetStringToBuffer
}, {
  value: 0x11,
  key: 'smOOBFlags',
  name: 'Security Manager Out of Band Flags',
  parse: toOctetString.bind(null, 16),
  serialize: octetStringToBuffer
}, {
  value: 0x12,
  key: 'intervalRange',
  name: 'Slave Connection Interval Range',
  parse: toOctetStringArray.bind(null, 2),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x14,
  key: 'solicitationUUID16',
  name: 'List of 16-bit Service Solicitation UUIDs',
  parse: toOctetStringArray.bind(null, 2),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x15,
  key: 'solicitationUUID128',
  name: 'List of 128-bit Service Solicitation UUIDs',
  parse: toOctetStringArray.bind(null, 8),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x16,
  key: 'serviceData',
  name: 'Service Data',
  alias: 'Service Data - 16-bit UUID',
  parse: toOctetStringArray.bind(null, 1),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x17,
  key: 'publicAddress',
  name: 'Public Target Address',
  parse: toOctetStringArray.bind(null, 6),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x18,
  key: 'randomAddress',
  name: 'Random Target Address',
  parse: toOctetStringArray.bind(null, 6),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x19,
  key: 'appearance',
  name: 'Appearance',
  parse: null,
  serialize: arrayToBuffer
}, {
  value: 0x1A,
  key: 'interval',
  name: 'Advertising Interval',
  parse: toOctetStringArray.bind(null, 2),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x1B,
  key: 'deviceAddress',
  name: 'LE Bluetooth Device Address',
  parse: toOctetStringArray.bind(null, 6),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x1C,
  key: 'role',
  name: 'LE Role',
  parse: null,
  serialize: arrayToBuffer
}, {
  value: 0x1D,
  name: 'Simple Pairing Hash C-256',
  key: 'pairingHashC256',
  parse: toOctetStringArray.bind(null, 16),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x1E,
  key: 'pairingRandomizerR256',
  name: 'Simple Pairing Randomizer R-256',
  parse: toOctetStringArray.bind(null, 16),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x1F,
  key: 'solicitationUUID32',
  name: 'List of 32-bit Service Solicitation UUIDs',
  parse: toOctetStringArray.bind(null, 4),
  serialize: octetStringArrayToBuffer
}, {
  value: 0x20,
  name: 'Service Data - 32-bit UUID',
  key: 'serviceUUID32',
  serialize: octetStringArrayToBuffer,
  parse: toOctetStringArray.bind(null, 4)
}, {
  value: 0x21,
  key: 'serviceUUID128',
  name: 'Service Data - 128-bit UUID',
  parse: toOctetStringArray.bind(null, 16),
  serialize: octetStringArrayToBuffer
}, {
  // TODO: 0x22 - 0x2B
  value: 0x22,
  key: 'secureConnectionsConfirmationValue',
  name: 'LE Secure Connections Confirmation Value',
  parse: null,
  serialize: null
}, {
  value: 0x23,
  key: 'secureConnectionsRandomValue',
  name: 'LE Secure Connections Random Value',
  parse: null,
  serialize: null
}, {
  value: 0x24,
  key: 'uri',
  name: 'URI',
  parse: null,
  serialize: null
},{
  value: 0x25,
  key: 'indoorPositioning',
  name: 'Indoor Positioning',
  parse: null,
  serialize: null
}, {
  value: 0x26,
  key: 'transportDiscoveryData',
  name: 'Transport Discovery Data',
  parse: null,
  serialize: null
},{
  value: 0x27,
  key: 'supportedFeatures',
  name: 'LE Supported Features',
  parse: null,
  serialize: null
}, {
  value: 0x28,
  key: 'channelMapUpdateIndication',
  name: 'Channel Map Update Indication',
  parse: null ,
  serialize: null
}, {
  value: 0x29,
  key: 'pbADV',
  name: 'PB-ADV',
  parse: null,
  serialize: null
}, {
  value: 0x2A,
  key: 'meshMessage',
  name: 'Mesh Message',
  parse: null,
  serialize: null
}, {
  value: 0x2B,
  key: 'meshBeacon',
  name: 'Mesh Beacon',
  parse: null,
  serialize: null
}, {
  value: 0x3D,
  key: '3dInfo',
  name: '3D Information Data',
  parse: null,
  serialize: arrayToBuffer
}, {
  value: 0xFF,
  key: 'mfrData',
  name: 'Manufacturer Specific Data',
  parse: null,
  serialize: arrayToBuffer
}];

var DataIndex = Object.create ? Object.create(null) : {};
DataTypes.forEach(function (type) {
  DataIndex[type.value] = type;
  DataIndex[type.key] = type;
  DataIndex[type.name] = type;
  if (type.alias) {
    DataIndex[type.alias] = type;
  }
});

module.exports = {
  _toOctetStringArray: toOctetStringArray,
  data: DataTypes,
  lookup: function (key) {
      return DataIndex[key] || null;
  }
}