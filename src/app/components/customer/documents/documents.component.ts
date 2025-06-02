import { Component, inject, OnInit } from '@angular/core';
import { DocumentService } from '../../../services/document.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Document } from '../../../models/document.model';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [DatePipe, NgIf, NgFor, MatButtonModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss'
})
export class DocumentsComponent implements OnInit{
   private documentService = inject(DocumentService);
   
  documents: Document[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.documentService.getDocuments().subscribe({
      next: docs => {
        this.documents = docs;
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load documents';
        console.error(err);
        this.loading = false;
      }
    });
  }
  getDownloadUrl(doc: Document){
    this.documentService.getDocumentUrl(doc.DocumentId).subscribe({
      next: docUrl => {
        window.open(docUrl);
      },
      error: err => {
        this.error = 'Failed to get url for ' + doc.FileName;
        console.error(err); 
     }
    });
  }
}
