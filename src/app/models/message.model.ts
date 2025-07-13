export interface Message {
    MessageId: string;
    CustomerId: string;
    TenantId: string;
    SenderId: string;
    RecipientId: string;
    //RecipientEmail: string;
    Subject: string;
    Content: string;
    SentOn: string;  // You could also use Date, depending on your API
    IsRead: boolean;
    
    // Threading support
    ThreadId: string;
    ParentMessageId?: string;
    MessageType: MessageType;
    TenantInboxKey?: string;
}

export enum MessageType {
    NewThread = 'NewThread',
    Reply = 'Reply'
}

export interface MessageThread {
    ThreadId: string;
    Subject: string;
    CustomerId: string;
    CustomerName?: string;
    TenantId: string;
    Messages: Message[];
    LastMessageDate: string;
    UnreadCount: number;
    LastSender: string;
}