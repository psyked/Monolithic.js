var fs = require('fs');
var mkdirp = require('mkdirp');
var esprima = require('esprima');
var escodegen = require('escodegen');
var _ = require('underscore');
var walk = require('esprima-walk').walkAddParent;

/**
 * Takes a JavaScript String in, outputs it functionally the same but reformatted.
 *
 * @param {String} javascript
 * @returns {String}
 */
module.exports = function format(javascript) {
    var prependedCodeString = esprima.parse(javascript, {
        loc: true,
        range: true,
        sourceType: 'module'
    });
    return escodegen.generate(prependedCodeString);
};
