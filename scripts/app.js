var fs = require('fs');
var mkdirp = require('mkdirp');
var esprima = require('esprima');
var escodegen = require('escodegen');
var functionExtractor = require("./libs/function-parser");
var _ = require('underscore');
var walk = require('esprima-walk').walkAddParent;

var replaceDuplicateFunctionDeclarations = require('./libs/removeFunctions');
var formatHTML = require('./libs/format');
var importReferencedFunctions = require('./libs/generateImports');
var extractClasses = require('./libs/extractClasses');

evaluateFile('./tests/sampleinput.js');

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
        for(var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

function appendRootExport(inputString, key) {
    return inputString + "\nexport default " + key.split('/').pop() + ";";
}

function evaluateFile(inputPath) {
    if(!fs.existsSync('./output/')) {
        fs.mkdirSync('./output/');
    }

    var fileContent = fs.readFileSync(inputPath, "utf8");

    var extractedFunctions = {};

    var code = esprima.parse(fileContent, {
        loc: true,
        range: true,
        sourceType: 'module'
    });

    var classObjects = extractClasses(code);

    for(var className in classObjects) {
        classObjects[className];
    }

    var namedFunctions = functionExtractor.interpret(code);

    for(var i = 0, l = namedFunctions.length; i < l; i++) {

        var functionNode = namedFunctions[i].node;
        functionNode.id = {name: namedFunctions[i].name};

        var filePath = functionNode.namespace.split('.').join('/') + '/' + namedFunctions[i].name;
        extractedFunctions[filePath] = escodegen.generate(functionNode);//file.substring(funcs[i].range[0], funcs[i].range[1]);
    }

    extractedFunctions = extend(extractedFunctions, classObjects);

    for(var key in extractedFunctions) {
        extractedFunctions[key] = appendRootExport(importReferencedFunctions(extractedFunctions[key], namedFunctions, './' + key), key);

        var array = key.split('/');
        array.pop();
        var currPath = array.join('/');
        var dirs = currPath.split('/');
        dirs.pop();

        mkdirp.sync('./output/' + dirs.join('/'));//, function(err) {

        fs.writeFileSync('./output/' + currPath + '.json', JSON.stringify(esprima.parse(formatHTML(extractedFunctions[key]), {
            sourceType: 'module'
        }), null, 2));
        fs.writeFileSync('./output/' + currPath + '.js', formatHTML(extractedFunctions[key]));
    }

    var outputFilepath = './output/' + inputPath.split('/').pop();

    var outputCode = formatHTML(importReferencedFunctions(replaceDuplicateFunctionDeclarations(escodegen.generate(code), namedFunctions), namedFunctions, './'));
    fs.writeFileSync(outputFilepath, outputCode);

    fs.writeFileSync('./output.json', JSON.stringify(esprima.parse(fileContent, {
        loc: true,
        range: true,
        sourceType: 'module'
    }), null, 2));
}
