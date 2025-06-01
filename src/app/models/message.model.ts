export interface Message {
    MessageId: string;
    CustomerId: string
    SenderId: string;
    RecipientId: string;
    RecipientEmail: string;
    Subject: string;
    Content: string;
    SentOn: string;  // You could also use Date, depending on your API
    IsRead: boolean;

  }