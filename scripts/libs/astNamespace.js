module.exports = function(node) {
    var found = false;
    var theNode = node;
    var rtn = [];
    while(!!theNode.parent) {
        if(theNode.id) {
            rtn.unshift(theNode.id.name);
            found = true;
        }
        theNode = theNode.parent;
    }
    return rtn.join('.');
};
