"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillfluxInvoiceReceiptOCR = void 0;
class BillfluxInvoiceReceiptOCR {
    constructor() {
        this.name = 'billfluxInvoiceReceiptOCRApi';
        this.displayName = 'Billflux Invoice Receipt OCR API';
        this.documentationUrl = 'https://rapidapi.com/billflux-invoice-receipt-ocr/api/billflux-invoice-receipt-ocr';
        this.icon = 'file:../../../../../../../../n8n-node-billflux-invoice-receipt-ocr/dist/nodes/BillfluxInvoiceReceiptOCR/logo-og.svg';
        this.properties = [
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
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    'X-RapidAPI-Key': '={{$credentials.apiKey}}'
                }
            },
        };
    }
}
exports.BillfluxInvoiceReceiptOCR = BillfluxInvoiceReceiptOCR;
//# sourceMappingURL=BillfluxInvoiceReceiptOCR.credentials.js.map