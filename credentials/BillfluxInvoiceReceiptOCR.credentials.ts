import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class BillfluxInvoiceReceiptOCR implements ICredentialType {
	name = 'billfluxInvoiceReceiptOCRApi';
	displayName = 'Billflux Invoice Receipt OCR API';
	documentationUrl = 'https://rapidapi.com/billflux-invoice-receipt-ocr/api/billflux-invoice-receipt-ocr';
	icon: Icon = 'file:../../../../../../../../n8n-nodes-pixi-invoice-reciept-ocr/dist/nodes/BillfluxInvoiceReceiptOCR/logo-og.svg';
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
				'X-RapidAPI-Key': '={{$credentials.apiKey}}'
			}
		},
	} as IAuthenticateGeneric;
}

