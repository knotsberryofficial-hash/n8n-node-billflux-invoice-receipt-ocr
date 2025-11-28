// ===============================
// General Enums And Interfaces
// ===============================
export var EventMessageTypeNames;
(function (EventMessageTypeNames) {
    EventMessageTypeNames["generic"] = "$$EventMessage";
    EventMessageTypeNames["audit"] = "$$EventMessageAudit";
    EventMessageTypeNames["confirm"] = "$$EventMessageConfirm";
    EventMessageTypeNames["workflow"] = "$$EventMessageWorkflow";
    EventMessageTypeNames["node"] = "$$EventMessageNode";
    EventMessageTypeNames["execution"] = "$$EventMessageExecution";
    EventMessageTypeNames["aiNode"] = "$$EventMessageAiNode";
    EventMessageTypeNames["runner"] = "$$EventMessageRunner";
    EventMessageTypeNames["queue"] = "$$EventMessageQueue";
})(EventMessageTypeNames || (EventMessageTypeNames = {}));
export var MessageEventBusDestinationTypeNames;
(function (MessageEventBusDestinationTypeNames) {
    MessageEventBusDestinationTypeNames["abstract"] = "$$AbstractMessageEventBusDestination";
    MessageEventBusDestinationTypeNames["webhook"] = "$$MessageEventBusDestinationWebhook";
    MessageEventBusDestinationTypeNames["sentry"] = "$$MessageEventBusDestinationSentry";
    MessageEventBusDestinationTypeNames["syslog"] = "$$MessageEventBusDestinationSyslog";
})(MessageEventBusDestinationTypeNames || (MessageEventBusDestinationTypeNames = {}));
export const messageEventBusDestinationTypeNames = [
    MessageEventBusDestinationTypeNames.abstract,
    MessageEventBusDestinationTypeNames.webhook,
    MessageEventBusDestinationTypeNames.sentry,
    MessageEventBusDestinationTypeNames.syslog,
];
// ==================================
// Event Destination Default Settings
// ==================================
export const defaultMessageEventBusDestinationOptions = {
    __type: MessageEventBusDestinationTypeNames.abstract,
    id: '',
    label: 'New Event Destination',
    enabled: true,
    subscribedEvents: ['n8n.audit', 'n8n.workflow'],
    credentials: {},
    anonymizeAuditMessages: false,
};
export const defaultMessageEventBusDestinationSyslogOptions = {
    ...defaultMessageEventBusDestinationOptions,
    __type: MessageEventBusDestinationTypeNames.syslog,
    label: 'Syslog Server',
    expectedStatusCode: 200,
    host: '127.0.0.1',
    port: 514,
    protocol: 'tcp',
    facility: 16,
    app_name: 'n8n',
    eol: '\n',
};
export const defaultMessageEventBusDestinationWebhookOptions = {
    ...defaultMessageEventBusDestinationOptions,
    __type: MessageEventBusDestinationTypeNames.webhook,
    credentials: {},
    label: 'Webhook Endpoint',
    expectedStatusCode: 200,
    responseCodeMustMatch: false,
    url: 'https://',
    method: 'POST',
    authentication: 'none',
    sendQuery: false,
    sendHeaders: false,
    genericAuthType: '',
    nodeCredentialType: '',
    specifyHeaders: '',
    specifyQuery: '',
    jsonQuery: '',
    jsonHeaders: '',
    headerParameters: { parameters: [] },
    queryParameters: { parameters: [] },
    sendPayload: true,
    options: {},
};
export const defaultMessageEventBusDestinationSentryOptions = {
    ...defaultMessageEventBusDestinationOptions,
    __type: MessageEventBusDestinationTypeNames.sentry,
    label: 'Sentry DSN',
    dsn: 'https://',
    sendPayload: true,
};
//# sourceMappingURL=message-event-bus.js.map