/**
 * Copyright 2018 Nirl Studio, V-Lab.
 * Licensed under the MIT license <http://opensource.org/licenses/MIT>.
 */
var Buffer = Buffer || require('buffer/').Buffer;
var expect = require('chai').expect;
var parser = require('../lib/parser');

describe("Parser", function() {
  var testPayload = new Buffer([
    2, 1, 6, 
    17, 6, 186, 86, 137, 166, 250, 191, 162, 189, 1, 70, 125, 110, 56, 88, 171, 173,
    5, 22, 10, 24, 7, 4, 
    0, 0, 0, 0]);

  describe("#split()", function() {
    it("should split up an advertisement packet into distinct data formats", function() {
      expect(parser._split(testPayload).length).to.equal(3);
    });
  });

  describe("#parse()", function() {
    it ("should create the correct number of packets", function() {
        var parsed = parser.parse(testPayload);
        expect(parsed.length).to.equal(3);
    });
    it("should properly parse a payload into the correct kinds of data", function() {
        var parsed = parser.parse(testPayload);
        parsed.forEach(function(packet) {
          expect(packet.type).to.not.equal("Unknown");
          expect(packet._byteOrder).to.not.equal(undefined);
        });
        
        expect(parsed[0].type).to.equal("Flags");
        expect(parsed[0].data.length).to.equal(2);

        expect(parsed[1].type).to.equal('Incomplete List of 128-bit Service Class UUIDs');
        expect(parsed[1].data.length).to.equal(1);

        expect(parsed[2].type).to.equal('Service Data');
        expect(parsed[2].data.length).to.equal(4);
        expect(parsed[1].data[0]).to.equal('adab58386e7d4601bda2bffaa68956ba');
    });

    it("should be able to switch byte order of bytes based on endian-ness", function() {
      var newPayload = new Buffer([ 2, 1, 6, 3, 2, 160, 255 ]);
      var parsed = parser.parse.LE(newPayload);
      expect(parsed[1].data[0]).to.equal('a0ff');

      var parsed = parser.parse.BE(newPayload);
      expect(parsed[1].data[0]).to.equal('ffa0');
    });
  });
});
