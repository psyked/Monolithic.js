var fs = require('fs');
// var path = require('path');
var mkdirp = require('mkdirp');
var esprima = require('esprima');
var escodegen = require('escodegen');
// var functionExtractor = require("./function-parser");
var _ = require('underscore');
var walk = require('esprima-walk').walkAddParent;

// function clone(obj) {
//     var target = {};
//     for(var i in obj) {
//         if(obj.hasOwnProperty(i)) {
//             target[i] = obj[i];
//         }
//     }
//     return target;
// }
//
// function extend(target) {
//     var sources = [].slice.call(arguments, 1);
//     sources.forEach(function(source) {
//         for(var prop in source) {
//             target[prop] = source[prop];
//         }
//     });
//     return target;
// }
var cycle = require('cycle');

module.exports = function extractClasses(code) {
    // var code = esprima.parse(inputString, {
    //     loc: true,
    //     range: true,
    //     sourceType: 'module'
    // });
    // var exportedFunctions = _.pluck(validFunctions, 'name');
    // console.log(exportedFunctions);
    // var rangesToReplace = [];
    var extractedClasses = {};

    walk(code, function(node) {
        //&& node.parent.parent.type === 'FunctionExpression'
        // if(node.type === 'CallExpression' && node.parent.type === 'VariableDeclarator' ) {
        if(node.type === 'FunctionExpression' && node.parent.type === 'CallExpression' && node.parent.parent.type === 'VariableDeclarator') {
            // console.log(node.type, node.parent.parent.id.name, node.parent.parent.type);
            // console.log(escodegen.generate(node.parent.parent));
            // var theNode = node.parent.parent;
            // var asArray = [];
            // asArray.push(theNode);
            // var fixedNode = JSON.stringify(JSON.decycle(asArray));
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
            // extractedClasses[node.parent.parent.id.name].body[0].declarations.push(node.parent.parent);
        }
        // if(node.type === "FunctionExpression" && node.parent.type === "VariableDeclarator") {
        //     var found = false;
        //     var theNode = node;
        //     var name;
        //     while(!!theNode.parent && !found) {
        //         if(theNode.id) {
        //             name = theNode.id.name;
        //             found = true;
        //         }
        //         theNode = theNode.parent;
        //     }
        //     // if(name) {
        //     //     // if(node.id || node.parent.id) {
        //     //     //     var name = node.id ? node.id.name : node.parent.id.name;
        //     //     // console.log(_.contains(exportedFunctions, name));
        //     //     if(_.contains(exportedFunctions, name)) {
        //     //         rangesToReplace.push(node.parent.parent.range);
        //     //     }
        //     // }
        // }
    });

    return extractedClasses;

    // for(var i = 0, l = rangesToReplace.length; i < l; i++) {
    //     // console.log(i);
    //     var strtoreplace = inputString.substring(rangesToReplace[i][0], rangesToReplace[i][1]);
    //     // console.log(strtoreplace);
    //     var blankStr = "";
    //     for(var ii = 0, ll = rangesToReplace[i][1] - rangesToReplace[i][0]; ii < ll; ii++) {
    //         blankStr += " ";
    //     }
    //     inputString = inputString.replace(strtoreplace, blankStr);
    // }
    //
    // return inputString;
};
