var fs = require('fs');
// var path = require('path');
var mkdirp = require('mkdirp');
var esprima = require('esprima');
var escodegen = require('escodegen');
// var functionExtractor = require("./function-parser");
var _ = require('underscore');
var walk = require('esprima-walk').walkAddParent;

module.exports = function formatHTML(html) {
    var prependedCodeString = esprima.parse(html, {
        loc: true,
        range: true,
        sourceType: 'module'
    });
    return escodegen.generate(prependedCodeString);
};
