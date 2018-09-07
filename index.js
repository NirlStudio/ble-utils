// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

var types = require('./lib/types');
var companies = require('./lib/companies');

var parser = require('./lib/parser');
var serializer = require('./lib/serializer');

module.exports = {
  types: types,
  companies: companies,
  advertising: {
    parse: parser.parse,
    serialize: serializer.serialize
  }
};
