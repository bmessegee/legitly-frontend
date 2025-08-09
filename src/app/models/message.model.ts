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
    
    // Friendly display names for UI (instead of showing MessageId)
    DisplayTitle?: string; // e.g., "Message from John Doe" or "Re: LLC Formation Question"
    SenderDisplayName?: string; // e.g., "John Doe" instead of sender ID
    PreviewText?: string; // First 100 chars of content for preview
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
    
    // Friendly display properties
    DisplayTitle?: string; // e.g., "Conversation with Legitly Support"
    LastSenderDisplayName?: string; // e.g., "John Doe" instead of ID
    LastMessagePreview?: string; // Preview of last message
}