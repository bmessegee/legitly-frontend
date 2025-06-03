import { Component, inject, Input } from '@angular/core';
import { Document } from '../../../../models/document.model';
import { DatePipe } from '@angular/common';
import { DocumentService } from '../../../../services/document.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-document-item',
  imports: [
    DatePipe, 
    MatIconModule,
    MatButtonModule],
  templateUrl: './document-item.component.html',
  styleUrl: './document-item.component.scss'
})
export class DocumentItemComponent {
  documentService = inject(DocumentService);

  // The document model for this item
  @Input() document: Document | null = null;

  error: string | null = null;

  getDownloadUrl(doc: Document | null){
    if(!doc) return;

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
