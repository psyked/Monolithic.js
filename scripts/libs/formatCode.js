var fs = require('fs');
var mkdirp = require('mkdirp');
var esprima = require('esprima');
var escodegen = require('escodegen');
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
