import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class BillfluxInvoiceReceiptOCR implements ICredentialType {
	name = 'billfluxInvoiceReceiptOCRApi';
	displayName = 'Billflux Invoice Receipt OCR API';
	documentationUrl = 'https://rapidapi.com/billflux-invoice-receipt-ocr/api/billflux-invoice-receipt-ocr';
	icon: Icon = 'file:../../../../../../../../n8n-node-billflux-invoice-receipt-ocr/dist/nodes/BillfluxInvoiceReceiptOCR/logo-og.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your RapidAPI key for Billflux Invoice Receipt OCR',
		},
	];
	authenticate = {
		type: 'generic',
		properties: {
			headers: {
				'X-RapidAPI-Key': '={{$credentials.apiKey}}',
				'X-RapidAPI-Host': 'billflux-invoice-receipt-ocr.p.rapidapi.com',
			}
		},
	} as IAuthenticateGeneric;

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://billflux-invoice-receipt-ocr.p.rapidapi.com',
			url: '/health',
		},
	};
}

