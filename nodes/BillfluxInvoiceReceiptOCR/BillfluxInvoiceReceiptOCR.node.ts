/// <reference types="node" />
import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

export class BillfluxInvoiceReceiptOCR implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
		displayName: 'Billflux Invoice Receipt OCR',
		name: 'billfluxInvoiceReceiptOCR',
		icon: 'file:../../../../../../../../n8n-node-billflux-invoice-receipt-ocr/dist/nodes/BillfluxInvoiceReceiptOCR/logo-og.svg',
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

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (operation === 'parseFile') {
					const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
					const customFields = this.getNodeParameter('customFields', i, {}) as any;

					// Get credentials
					const credentials = await this.getCredentials('billfluxInvoiceReceiptOCRApi');
					const apiKey = credentials.apiKey as string;

					// Get the binary data
					const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
					const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

					// Build multipart form data manually (no external dependencies allowed)
					const boundary = '----n8nFormBoundary' + Math.random().toString(36).substring(2);
					const fileName = binaryData.fileName || 'file';
					const mimeType = binaryData.mimeType || 'application/octet-stream';

					// Build custom field part if needed
					let customFieldPart = Buffer.alloc(0);
					if (customFields.attributes && customFields.attributes.length > 0) {
						const customFieldJson: Record<string, string> = {};
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

					// Build file part
					let fileHeader = `--${boundary}\r\n`;
					fileHeader += `Content-Disposition: form-data; name="data"; filename="${fileName}"\r\n`;
					fileHeader += `Content-Type: ${mimeType}\r\n\r\n`;
					const fileHeaderBuffer = Buffer.from(fileHeader, 'utf8');
					const fileEndBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');

					// Combine all parts
					const fullBody = Buffer.concat([customFieldPart, fileHeaderBuffer, buffer, fileEndBuffer]);

					// Make the API request using httpRequest
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

					// Check if response is an array and unwrap it
					const responseData = Array.isArray(response) && response.length === 1 
						? response[0] 
						: response;

					returnData.push({
						json: responseData as any,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
			}
		}

		return [returnData];
	}
}

