import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Document } from '../models/document.model';
import { ApiService } from './api.service'; // Adjust the import path as needed
import { Customer } from '../models/customer.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    // Define the endpoint for messages relative to the API service's base URL.
    private endpoint = 'document';

    constructor(private apiService: ApiService) { }

    /**
     * Retrieve all messages.
     *
     * This delegates the GET request to the ApiService.
     */
    getDocuments(customer: Customer): Observable<Document[]> {
        // TODO map the customer id to the endpoint
        return this.apiService.get<Document[]>(this.endpoint + "?customerId=" + customer.CustomerId);
    }
    getDocumentUrl(id: string): Observable<string> {
        return this.apiService.get<string>(this.endpoint + "/url/" + id);
    }
}