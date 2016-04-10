var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var esprima = require('esprima');
var escodegen = require('escodegen');
var _ = require('underscore');
var walk = require('esprima-walk').walkAddParent;

module.exports = function importReferencedFunctions(codeString, knownFunctions, filePath) {

    function getPathForFunction(name) {
        for(var i = 0, l = knownFunctions.length; i < l; i++) {
            var functionNode = knownFunctions[i].node.id ? knownFunctions[i].node.id.name : '';
            if(functionNode === name) {
                return knownFunctions[i].node.namespace.split('.').join('/');
            }
        }
    }

    function addImportForFunction(name) {
        var fpA = filePath.split('/');
        fpA.pop();
        fpA.pop();
        var fp = fpA.join('/');
        // console.log(fp, './' + getPathForFunction(name), path.relative(fp, './' + getPathForFunction(name)));
        // console.log('./' + getPathForFunction(name), filePath, path.relative('./' + getPathForFunction(name), filePath));
        return 'import ' + name + ' from "./' + path.relative(fp, './' + getPathForFunction(name)) + '";\n'
    }

    var ast = esprima.parse(codeString, {
        sourceType: 'module'
    });

    var exportedFunctions = _.pluck(knownFunctions, 'name');
    var importString = "";
    var foundFunctions = [];

    walk(ast, function(node) {
        if(node.type === "Identifier") {
            if(_.contains(exportedFunctions, node.name) && !_.contains(foundFunctions, node.name)) {
                if(node.parent && node.parent.type === "CallExpression") {
                    foundFunctions.push(node.name);
                    // importString += 'import ' + node.name + ' from "./' + getPathForFunction(node.name) + '";\n';
                    importString += addImportForFunction(node.name);
                } else if(node.parent.type === "Property") {
                    if(node.parent.value === node && node.parent.key.name) {
                        foundFunctions.push(node.name);
                        // console.log(node.parent.type, node.name, node);
                        // console.log(node.type, node.name);
                        // console.log(path.relative(filePath, './' + getPathForFunction(node.name)));
                        importString += addImportForFunction(node.name);
                    }
                }
            }
        }
    });

    return importString + codeString;
};
