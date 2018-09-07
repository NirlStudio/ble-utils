/**
 * Copyright 2018 Nirl Studio, V-Lab.
 * Licensed under the MIT license <http://opensource.org/licenses/MIT>.
 */
var Buffer = Buffer || require('buffer/').Buffer;
var Packet = require('./packet').Packet;

function split (buffer) {
  var ads = [];
  var i = 0;
  while (i < buffer.length) {
    var length = buffer[i++]; // AD[0]
    if (length <= 0) {
      break; // empty bytes.
    }
    var type = buffer[i++]; // AD[1]
    var data = Buffer.alloc(--length);
    buffer.copy(data, 0, i, i + length); // AD[2, (AD[0]-1))

    ads.push([type, data]);
    i += length;
  }
  return ads;
}

function prepare (payload, encoding) {
  return Buffer.isBuffer(payload) ? payload
    : typeof payload !== 'string' ? Buffer.from(payload)
      : Buffer.from(payload, encoding || 'base64')
}

function innerParse (buffer, byteOrder) {
  var packets = [];
  split(buffer).forEach(function (ad) {
    packets.push(new Packet(ad[0], ad[1], byteOrder));
  });
  return packets;
}

function parse (payload, encoding, byteOrder) {
  if (!byteOrder) {
    // the encoding argument can be skipped.
    if (encoding === 'BE' || encoding === 'LE') {
      byteOrder = encoding;
      encoding = null;
    } else {
      // use big endian as the default byte order.
      byteOrder = 'BE';
    }
  }
  if (byteOrder != 'BE' && byteOrder != 'LE') {
    throw new Error('Invalid Byte Order. It must be either "BE" or "LE".');
  }
  return innerParse(prepare(payload, encoding), byteOrder);
}

parse.BE = function parseBE (data, encoding) {
  return parse(data, encoding, 'BE');
}

parse.LE = function parseLE (data, encoding) {
  return parse(data, encoding, 'LE');
}

module.exports = {
  _split: split,
  parse: parse
}
