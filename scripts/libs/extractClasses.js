var fs = require('fs');
var mkdirp = require('mkdirp');
var esprima = require('esprima');
var escodegen = require('escodegen');
var walk = require('esprima-walk').walkAddParent;
var cycle = require('cycle');

module.exports = function extractClasses(code) {

    var extractedClasses = {};

    walk(code, function(node) {

        if(node.type === 'FunctionExpression' && node.parent.type === 'CallExpression' && node.parent.parent.type === 'VariableDeclarator') {

            extractedClasses[node.parent.parent.id.name + '/' + node.parent.parent.id.name + '/' + node.parent.parent.id.name] = escodegen.generate({
                "type": "Program",
                "body": [
                    {
                        "type": "VariableDeclaration",
                        "declarations": [node.parent.parent],
                        "kind": "var"
                    }
                ]
            });
        }
    });

    return extractedClasses;
};
