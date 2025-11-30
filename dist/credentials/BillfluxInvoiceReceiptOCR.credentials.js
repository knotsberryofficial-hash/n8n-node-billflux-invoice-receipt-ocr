"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillfluxInvoiceReceiptOCR = void 0;
class BillfluxInvoiceReceiptOCR {
    constructor() {
        this.name = 'billfluxInvoiceReceiptOCRApi';
        this.displayName = 'Billflux Invoice Receipt OCR API';
        this.documentationUrl = 'https://rapidapi.com/billflux-invoice-receipt-ocr/api/billflux-invoice-receipt-ocr';
        this.icon = 'file:../../../../../../../../n8n-node-billflux-invoice-receipt-ocr/dist/nodes/BillfluxInvoiceReceiptOCR/invoice-icon.svg';
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
                    'X-RapidAPI-Key': '={{$credentials.apiKey}}',
                    'X-RapidAPI-Host': 'billflux-invoice-receipt-ocr.p.rapidapi.com',
                }
            },
        };
        this.test = {
            request: {
                baseURL: 'https://billflux-invoice-receipt-ocr.p.rapidapi.com',
                url: '/health',
            },
        };
    }
}
exports.BillfluxInvoiceReceiptOCR = BillfluxInvoiceReceiptOCR;
//# sourceMappingURL=BillfluxInvoiceReceiptOCR.credentials.js.map