var walk = require('esprima-walk').walkAddParent;
var _ = require('underscore');

(function() {
  var util = require('util'),
      esprima = require('esprima'),

  traverse = function(object, visitor, master) {
    var parent;
    parent = master === 'undefined' ? [] : master;
    if (visitor.call(null, object, parent) === false) {
      return;
    }
    return Object.keys(object).forEach(function(key) {
      // console.log(object);
      var child, path;
      child = object[key];
      path = [object];
      path.push(parent);
      if (typeof child === 'object' && child !== null) {
        return traverse(child, visitor, path);
      }
    });
  },

  getNearestNamedElement = function(node) {
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
  },

  getFunctions = function(tree, code) {
    var matched = false, list = [];
    walk(tree, function(node, path) {
      // var parent;

      // console.log(node.type, node.id);
      if (node.type === 'FunctionDeclaration') {
        node.namespace = getNearestNamedElement(node);
        // console.log(node.type, node.id.name);
        return list.push({
          name: node.id.name,
          params: node.params,
          range: node.range,
          node: node,
          blockStart: node.body.range[0],
          end: node.body.range[1],
          loc: node.loc.start
        });
      // } else if (node.type === 'VariableDeclarator') {
        // console.log(node.type, node.id.name);
        // lastVariableName = node.id.name;
      // } else if (node.type === 'BlockStatement') {
        // console.log(node.type, node.id.name);
        // console.log('BlockStatement', lastVariableName);
      } else if (node.type === 'FunctionExpression') {
        node.namespace = getNearestNamedElement(node);
        // parent = node.parent;//path[0];
        // console.log(node.id);
        if (node.parent.type === 'AssignmentExpression') {
          if (typeof node.parent.left.range !== 'undefined') {
            if (node.parent.left.type === "MemberExpression") {

              // for: foo.doSomething = function
              if (node.parent.left.object.name !== undefined) {
                var namespace = node.parent.left.object.name;

                if (node.parent.left.property.name !== undefined) {
                  var memberName = node.parent.left.property.name;
                  matched = true;
                }

                // for: foo["doSomething"] = function()
                else if (node.parent.left.property && node.parent.left.property.type === "Literal") {
                  var namespace = node.parent.left.object.name;
                  var memberName = node.parent.left.property.value;
                  matched = true;
                }
              }

              // for: this.doSomething = function
              else if (node.parent.left.object.type === "ThisExpression") {
                var namespace = "thiz";
                if (node.parent.left.property.name !== undefined) {
                  var memberName = node.parent.left.property.name;
                  matched = true;
                }

                // for this[variable] = function()
                else if (node.parent.left.property.type === "CallExpression") {
                  // no op
                  matched = true;
                }
              }

              // for: Function.prototype.doSomething = function()
              else if (node.parent.left.object.object !== undefined && node.parent.left.object.object.type === "Identifier") {
                var namespace = node.parent.left.object.object.type;
                var memberName = node.parent.left.property.name;
                var isPrototype = true;
                var prototyping = "prototype";
                matched = true;
              }

              // for: this.htmlElement.onmouseover = function()
              else if (node.parent.left.type === "MemberExpression" && node.parent.left.object.type === "MemberExpression") {
                var namespace ="thiz";
                var memberName = node.parent.left.property.name;

                var isPrototype = true;
                var prototyping = node.parent.left.object.property.name;
                matched = true;
              }

              // for: (boolType ? "name" : "name2").doSomething = function()
              else if (node.parent.left.object !== undefined && node.parent.left.object.type === "ConditionalExpression") {
                // no op
                matched = true;
              }
            }
            else if (node.parent.left.type === "Identifier") {
              var memberName = node.parent.left.name;
              matched = true;
            }

            if (!matched) {
              console.error("Never found a matching arrangement!");
              console.error(util.inspect(node.parent.left, null, 5));
            }
            else {
              return list.push({
                namespace: namespace,
                name: memberName,
                isPrototype: isPrototype,
                prototyping: prototyping,
                params: node.params,
                range: node.range,
                node: node,
                blockStart: node.body.range[0],
                end: node.body.range[1],
                loc: node.loc.start
              });
            }
          }
        } else if (node.parent.type === 'VariableDeclarator') {
          // console.log(node.type);
          return list.push({
            name: node.parent.id.name,
            // namespace: node.parent.id ? undefined : lastVariableName,
            params: node.params,
            range: node.range,
            node: node,
            blockStart: node.body.range[0],
            end: node.body.range[1],
            loc: node.loc.start
          });
        } else if (node.parent.type === 'CallExpression') {
          //console.log(node.type, parent, node.parent.id ? node.parent.id.name : '[Anonymous]', tree, node);
          //var name = _.pluck(tree, {node:parent});
          // console.log(node.parent.callee);
          // console.log('Oopsie, the variable name was undefined. Resorting to ' + lastVariableName);
          // lastVariableName = '';
          // node = {};
          // var fakeNode = clone(node);//.clone();
          var fakeNode = node;
          // console.log(node);
          // for (var key in node){
          //   node[key] = undefined;
          // }
          // console.log(node);
          // node = undefined;
          // console.log(node);

          return list.push({
            name: fakeNode.parent.id ? fakeNode.parent.id.name : '[Anonymous]',
            // namespace: node.parent.id ? undefined : lastVariableName,
            params: fakeNode.params,
            range: fakeNode.range,
            node: fakeNode,
            blockStart: fakeNode.body.range[0],
            end: fakeNode.body.range[1],
            loc: fakeNode.loc.start
          });
        } else if (typeof node.parent.length === 'number') {
          return list.push({
            name: node.parent.id ? node.parent.id.name : '[Anonymous]',
            // namespace: node.parent.id ? undefined : lastVariableName,
            params: node.params,
            range: node.range,
            node: node,
            blockStart: node.body.range[0],
            end: node.body.range[1],
            loc: node.loc.start
          });
        } else if (typeof node.parent.key !== 'undefined') {
          if (node.parent.key.type === 'Identifier') {
            if (node.parent.value === node && node.parent.key.name) {
              return list.push({
                name: node.parent.key.name,
                // namespace: node.parent.id ? undefined : lastVariableName,
                params: node.params,
                range: node.range,
                node: node,
                blockStart: node.body.range[0],
                end: node.body.range[1],
                loc: node.loc.start
              });
            }
          }
        }
      }
    });

    return list;
  };

  exports.parse = function(code, options) {
    if (options && options.coffeescript) {
      csr = require("coffee-script-redux");
      code = csr.js(csr.compile(csr.parse(code)));
    }

    var tree = esprima.parse(code, {
      loc: true,
      range: true
    });

    var functions = getFunctions(tree);

    functions = functions.filter(function(fn) {
      return fn.name !== '[Anonymous]';
    });

    return functions;
  };

  exports.interpret = function(tree) {
    var functions = getFunctions(tree);

    functions = functions.filter(function(fn) {
      return fn.name !== '[Anonymous]';
    });

    return functions;
  };
}).call(this);
