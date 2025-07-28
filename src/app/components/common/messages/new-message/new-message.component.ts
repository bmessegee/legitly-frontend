import { Component, Output, EventEmitter, Input, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MessagesService } from '../../../../services/messages.service';
import { AuthService } from '../../../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
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
    MatInputModule,
    MatDialogModule
  ]
})
export class NewMessageComponent implements OnInit {
  messageForm: FormGroup;
  @Output() messageSent = new EventEmitter<void>();
  @Input() isReply: boolean = false;
  @Input() parentMessage?: Message;
  @Input() customerId?: string;
  @Input() tenantId?: string;
  
  sending = false;

  constructor(
    private fb: FormBuilder, 
    private messagesService: MessagesService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<NewMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Use dialog data if available, otherwise fall back to inputs
    this.isReply = data?.isReply || this.isReply;
    this.parentMessage = data?.parentMessage || this.parentMessage;
    this.customerId = data?.customerId || this.customerId;
    this.tenantId = data?.tenantId || this.tenantId;
    // Initialize form based on whether it's a reply or new message
    if (this.isReply) {
      this.messageForm = this.fb.group({
        subject: [data?.threadSubject || 'Re: ' + (this.parentMessage?.Subject || ''), Validators.required],
        content: ['', Validators.required]
      });
    } else {
      this.messageForm = this.fb.group({
        subject: ['', Validators.required],
        content: ['', Validators.required]
      });
    }
  }

  ngOnInit() {
    // Additional initialization if needed
    console.log('NewMessageComponent initialized:', {
      isReply: this.isReply,
      formValid: this.messageForm.valid,
      formValue: this.messageForm.value
    });
  }

  // Called when the new message form is submitted.
  onSubmit(): void {
    if (this.messageForm.valid && this.authService.currentUser && !this.sending) {
      this.sending = true;
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
            this.dialogRef.close(true);
          },
          error: error => {
            console.error('Error sending reply', error);
            this.sending = false;
          }
        });
      } else {
        // Create new message thread
        const newMessage: Message = {
          MessageId: '',
          ThreadId: null,
          Subject: formValue.subject,
          Content: formValue.content,
          SenderId: this.authService.currentUser.userId || '',
          RecipientId: this.tenantId || '', // For customer messages, recipient is tenant
          RecipientEmail: null,
          SentOn: new Date().toISOString(),
          IsRead: false,
          MessageType: MessageType.NewThread,
          ParentMessageId: null,
          CustomerId: this.customerId || this.authService.currentUser.customerId || '',
          TenantId: this.tenantId || null,
          TenantInboxKey: null,
          Created: new Date().toISOString(),
          Updated: new Date().toISOString(),
          CreatedBy: this.authService.currentUser.userId || null,
          UpdatedBy: this.authService.currentUser.userId || null
        };
        
        this.messagesService.createMessageThread(newMessage).subscribe({
          next: () => {
            console.log('Message sent successfully.');
            this.messageForm.reset();
            this.messageSent.emit();
            this.dialogRef.close({ success: true, subject: formValue.subject });
          },
          error: error => {
            console.error('Error sending message', error);
            this.sending = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}