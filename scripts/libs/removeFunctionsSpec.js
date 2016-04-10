describe('Check the function extraction', function() {

    var remove = require('./removeFunctions');
    var format = require('./format');

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

    var outputString = 'var exampleVariable = "/some/random/path";\n' +
    // 'var exampleRevealingModule = require(\'./exampleRevealingModule\')();' +
    '$().ready(function() {\n' +
    '    exampleRevealingModule.init();\n' +
    '});\n';

    it('works as expected', function() {
        expect(format(remove(inputString))).toBe(format(outputString));
    });
});
