/**
 * An example file of what some legacy javascript files could look like (but not thousands of lines long.)
 */
var exampleVariable = "/some/random/path";

var exampleRevealingModule = function() {

    var hiddenVariable = 'something';

    function hiddenFunctionDeclaration() {
        globalObject.otherFunction(exampleVariable + hiddenVariable);
    }

    var hiddenFunctionExpression = function() {
        globalObject.otherFunction(exampleVariable + "1");
    };

    return {
        init: hiddenFunctionDeclaration,
        reset: hiddenFunctionExpression
    }
}();

$().ready(function() {
    exampleRevealingModule.init();
});
