(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@n8n/tournament", "./errors", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sanitizer = exports.PrototypeSanitizer = exports.DollarSignValidator = exports.FunctionThisSanitizer = exports.DOLLAR_SIGN_ERROR = exports.sanitizerName = void 0;
    const tournament_1 = require("@n8n/tournament");
    const errors_1 = require("./errors");
    const utils_1 = require("./utils");
    exports.sanitizerName = '__sanitize';
    const sanitizerIdentifier = tournament_1.astBuilders.identifier(exports.sanitizerName);
    exports.DOLLAR_SIGN_ERROR = 'Cannot access "$" without calling it as a function';
    const EMPTY_CONTEXT = tournament_1.astBuilders.objectExpression([
        tournament_1.astBuilders.property('init', tournament_1.astBuilders.identifier('process'), tournament_1.astBuilders.objectExpression([])),
    ]);
    /**
     * Helper to check if an expression is a valid property access with $ as the property.
     * Returns true for obj.$ or obj.nested.$ but false for bare $ or other expression contexts.
     */
    const isValidDollarPropertyAccess = (expr) => {
        if (typeof expr !== 'object' ||
            expr === null ||
            !('type' in expr) ||
            expr.type !== 'MemberExpression' ||
            !('property' in expr) ||
            !('object' in expr)) {
            return false;
        }
        const property = expr.property;
        const object = expr.object;
        // $ must be the property
        const isPropertyDollar = typeof property === 'object' &&
            property !== null &&
            'name' in property &&
            property.name === '$';
        // $ must NOT be the object (to block $.something)
        const isObjectDollar = typeof object === 'object' && object !== null && 'name' in object && object.name === '$';
        // Object must be an Identifier (obj) or MemberExpression (obj.nested)
        // This excludes bare $ or $ in other expression contexts
        const isObjectValid = typeof object === 'object' &&
            object !== null &&
            'type' in object &&
            (object.type === 'Identifier' || object.type === 'MemberExpression');
        return isPropertyDollar && !isObjectDollar && isObjectValid;
    };
    /**
     * Prevents regular functions from binding their `this` to the Node.js global.
     */
    const FunctionThisSanitizer = (ast, dataNode) => {
        (0, tournament_1.astVisit)(ast, {
            visitCallExpression(path) {
                const { node } = path;
                if (node.callee.type !== 'FunctionExpression') {
                    this.traverse(path);
                    return;
                }
                const fnExpression = node.callee;
                /**
                 * Called function expressions (IIFEs) - both anonymous and named:
                 *
                 * ```js
                 * (function(x) { return x * 2; })(5)
                 * (function factorial(n) { return n <= 1 ? 1 : n * factorial(n-1); })(5)
                 *
                 * // become
                 *
                 * (function(x) { return x * 2; }).call({ process: {} }, 5)
                 * (function factorial(n) { return n <= 1 ? 1 : n * factorial(n-1); }).call({ process: {} }, 5)
                 * ```
                 */
                this.traverse(path); // depth first to transform inside out
                const callExpression = tournament_1.astBuilders.callExpression(tournament_1.astBuilders.memberExpression(fnExpression, tournament_1.astBuilders.identifier('call')), [EMPTY_CONTEXT, ...node.arguments]);
                path.replace(callExpression);
                return false;
            },
            visitFunctionExpression(path) {
                const { node } = path;
                /**
                 * Callable function expressions (callbacks) - both anonymous and named:
                 *
                 * ```js
                 * [1, 2, 3].map(function(n) { return n * 2; })
                 * [1, 2, 3].map(function factorial(n) { return n <= 1 ? 1 : n * factorial(n-1); })
                 *
                 * // become
                 *
                 * [1, 2, 3].map((function(n) { return n * 2; }).bind({ process: {} }))
                 * [1, 2, 3].map((function factorial(n) { return n <= 1 ? 1 : n * factorial(n-1); }).bind({ process: {} }))
                 * ```
                 */
                this.traverse(path);
                const boundFunction = tournament_1.astBuilders.callExpression(tournament_1.astBuilders.memberExpression(node, tournament_1.astBuilders.identifier('bind')), [
                    EMPTY_CONTEXT,
                ]);
                path.replace(boundFunction);
                return false;
            },
        });
    };
    exports.FunctionThisSanitizer = FunctionThisSanitizer;
    /**
     * Validates that the $ identifier is only used in allowed contexts.
     * This prevents user errors like `{{ $ }}` which would return the function object itself.
     *
     * Allowed contexts:
     * - As a function call: $()
     * - As a property name: obj.$ (where $ is a valid property name in JavaScript)
     *
     * Disallowed contexts:
     * - Bare identifier: $
     * - As object in member expression: $.property
     * - In expressions: "prefix" + $, [1, 2, $], etc.
     */
    const DollarSignValidator = (ast, _dataNode) => {
        (0, tournament_1.astVisit)(ast, {
            visitIdentifier(path) {
                this.traverse(path);
                const node = path.node;
                // Only check for the exact identifier '$'
                if (node.name !== '$')
                    return;
                // Runtime type checking since path properties are typed as 'any'
                const parent = path.parent;
                // Check if parent is a path object with a 'name' property
                if (typeof parent !== 'object' || parent === null || !('name' in parent)) {
                    throw new errors_1.ExpressionError(exports.DOLLAR_SIGN_ERROR);
                }
                // Allow $ when it's the callee: $()
                // parent.name === 'callee' means the parent path represents the callee field
                if (parent.name === 'callee') {
                    return;
                }
                // Block when $ is the object in a MemberExpression: $.something
                // parent.name === 'object' means the parent path represents the object field
                if (parent.name === 'object') {
                    throw new errors_1.ExpressionError(exports.DOLLAR_SIGN_ERROR);
                }
                // Check if $ is the property of a MemberExpression: obj.$
                // For obj.$: parent.name is 'expression' and grandparent has ExpressionStatement
                // The ExpressionStatement should contain a MemberExpression with $ as property
                if ('parent' in parent && typeof parent.parent === 'object' && parent.parent !== null) {
                    const grandparent = parent.parent;
                    if ('value' in grandparent &&
                        typeof grandparent.value === 'object' &&
                        grandparent.value !== null) {
                        const gpNode = grandparent.value;
                        // ExpressionStatement has an 'expression' field containing the actual expression
                        if ('type' in gpNode && gpNode.type === 'ExpressionStatement' && 'expression' in gpNode) {
                            // Check if this is a valid property access like obj.$
                            if (isValidDollarPropertyAccess(gpNode.expression)) {
                                return;
                            }
                        }
                    }
                }
                // Disallow all other cases (bare $, $ in expressions, etc.)
                throw new errors_1.ExpressionError(exports.DOLLAR_SIGN_ERROR);
            },
        });
    };
    exports.DollarSignValidator = DollarSignValidator;
    const PrototypeSanitizer = (ast, dataNode) => {
        (0, tournament_1.astVisit)(ast, {
            visitMemberExpression(path) {
                this.traverse(path);
                const node = path.node;
                if (!node.computed) {
                    // This is static, so we're safe to error here
                    if (node.property.type !== 'Identifier') {
                        throw new errors_1.ExpressionError(`Unknown property type ${node.property.type} while sanitising expression`);
                    }
                    if (!(0, utils_1.isSafeObjectProperty)(node.property.name)) {
                        throw new errors_1.ExpressionError(`Cannot access "${node.property.name}" due to security concerns`);
                    }
                }
                else if (node.property.type === 'StringLiteral' || node.property.type === 'Literal') {
                    // Check any static strings against our forbidden list
                    if (!(0, utils_1.isSafeObjectProperty)(node.property.value)) {
                        throw new errors_1.ExpressionError(`Cannot access "${node.property.value}" due to security concerns`);
                    }
                }
                else if (!node.property.type.endsWith('Literal')) {
                    // This isn't a literal value, so we need to wrap it
                    path.replace(tournament_1.astBuilders.memberExpression(
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
                    node.object, 
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    tournament_1.astBuilders.callExpression(tournament_1.astBuilders.memberExpression(dataNode, sanitizerIdentifier), [
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        node.property,
                    ]), true));
                }
            },
        });
    };
    exports.PrototypeSanitizer = PrototypeSanitizer;
    const sanitizer = (value) => {
        if (!(0, utils_1.isSafeObjectProperty)(value)) {
            throw new errors_1.ExpressionError(`Cannot access "${value}" due to security concerns`);
        }
        return value;
    };
    exports.sanitizer = sanitizer;
});
//# sourceMappingURL=expression-sandboxing.js.map