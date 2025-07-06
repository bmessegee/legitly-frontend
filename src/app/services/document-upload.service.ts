import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { Document, DocumentUploadRequest, DocumentStatus } from '../models/document.model';
import { ApiService } from './api.service';

export interface UploadProgress {
  documentId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentUploadService {
  private readonly endpoint = 'document';
  private uploadProgressSubject = new BehaviorSubject<UploadProgress[]>([]);
  
  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) {}

  get uploadProgress$(): Observable<UploadProgress[]> {
    return this.uploadProgressSubject.asObservable();
  }

  /**
   * Create upload URL and document record
   */
  createUploadUrl(request: DocumentUploadRequest): Observable<Document> {
    return this.apiService.post<Document>(`${this.endpoint}/upload`, request);
  }

  /**
   * Upload file directly to S3 using the pre-signed URL
   */
  async uploadFileToS3(file: File, uploadUrl: string, document: Document): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Update progress
      this.updateUploadProgress(document.DocumentId, document.FileName, 0, 'uploading');

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          this.updateUploadProgress(document.DocumentId, document.FileName, progress, 'uploading');
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          this.updateUploadProgress(document.DocumentId, document.FileName, 100, 'complete');
          resolve();
        } else {
          const error = `Upload failed with status ${xhr.status}`;
          this.updateUploadProgress(document.DocumentId, document.FileName, 0, 'error', error);
          reject(new Error(error));
        }
      });

      xhr.addEventListener('error', () => {
        const error = 'Upload failed due to network error';
        this.updateUploadProgress(document.DocumentId, document.FileName, 0, 'error', error);
        reject(new Error(error));
      });

      xhr.addEventListener('abort', () => {
        const error = 'Upload was aborted';
        this.updateUploadProgress(document.DocumentId, document.FileName, 0, 'error', error);
        reject(new Error(error));
      });

      // Set content type header to match what was specified in the pre-signed URL
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', document.ContentType);
      xhr.send(file);
    });
  }

  /**
   * Complete upload workflow: create upload URL, then upload file to S3
   */
  async uploadDocument(file: File, description?: string, category?: string, customerId?: string): Promise<Document> {
    const request: DocumentUploadRequest = {
      FileName: file.name,
      ContentType: file.type || 'application/octet-stream',
      FileSize: file.size,
      Description: description,
      Category: category,
      CustomerId: customerId
    };

    try {
      // Step 1: Create upload URL and document record
      const document = await firstValueFrom(this.createUploadUrl(request));
      
      if (!document || !document.UploadUrl) {
        throw new Error('Failed to create upload URL');
      }

      // Step 2: Upload file to S3
      await this.uploadFileToS3(file, document.UploadUrl, document);

      return document;
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  getDocument(id: string): Observable<Document> {
    return this.apiService.get<Document>(`${this.endpoint}/${id}`);
  }

  /**
   * Get document download URL
   */
  getDocumentDownloadUrl(id: string): Observable<string> {
    return this.apiService.get<string>(`${this.endpoint}/${id}/url`);
  }

  /**
   * List documents for a customer
   */
  listDocuments(customerId: string): Observable<Document[]> {
    return this.apiService.get<Document[]>(`${this.endpoint}?customerId=${customerId}`);
  }

  /**
   * Update upload progress
   */
  private updateUploadProgress(
    documentId: string, 
    fileName: string, 
    progress: number, 
    status: 'uploading' | 'complete' | 'error',
    error?: string
  ): void {
    const currentProgress = this.uploadProgressSubject.value;
    const existingIndex = currentProgress.findIndex(p => p.documentId === documentId);
    
    const newProgress: UploadProgress = {
      documentId,
      fileName,
      progress,
      status,
      error
    };

    if (existingIndex >= 0) {
      currentProgress[existingIndex] = newProgress;
    } else {
      currentProgress.push(newProgress);
    }

    this.uploadProgressSubject.next([...currentProgress]);
  }

  /**
   * Clear upload progress for a specific document
   */
  clearUploadProgress(documentId: string): void {
    const currentProgress = this.uploadProgressSubject.value;
    const filtered = currentProgress.filter(p => p.documentId !== documentId);
    this.uploadProgressSubject.next(filtered);
  }

  /**
   * Clear all upload progress
   */
  clearAllUploadProgress(): void {
    this.uploadProgressSubject.next([]);
  }

  /**
   * Check if a file type is allowed
   */
  isFileTypeAllowed(file: File): boolean {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    return allowedTypes.includes(file.type);
  }

  /**
   * Check if file size is within limits
   */
  isFileSizeAllowed(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.isFileTypeAllowed(file)) {
      return { 
        valid: false, 
        error: 'File type not allowed. Please upload PDF, image, or document files.' 
      };
    }

    if (!this.isFileSizeAllowed(file)) {
      return { 
        valid: false, 
        error: 'File size exceeds 10MB limit.' 
      };
    }

    return { valid: true };
  }
}