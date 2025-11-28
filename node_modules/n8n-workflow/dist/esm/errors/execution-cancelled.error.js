import { ExecutionBaseError } from './abstract/execution-base.error';
export class ExecutionCancelledError extends ExecutionBaseError {
    // NOTE: prefer one of the more specific
    constructor(executionId) {
        super('The execution was cancelled', {
            level: 'warning',
            extra: { executionId },
        });
    }
}
export class ManualExecutionCancelledError extends ExecutionCancelledError {
    constructor(executionId) {
        super(executionId);
        this.message = 'The execution was cancelled manually';
    }
}
export class TimeoutExecutionCancelledError extends ExecutionCancelledError {
    constructor(executionId) {
        super(executionId);
        this.message = 'The execution was cancelled because it timed out';
    }
}
export class SystemShutdownExecutionCancelledError extends ExecutionCancelledError {
    constructor(executionId) {
        super(executionId);
        this.message = 'The execution was cancelled because the system is shutting down';
    }
}
//# sourceMappingURL=execution-cancelled.error.js.map