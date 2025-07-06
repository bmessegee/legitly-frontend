export interface Document {
    DocumentId: string;
    CustomerId: string;
    TenantId: string;
    FileName: string;
    ContentType: string;
    FileSize: number;
    StorageLocation: string;
    Status: DocumentStatus;
    S3Key: string;
    S3Bucket: string;
    Description: string;
    Category: string;
    UploadUrl: string;
    UploadedAt?: Date;
    Created: Date;
    Updated: Date;
    CreatedBy: string;
    UpdatedBy: string;
}

export enum DocumentStatus {
    Pending = 'Pending',
    Uploading = 'Uploading',
    Complete = 'Complete',
    Failed = 'Failed',
    Processing = 'Processing'
}

export interface DocumentUploadRequest {
    FileName: string;
    ContentType: string;
    FileSize: number;
    Description?: string;
    Category?: string;
    CustomerId?: string;
}