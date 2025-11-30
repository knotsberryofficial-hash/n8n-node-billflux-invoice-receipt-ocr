"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillfluxInvoiceReceiptOCR = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class BillfluxInvoiceReceiptOCR {
    constructor() {
        this.description = {
            displayName: 'Billflux Invoice Receipt OCR',
            name: 'billfluxInvoiceReceiptOCR',
            icon: 'file:../../../../../../../../n8n-node-billflux-invoice-receipt-ocr/dist/nodes/BillfluxInvoiceReceiptOCR/invoice-icon.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Extract data from invoices and receipts using OCR',
            defaults: {
                name: 'Billflux Invoice Receipt OCR',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'billfluxInvoiceReceiptOCRApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Analyze Invoice or Receipt',
                            value: 'parseFile',
                            description: 'Extract data from invoice or receipt using OCR',
                            action: 'Parse an invoice or receipt file',
                        },
                    ],
                    default: 'parseFile',
                },
                {
                    displayName: 'Input Binary Field',
                    name: 'binaryPropertyName',
                    type: 'string',
                    default: 'data',
                    required: true,
                    displayOptions: {
                        show: {
                            operation: ['parseFile'],
                        },
                    },
                    description: 'Name of the binary property containing the invoice/receipt file to parse',
                },
                {
                    displayName: 'Custom Fields',
                    name: 'customFields',
                    type: 'fixedCollection',
                    typeOptions: {
                        multipleValues: true,
                    },
                    default: {},
                    displayOptions: {
                        show: {
                            operation: ['parseFile'],
                        },
                    },
                    description: 'Add custom fields for additional processing instructions',
                    placeholder: 'Add Custom Field',
                    options: [
                        {
                            displayName: 'Attributes',
                            name: 'attributes',
                            values: [
                                {
                                    displayName: 'Name',
                                    name: 'name',
                                    type: 'string',
                                    default: '',
                                    placeholder: 'e.g. company_name',
                                    description: 'Name of the custom field',
                                    required: true,
                                },
                                {
                                    displayName: 'Description',
                                    name: 'description',
                                    type: 'string',
                                    default: '',
                                    placeholder: 'Add description for the attribute',
                                    description: 'Description of what this field should contain',
                                    required: true,
                                },
                            ],
                        },
                    ],
                },
            ]
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        const operation = this.getNodeParameter('operation', 0);
        for (let i = 0; i < items.length; i++) {
            try {
                if (operation === 'parseFile') {
                    const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i);
                    const customFields = this.getNodeParameter('customFields', i, {});
                    const credentials = await this.getCredentials('billfluxInvoiceReceiptOCRApi');
                    const apiKey = credentials.apiKey;
                    const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
                    const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
                    const boundary = '----n8nFormBoundary' + Math.random().toString(36).substring(2);
                    const fileName = binaryData.fileName || 'file';
                    const mimeType = binaryData.mimeType || 'application/octet-stream';
                    let customFieldPart = Buffer.alloc(0);
                    if (customFields.attributes && customFields.attributes.length > 0) {
                        const customFieldJson = {};
                        for (const attr of customFields.attributes) {
                            if (attr.name && attr.description) {
                                customFieldJson[attr.name] = attr.description;
                            }
                        }
                        if (Object.keys(customFieldJson).length > 0) {
                            let cfBody = `--${boundary}\r\n`;
                            cfBody += `Content-Disposition: form-data; name="custom_field"\r\n\r\n`;
                            cfBody += JSON.stringify(customFieldJson);
                            cfBody += `\r\n`;
                            customFieldPart = Buffer.from(cfBody, 'utf8');
                        }
                    }
                    let fileHeader = `--${boundary}\r\n`;
                    fileHeader += `Content-Disposition: form-data; name="data"; filename="${fileName}"\r\n`;
                    fileHeader += `Content-Type: ${mimeType}\r\n\r\n`;
                    const fileHeaderBuffer = Buffer.from(fileHeader, 'utf8');
                    const fileEndBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
                    const fullBody = Buffer.concat([customFieldPart, fileHeaderBuffer, buffer, fileEndBuffer]);
                    const response = await this.helpers.httpRequest({
                        method: 'POST',
                        url: 'https://billflux-invoice-receipt-ocr.p.rapidapi.com/parse-file',
                        headers: {
                            'X-RapidAPI-Key': apiKey,
                            'X-RapidAPI-Host': 'billflux-invoice-receipt-ocr.p.rapidapi.com',
                            'Content-Type': `multipart/form-data; boundary=${boundary}`,
                        },
                        body: fullBody,
                    });
                    const responseData = Array.isArray(response) && response.length === 1
                        ? response[0]
                        : response;
                    returnData.push({
                        json: responseData,
                        pairedItem: { item: i },
                    });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                        },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error.message, { itemIndex: i });
            }
        }
        return [returnData];
    }
}
exports.BillfluxInvoiceReceiptOCR = BillfluxInvoiceReceiptOCR;
//# sourceMappingURL=BillfluxInvoiceReceiptOCR.node.js.map