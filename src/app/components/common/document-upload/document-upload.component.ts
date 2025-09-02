import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, Subscription } from 'rxjs';

import { DocumentUploadService, UploadProgress } from '../../../services/document-upload.service';
import { Document, DocumentStatus } from '../../../models/document.model';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
})
export class DocumentUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Input() customerId?: string; // For tenant uploads to specific customers
  @Input() compact: boolean = false; // Compact mode for sidebar display

  uploadForm: FormGroup;
  selectedFiles: File[] = [];
  uploadProgress$: Observable<UploadProgress[]>;
  isDragOver = false;
  
  documentCategories = [
    { value: 'identity', label: 'Identity Documents' },
    { value: 'business', label: 'Business Documents' },
    { value: 'financial', label: 'Financial Documents' },
    { value: 'legal', label: 'Legal Documents' },
    { value: 'tax', label: 'Tax Documents' },
    { value: 'other', label: 'Other' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private documentUploadService: DocumentUploadService,
    private snackBar: MatSnackBar
  ) {
    this.uploadForm = this.fb.group({
      description: [''],
      category: ['other', Validators.required]
    });

    this.uploadProgress$ = this.documentUploadService.uploadProgress$;
  }

  ngOnInit(): void {
    // Subscribe to upload progress updates
    const progressSub = this.uploadProgress$.subscribe(progress => {
      // Handle any progress-specific logic here if needed
    });
    this.subscriptions.push(progressSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFileSelection(Array.from(files));
    }
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFileSelection(Array.from(input.files));
    }
  }

  selectFiles(): void {
    this.fileInput.nativeElement.click();
  }

  private handleFileSelection(files: File[]): void {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const validation = this.documentUploadService.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      this.snackBar.open(
        `Some files were rejected: ${errors.join(', ')}`,
        'Close',
        { duration: 5000 }
      );
    }

    if (validFiles.length > 0) {
      this.selectedFiles = [...this.selectedFiles, ...validFiles];
      this.snackBar.open(
        `${validFiles.length} file(s) selected for upload`,
        'Close',
        { duration: 3000 }
      );
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  async uploadFiles(): Promise<void> {
    if (this.selectedFiles.length === 0) {
      this.snackBar.open('Please select files to upload', 'Close', { duration: 3000 });
      return;
    }

    if (!this.uploadForm.valid) {
      this.snackBar.open('Please fill in required fields', 'Close', { duration: 3000 });
      return;
    }

    const description = this.uploadForm.get('description')?.value;
    const category = this.uploadForm.get('category')?.value;

    const uploadPromises = this.selectedFiles.map(async (file) => {
      try {
        await this.documentUploadService.uploadDocument(file, description, category, this.customerId);
        return { success: true, fileName: file.name };
      } catch (error: any) {
        return { success: false, fileName: file.name, error: error.message };
      }
    });

    try {
      const results = await Promise.allSettled(uploadPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        this.snackBar.open(
          `Successfully uploaded ${successful} file(s)`,
          'Close',
          { duration: 3000 }
        );
      }

      if (failed > 0) {
        this.snackBar.open(
          `Failed to upload ${failed} file(s)`,
          'Close',
          { duration: 5000 }
        );
      }

      // Clear selected files on successful upload
      if (successful > 0) {
        this.selectedFiles = [];
        this.uploadForm.reset({ category: 'other' });
      }

    } catch (error) {
      this.snackBar.open('Upload failed', 'Close', { duration: 5000 });
    }
  }

  clearFiles(): void {
    this.selectedFiles = [];
  }

  clearProgress(documentId: string): void {
    this.documentUploadService.clearUploadProgress(documentId);
  }

  clearAllProgress(): void {
    this.documentUploadService.clearAllUploadProgress();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(file: File): string {
    const type = file.type.toLowerCase();
    
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('image')) return 'image';
    if (type.includes('word') || type.includes('document')) return 'description';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'grid_on';
    if (type.includes('text')) return 'text_snippet';
    
    return 'insert_drive_file';
  }

  getProgressColor(progress: UploadProgress): string {
    switch (progress.status) {
      case 'complete': return 'primary';
      case 'error': return 'warn';
      default: return 'accent';
    }
  }

  getStatusIcon(progress: UploadProgress): string {
    switch (progress.status) {
      case 'complete': return 'check_circle';
      case 'error': return 'error';
      default: return 'upload';
    }
  }
}