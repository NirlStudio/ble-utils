/**
 * Copyright 2018 Nirl Studio, V-Lab.
 * Licensed under the MIT license <http://opensource.org/licenses/MIT>.
 */
var dataTypes = require('./types');

function Packet(type, data, byteOrder) {
  this._type = type;
  this._data = data;
  this._byteOrder = byteOrder;

  // Grab type from data structure
  var dataType = dataTypes.lookup(type);
  if (dataType) {
    this.type = dataType.name;
    this.data = dataType.parse ? dataType.parse(data, type, byteOrder) : data;
  } else {
    this.type = 'Unknown: 0x' + type.toString(16);
    this.data = data;
  }
}

module.exports = {
  Packet: Packet
};
