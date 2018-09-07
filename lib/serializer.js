/**
 * Copyright 2018 Nirl Studio, V-Lab.
 * Licensed under the MIT license <http://opensource.org/licenses/MIT>.
 */
var Buffer = Buffer || require('buffer/').Buffer;
var dataTypes = require('./types');

function serialize(advertisement){
  var buffs = [];
  Object.keys(advertisement).forEach(function (key) {
    var dataType = dataTypes.lookup(key);
    if (!dataType) {
      console.log('Unknown AD. type:', key);
      continue;
    } else if (!dataType.serialize) {
      console.log('Unsupported AD. type:', key);
      continue;
    }
    data = dataType.serialize(advertisement[key]);
    buffs.push(Buffer.from([data.length + 1, dataType.value]));
    buffs.push(data);
  });
  var payload = Buffer.concat(buffs);
  if (payload.length > 31){
    throw(new Error("Packet exceeds maximum length of 31 bytes."));
  }
  return payload;
}

module.exports = {
  serialize: serialize
}
