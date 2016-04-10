describe('Check the function namespace calculation', function() {

    var namespace = require('./astNamespace');
    var format = require('./format');
    var esprima = require('esprima');
    var functionExtractor = require('./function-parser');

    var inputString = 'var exampleVariable = "/some/random/path";\n' +
        'var exampleRevealingModule = function() {\n' +
        '    var hiddenVariable = \'something\';\n' +
        '    function hiddenFunctionDeclaration() {\n' +
        '        globalObject.otherFunction(exampleVariable + hiddenVariable);\n' +
        '    }\n' +
        '    var hiddenFunctionExpression = function() {\n' +
        '        globalObject.otherFunction(exampleVariable + "1");\n' +
        '    };\n' +
        '    return {\n' +
        '        init: hiddenFunctionDeclaration,\n' +
        '        reset: hiddenFunctionExpression\n' +
        '    }\n' +
        '}();\n' +
        '$().ready(function() {\n' +
        '    exampleRevealingModule.init();\n' +
        '});\n';

    var namedFunctions = functionExtractor.interpret(esprima.parse(inputString, {
        loc: true,
        range: true,
        sourceType: 'module'
    }));

    it('works as expected', function() {
        expect(namespace(namedFunctions[0].node)).toBe('exampleRevealingModule.hiddenFunctionDeclaration');
        expect(namespace(namedFunctions[1].node)).toBe('exampleRevealingModule.hiddenFunctionExpression');
    });
});
