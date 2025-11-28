var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "lodash/isEqual", "lodash/pick"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RULES = exports.WorkflowChangeSet = exports.NodeDiffStatus = void 0;
    exports.compareNodes = compareNodes;
    exports.compareWorkflowsNodes = compareWorkflowsNodes;
    exports.groupWorkflows = groupWorkflows;
    const isEqual_1 = __importDefault(require("lodash/isEqual"));
    const pick_1 = __importDefault(require("lodash/pick"));
    var NodeDiffStatus;
    (function (NodeDiffStatus) {
        NodeDiffStatus["Eq"] = "equal";
        NodeDiffStatus["Modified"] = "modified";
        NodeDiffStatus["Added"] = "added";
        NodeDiffStatus["Deleted"] = "deleted";
    })(NodeDiffStatus || (exports.NodeDiffStatus = NodeDiffStatus = {}));
    function compareNodes(base, target) {
        const propsToCompare = ['name', 'type', 'typeVersion', 'webhookId', 'credentials', 'parameters'];
        const baseNode = (0, pick_1.default)(base, propsToCompare);
        const targetNode = (0, pick_1.default)(target, propsToCompare);
        return (0, isEqual_1.default)(baseNode, targetNode);
    }
    function compareWorkflowsNodes(base, target, nodesEqual = compareNodes) {
        const baseNodes = base.reduce((acc, node) => {
            acc.set(node.id, node);
            return acc;
        }, new Map());
        const targetNodes = target.reduce((acc, node) => {
            acc.set(node.id, node);
            return acc;
        }, new Map());
        const diff = new Map();
        for (const [id, node] of baseNodes.entries()) {
            if (!targetNodes.has(id)) {
                diff.set(id, { status: NodeDiffStatus.Deleted, node });
            }
            else if (!nodesEqual(baseNodes.get(id), targetNodes.get(id))) {
                diff.set(id, { status: NodeDiffStatus.Modified, node });
            }
            else {
                diff.set(id, { status: NodeDiffStatus.Eq, node });
            }
        }
        for (const [id, node] of targetNodes.entries()) {
            if (!baseNodes.has(id)) {
                diff.set(id, { status: NodeDiffStatus.Added, node });
            }
        }
        return diff;
    }
    function mergeNodeDiff(prev, next) {
        switch (prev) {
            case NodeDiffStatus.Added:
                switch (next) {
                    case NodeDiffStatus.Added:
                        return 'invariant broken';
                    case NodeDiffStatus.Deleted:
                        return 'undone';
                    default:
                        return NodeDiffStatus.Added;
                }
            case NodeDiffStatus.Deleted:
                switch (next) {
                    case NodeDiffStatus.Added:
                        return NodeDiffStatus.Modified;
                    default:
                        return 'invariant broken';
                }
            case NodeDiffStatus.Eq:
                switch (next) {
                    case NodeDiffStatus.Added:
                        return 'invariant broken';
                    default:
                        return next;
                }
            case NodeDiffStatus.Modified:
                switch (next) {
                    case NodeDiffStatus.Added:
                        return 'invariant broken';
                    case NodeDiffStatus.Deleted:
                        return NodeDiffStatus.Deleted;
                    default:
                        return NodeDiffStatus.Modified;
                }
        }
    }
    class WorkflowChangeSet {
        nodes;
        constructor(nodes = new Map()) {
            this.nodes = nodes;
        }
        hasChanges() {
            for (const nodeDiff of this.nodes.values()) {
                if (nodeDiff.status !== NodeDiffStatus.Eq)
                    return true;
            }
            return false;
        }
        mergeNext(wcs) {
            for (const [key, diff] of wcs.nodes) {
                const existing = this.nodes.get(key);
                if (existing) {
                    const diffStatus = mergeNodeDiff(existing.status, diff.status);
                    if (diffStatus === 'invariant broken') {
                        throw new Error('invariant broken');
                    }
                    if (diffStatus === 'undone') {
                        this.nodes.delete(key);
                    }
                    else {
                        this.nodes.set(key, { ...diff, status: diffStatus });
                    }
                }
                else {
                    this.nodes.set(key, { ...diff, status: NodeDiffStatus.Added });
                }
            }
        }
    }
    exports.WorkflowChangeSet = WorkflowChangeSet;
    // determines whether the second node is a "superset" of the first one, i.e. whether no data
    // is lost if we were to cleanse the first node
    function nodeIsAdditive(prevNode, nextNode) {
        const { parameters: prevParams, ...prev } = prevNode;
        const { parameters: nextParams, ...next } = nextNode;
        // abort if the nodes don't match besides parameters
        if (!compareNodes({ ...prev, parameters: {} }, { ...next, parameters: {} }))
            return false;
        const params = Object.keys(prevParams);
        // abort if prev has some field next does not have
        if (params.some((x) => !Object.prototype.hasOwnProperty.call(nextParams, x)))
            return false;
        for (const key of params) {
            const left = prevParams[key];
            const right = nextParams[key];
            // non-strings must be exactly equal to not be lost data
            if (typeof left === 'string' && typeof right === 'string') {
                // strings must only be contained in the new string
                if (!right.includes(left))
                    return false;
            }
            else if (left !== right)
                return false;
        }
        return true;
    }
    function mergeAdditiveChanges(_prev, next, diff) {
        for (const d of diff.values()) {
            if (d.status === NodeDiffStatus.Deleted)
                return false;
            if (d.status === NodeDiffStatus.Added)
                continue;
            const nextNode = next.from.nodes.find((x) => x.name === d.node.name);
            if (!nextNode)
                throw new Error('invariant broken');
            if (d.status === NodeDiffStatus.Modified && !nodeIsAdditive(d.node, nextNode))
                return false;
        }
        return true;
    }
    exports.RULES = {
        mergeAdditiveChanges,
    };
    function compareWorkflows(previous, next) {
        const nodesDiff = compareWorkflowsNodes(previous.nodes, next.nodes);
        const workflowChangeSet = new WorkflowChangeSet(nodesDiff);
        return {
            workflowChangeSet,
            groupedWorkflows: [],
            from: previous,
            to: next,
        };
    }
    function groupWorkflows(workflows, rules) {
        if (workflows.length === 0)
            return [];
        if (workflows.length === 1) {
            return [
                {
                    workflowChangeSet: new WorkflowChangeSet(),
                    groupedWorkflows: [],
                    from: workflows[0],
                    to: workflows[0],
                },
            ];
        }
        const diffs = [];
        for (let i = 0; i < workflows.length - 1; ++i) {
            diffs.push(compareWorkflows(workflows[i], workflows[i + 1]));
        }
        let prevDiffsLength = diffs.length;
        do {
            prevDiffsLength = diffs.length;
            const n = diffs.length;
            for (let i = n - 1; i > 0; --i) {
                const diff = compareWorkflowsNodes(diffs[i - 1].from.nodes, diffs[i].to.nodes);
                for (const rule of rules) {
                    const shouldMerge = rule(diffs[i - 1], diffs[i], diff);
                    if (shouldMerge) {
                        const right = diffs.pop();
                        if (!right)
                            throw new Error('invariant broken');
                        // merge diffs
                        diffs[i - 1].workflowChangeSet.mergeNext(right.workflowChangeSet);
                        diffs[i - 1].groupedWorkflows.push(diffs[i - 1].to);
                        diffs[i - 1].groupedWorkflows.push(...right.groupedWorkflows);
                        diffs[i - 1].to = right.to;
                        break;
                    }
                }
            }
        } while (prevDiffsLength !== diffs.length);
        return diffs;
    }
});
//# sourceMappingURL=workflow-diff.js.map