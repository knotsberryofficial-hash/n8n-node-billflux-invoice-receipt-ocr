import type { DateTime } from 'luxon';
import type { INodeCredentials } from './interfaces';
export declare const enum EventMessageTypeNames {
    generic = "$$EventMessage",
    audit = "$$EventMessageAudit",
    confirm = "$$EventMessageConfirm",
    workflow = "$$EventMessageWorkflow",
    node = "$$EventMessageNode",
    execution = "$$EventMessageExecution",
    aiNode = "$$EventMessageAiNode",
    runner = "$$EventMessageRunner",
    queue = "$$EventMessageQueue"
}
export declare const enum MessageEventBusDestinationTypeNames {
    abstract = "$$AbstractMessageEventBusDestination",
    webhook = "$$MessageEventBusDestinationWebhook",
    sentry = "$$MessageEventBusDestinationSentry",
    syslog = "$$MessageEventBusDestinationSyslog"
}
export declare const messageEventBusDestinationTypeNames: MessageEventBusDestinationTypeNames[];
export interface IAbstractEventMessage {
    __type: EventMessageTypeNames;
    id: string;
    ts: DateTime;
    eventName: string;
    message: string;
    payload: any;
}
export interface MessageEventBusDestinationOptions {
    __type?: MessageEventBusDestinationTypeNames;
    id?: string;
    label?: string;
    enabled?: boolean;
    subscribedEvents?: string[];
    credentials?: INodeCredentials;
    anonymizeAuditMessages?: boolean;
    circuitBreaker?: {
        maxFailures?: number;
        maxDuration?: number;
        halfOpenRequests?: number;
        failureWindow?: number;
        maxConcurrentHalfOpenRequests?: number;
    };
}
export interface MessageEventBusDestinationWebhookParameterItem {
    parameters: Array<{
        name: string;
        value: string | number | boolean | null | undefined;
    }>;
}
export interface MessageEventBusDestinationWebhookParameterOptions {
    batch?: {
        batchSize?: number;
        batchInterval?: number;
    };
    allowUnauthorizedCerts?: boolean;
    queryParameterArrays?: 'indices' | 'brackets' | 'repeat';
    redirect?: {
        followRedirects?: boolean;
        maxRedirects?: number;
    };
    response?: {
        response?: {
            fullResponse?: boolean;
            neverError?: boolean;
            responseFormat?: string;
            outputPropertyName?: string;
        };
    };
    proxy?: {
        protocol: 'https' | 'http';
        host: string;
        port: number;
    };
    timeout?: number;
    socket?: {
        keepAlive?: boolean;
        maxSockets?: number;
        maxFreeSockets?: number;
    };
}
export interface MessageEventBusDestinationWebhookOptions extends MessageEventBusDestinationOptions {
    url: string;
    responseCodeMustMatch?: boolean;
    expectedStatusCode?: number;
    method?: string;
    authentication?: 'predefinedCredentialType' | 'genericCredentialType' | 'none';
    sendQuery?: boolean;
    sendHeaders?: boolean;
    genericAuthType?: string;
    nodeCredentialType?: string;
    specifyHeaders?: string;
    specifyQuery?: string;
    jsonQuery?: string;
    jsonHeaders?: string;
    headerParameters?: MessageEventBusDestinationWebhookParameterItem;
    queryParameters?: MessageEventBusDestinationWebhookParameterItem;
    sendPayload?: boolean;
    options?: MessageEventBusDestinationWebhookParameterOptions;
}
export interface MessageEventBusDestinationSyslogOptions extends MessageEventBusDestinationOptions {
    expectedStatusCode?: number;
    host: string;
    port?: number;
    protocol?: 'udp' | 'tcp';
    facility?: number;
    app_name?: string;
    eol?: string;
}
export interface MessageEventBusDestinationSentryOptions extends MessageEventBusDestinationOptions {
    dsn: string;
    tracesSampleRate?: number;
    sendPayload?: boolean;
}
export declare const defaultMessageEventBusDestinationOptions: MessageEventBusDestinationOptions;
export declare const defaultMessageEventBusDestinationSyslogOptions: MessageEventBusDestinationSyslogOptions;
export declare const defaultMessageEventBusDestinationWebhookOptions: MessageEventBusDestinationWebhookOptions;
export declare const defaultMessageEventBusDestinationSentryOptions: MessageEventBusDestinationSentryOptions;
//# sourceMappingURL=message-event-bus.d.ts.map