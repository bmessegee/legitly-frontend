export interface Message {
    id: number;
    senderId: number;
    recipientId: number;
    subject: string;
    body: string;
    timestamp: string;  // You could also use Date, depending on your API
    isRead: boolean;
  }