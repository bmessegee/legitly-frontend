import { Component, ViewChild, ElementRef } from '@angular/core';
import { FieldType } from '@ngx-formly/material/form-field';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { DocumentUploadService } from '../../../services/document-upload.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'formly-field-file',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="file-upload-field">
      <input 
        #fileInput
        type="file" 
        [accept]="props['accept'] || '*'"
        [multiple]="props['multiple'] || false"
        (change)="onFileSelected($event)"
        style="display: none;"
      />
      
      <div class="file-upload-container">
        <button 
          type="button" 
          mat-raised-button 
          color="primary"
          (click)="selectFile()"
          [disabled]="uploading">
          <mat-icon>upload_file</mat-icon>
          {{ uploading ? 'Uploading...' : (props['label'] || 'Select File') }}
        </button>
        
        <div class="file-info" *ngIf="selectedFileName">
          <mat-icon>attach_file</mat-icon>
          <span>{{ selectedFileName }}</span>
          <button 
            type="button" 
            mat-icon-button 
            (click)="removeFile()"
            [disabled]="uploading">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <mat-progress-bar 
          *ngIf="uploading" 
          mode="indeterminate">
        </mat-progress-bar>
      </div>
      
      <div class="file-description" *ngIf="props['description']">
        <small>{{ props['description'] }}</small>
      </div>
    </div>
  `,
  styles: [`
    .file-upload-field {
      width: 100%;
      margin: 8px 0;
    }
    
    .file-upload-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .file-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .file-description {
      margin-top: 4px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    mat-progress-bar {
      margin-top: 8px;
    }
  `]
})
export class FileFieldComponent extends FieldType<FormlyFieldConfig> {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  selectedFileName: string | null = null;
  uploading = false;
  uploadedDocumentId: string | null = null;

  constructor(
    private documentUploadService: DocumentUploadService,
    private snackBar: MatSnackBar
  ) {
    super();
  }

  selectFile(): void {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validate file
    const validation = this.documentUploadService.validateFile(file);
    if (!validation.valid) {
      this.snackBar.open(validation.error || 'Invalid file', 'Close', { duration: 5000 });
      return;
    }

    this.selectedFileName = file.name;
    this.uploading = true;

    try {
      // Upload the file using your document upload service
      const document = await this.documentUploadService.uploadDocument(
        file,
        this.props['description'] || 'Form upload',
        this.props['category'] || 'business'
      );

      // Store the document ID in the form model and track it for deletion
      this.uploadedDocumentId = document.DocumentId;
      this.formControl.setValue(document.DocumentId);
      
      this.snackBar.open('File uploaded successfully!', 'Close', { duration: 3000 });
      
    } catch (error: any) {
      this.snackBar.open(`Upload failed: ${error.message}`, 'Close', { duration: 5000 });
      this.removeFile();
    } finally {
      this.uploading = false;
    }
  }

  async removeFile(): Promise<void> {
    // If there's an uploaded document, delete it from the API
    if (this.uploadedDocumentId) {
      try {
        await firstValueFrom(this.documentUploadService.deleteDocument(this.uploadedDocumentId));
        this.snackBar.open('File removed successfully!', 'Close', { duration: 3000 });
      } catch (error: any) {
        this.snackBar.open(`Failed to remove file: ${error.message}`, 'Close', { duration: 5000 });
        // Continue with local cleanup even if API delete fails
      }
    }

    // Clear local state
    this.selectedFileName = null;
    this.uploadedDocumentId = null;
    this.formControl.setValue(null);
    this.fileInput.nativeElement.value = '';
  }
}