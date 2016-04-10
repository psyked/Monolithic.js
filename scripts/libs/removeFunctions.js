var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var esprima = require('esprima');
var escodegen = require('escodegen');
var _ = require('underscore');
var walk = require('esprima-walk').walkAddParent;

module.exports = function replaceDuplicateFunctionDeclarations(inputString, validFunctions) {
    var code = esprima.parse(inputString, {
        loc: true,
        range: true,
        sourceType: 'module'
    });
    var exportedFunctions = _.pluck(validFunctions, 'name');
    // console.log(exportedFunctions);
    var rangesToReplace = [];
    walk(code, function(node) {
        // console.log(node.type, node.id);
        if(node.type === "FunctionExpression" && node.parent.type === "VariableDeclarator") {
            var found = false;
            var theNode = node;
            var name;
            while(!!theNode.parent && !found) {
                if(theNode.id) {
                    name = theNode.id.name;
                    found = true;
                }
                theNode = theNode.parent;
            }
            if(name) {
                // if(node.id || node.parent.id) {
                //     var name = node.id ? node.id.name : node.parent.id.name;
                // console.log(_.contains(exportedFunctions, name));
                if(_.contains(exportedFunctions, name)) {
                    rangesToReplace.push(node.parent.parent.range);
                }
            }
        } else if(node.type === 'FunctionExpression' && node.parent.type === 'CallExpression' && node.parent.parent.type === 'VariableDeclarator') {
            // console.log(node.type, node.parent.type, node.parent.parent.type, node.parent.parent.id);
            // console.log(inputString.substring(node.parent.parent.parent.range[0], node.parent.parent.parent.range[1]));
            rangesToReplace.push(node.parent.parent.parent.range);
        }
    });

    for(var i = 0, l = rangesToReplace.length; i < l; i++) {
        // console.log(i);
        var strtoreplace = inputString.substring(rangesToReplace[i][0], rangesToReplace[i][1]);
        // console.log(strtoreplace);
        var blankStr = "";
        for(var ii = 0, ll = rangesToReplace[i][1] - rangesToReplace[i][0]; ii < ll; ii++) {
            blankStr += " ";
        }
        inputString = inputString.replace(strtoreplace, blankStr);
    }

    return inputString;
};
