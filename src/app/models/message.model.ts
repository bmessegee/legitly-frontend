export interface Message {
    MessageId: string;
    CustomerId: string;
    TenantId: string | null;
    SenderId: string;
    RecipientId: string;
    RecipientEmail?: string | null;
    Subject: string;
    Content: string;
    SentOn: string;  // You could also use Date, depending on your API
    IsRead: boolean;
    
    // Threading support
    ThreadId: string | null;
    ParentMessageId?: string | null;
    MessageType: MessageType | number;
    TenantInboxKey?: string | null;
    
    // Additional fields from API
    Created?: string;
    Updated?: string;
    CreatedBy?: string | null;
    UpdatedBy?: string | null;
}

export enum MessageType {
    NewThread = 0,
    Reply = 1
}

export const MessageTypeString = {
    [MessageType.NewThread]: 'NewThread',
    [MessageType.Reply]: 'Reply'
} as const;

export interface MessageThread {
    ThreadId: string | null;
    Subject: string;
    CustomerId: string;
    CustomerName?: string | null;
    TenantId: string | null;
    Messages: Message[];
    LastMessageDate: string;
    UnreadCount: number;
    LastSender: string;
}