import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MessagesService } from '../../../../services/messages.service';
import { AuthService } from '../../../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Message, MessageType } from '../../../../models/message.model';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule
  ]
})
export class NewMessageComponent {
  messageForm: FormGroup;
  @Output() messageSent = new EventEmitter<void>();
  @Input() isReply: boolean = false;
  @Input() parentMessage?: Message;
  @Input() customerId?: string;
  @Input() tenantId?: string;

  constructor(
    private fb: FormBuilder, 
    private messagesService: MessagesService,
    private authService: AuthService
  ) {
    this.messageForm = this.fb.group({
      subject: ['', Validators.required],
      content: ['', Validators.required]
    });
  }

  // Called when the new message form is submitted.
  onSubmit(): void {
    if (this.messageForm.valid && this.authService.currentUser) {
      const formValue = this.messageForm.value;
      
      if (this.isReply && this.parentMessage) {
        // Reply to existing message
        this.messagesService.replyToMessage(
          this.parentMessage.MessageId,
          formValue.content
        ).subscribe({
          next: () => {
            console.log('Reply sent successfully.');
            this.messageForm.reset();
            this.messageSent.emit();
          },
          error: error => console.error('Error sending reply', error)
        });
      } else {
        // Create new message thread
        const newMessage: Message = {
          MessageId: '',
          ThreadId: '',
          Subject: formValue.subject,
          Content: formValue.content,
          SenderId: this.authService.currentUser.userId || '',
          RecipientId: '', // Will be set by backend based on tenant/customer,
          SentOn: new Date().toISOString(),
          IsRead: false,
          MessageType: MessageType.NewThread,
          ParentMessageId: undefined,
          CustomerId: this.customerId || this.authService.currentUser.customerId || '',
          TenantId: this.tenantId || '',
          TenantInboxKey: ''
        };
        
        this.messagesService.createMessageThread(newMessage).subscribe({
          next: () => {
            console.log('Message sent successfully.');
            this.messageForm.reset();
            this.messageSent.emit();
          },
          error: error => console.error('Error sending message', error)
        });
      }
    }
  }
}