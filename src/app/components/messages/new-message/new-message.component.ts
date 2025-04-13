import { Component, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MessagesService } from '../../../services/messages.service';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule
  ]
})
export class NewMessageComponent {
  messageForm: FormGroup;
  @Output() messageSent = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private messagesService: MessagesService) {
    this.messageForm = this.fb.group({
      recipientId: ['', Validators.required],
      subject: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  // Called when the new message form is submitted.
  onSubmit(): void {
    if (this.messageForm.valid) {
      const messageData = this.messageForm.value;
      this.messagesService.sendMessage(messageData).subscribe({
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