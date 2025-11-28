import { ExecutionBaseError } from './abstract/execution-base.error';
export declare abstract class ExecutionCancelledError extends ExecutionBaseError {
    constructor(executionId: string);
}
export declare class ManualExecutionCancelledError extends ExecutionCancelledError {
    constructor(executionId: string);
}
export declare class TimeoutExecutionCancelledError extends ExecutionCancelledError {
    constructor(executionId: string);
}
export declare class SystemShutdownExecutionCancelledError extends ExecutionCancelledError {
    constructor(executionId: string);
}
//# sourceMappingURL=execution-cancelled.error.d.ts.map