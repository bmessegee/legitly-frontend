import { Component, inject, Input, OnInit } from '@angular/core';
import { DocumentService } from '../../../services/document.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Document } from '../../../models/document.model';
import { MatButtonModule } from '@angular/material/button';
import { DocumentItemComponent } from "./document-item/document-item.component";
import { Customer } from '../../../models/customer.model';
import { CustomerService } from '../../../services/customer.service';
import { AuthService } from '../../../services/auth.service';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    NgIf, 
    NgFor, 
    MatButtonModule, 
    DocumentItemComponent,
    DocumentUploadComponent
  ],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent implements OnInit{
  private documentService = inject(DocumentService);
  private customerService = inject(CustomerService);
  public authService = inject(AuthService);

  @Input() customer: Customer | null = null;

  documents: Document[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    if(!this.customer){
      this.customer = this.customerService.getCurrentUserAsCustomer();
    }
    if(!this.customer){
      this.loading = false;
      this.error = 'Failed to load customer';
      return;
    }
    this.documentService.getDocuments(this.customer).subscribe({
      next: docs => {
        this.documents = docs;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load documents for customer ' + this.customer?.Name;
        console.error(err);
        this.loading = false;
      }
    });
  }
}
