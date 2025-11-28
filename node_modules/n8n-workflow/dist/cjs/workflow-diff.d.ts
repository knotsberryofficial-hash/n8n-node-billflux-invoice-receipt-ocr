import type { INode, IWorkflowBase } from '.';
export type DiffableNode = Pick<INode, 'id' | 'parameters' | 'name'>;
export type DiffableWorkflow<N extends DiffableNode = DiffableNode> = {
    nodes: N[];
};
export declare const enum NodeDiffStatus {
    Eq = "equal",
    Modified = "modified",
    Added = "added",
    Deleted = "deleted"
}
export type NodeDiff<T> = {
    status: NodeDiffStatus;
    node: T;
};
export type WorkflowDiff<T> = Map<string, NodeDiff<T>>;
export declare function compareNodes<T extends DiffableNode>(base: T | undefined, target: T | undefined): boolean;
export declare function compareWorkflowsNodes<T extends DiffableNode>(base: T[], target: T[], nodesEqual?: (base: T | undefined, target: T | undefined) => boolean): WorkflowDiff<T>;
export declare class WorkflowChangeSet<T extends DiffableNode> {
    nodes: WorkflowDiff<T>;
    constructor(nodes?: WorkflowDiff<T>);
    hasChanges(): boolean;
    mergeNext(wcs: WorkflowChangeSet<T>): void;
}
declare function mergeAdditiveChanges<N extends DiffableNode = DiffableNode>(_prev: GroupedWorkflowHistory<DiffableWorkflow<N>>, next: GroupedWorkflowHistory<DiffableWorkflow<N>>, diff: WorkflowDiff<N>): boolean;
export declare const RULES: {
    mergeAdditiveChanges: typeof mergeAdditiveChanges;
};
type GroupedWorkflowHistory<W extends DiffableWorkflow<DiffableNode>> = {
    workflowChangeSet: WorkflowChangeSet<W['nodes'][number]>;
    groupedWorkflows: W[];
    from: W;
    to: W;
};
export type DiffRule<W extends IWorkflowBase = IWorkflowBase, N extends W['nodes'][number] = W['nodes'][number]> = (prev: GroupedWorkflowHistory<W>, next: GroupedWorkflowHistory<W>, diff: WorkflowDiff<N>) => boolean;
export declare function groupWorkflows<W extends IWorkflowBase = IWorkflowBase>(workflows: W[], rules: Array<DiffRule<W>>): Array<GroupedWorkflowHistory<W>>;
export {};
//# sourceMappingURL=workflow-diff.d.ts.map