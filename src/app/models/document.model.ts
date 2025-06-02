export interface Document {
    DocumentId: string;
    CustomerId: string;
    TenantId: string;
    FileName: string;
    ContentType: string;
    FileSize: number;
    StorageLocation: string;
    Created: Date;
    Updated: Date;
    CreatedBy: string;
    UpdatedBy: string;
}