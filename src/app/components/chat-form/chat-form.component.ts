import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';

@Component({
  selector: 'app-chat-form',
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.scss']
})
export class ChatFormComponent implements OnInit {

  @Input() userId: string;
  @Input() roomId: string;

  public chatForm: FormGroup;

  public focus: boolean;
  public focusTouched: boolean;

  public sendingMessage: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private cloudFunctionsService: CloudFunctionsService,
    private alertService: AlertService,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit() {
    this.buildChatForm();
  }

  buildChatForm() {
    this.chatForm = this.formBuilder.group(
      {
        message: ['', [Validators.required]]
      }
    );
  }

  get chatF(): any {
    return this.chatForm.controls;
  }

  async sendMessage() {
    if (this.chatForm.valid) {
      if (this.userId && this.roomId) {
        this.analyticsService.sendChatMessage();
        this.sendingMessage = true;
        const res: any = await this.cloudFunctionsService.postNewMessage(this.userId, null, this.chatF.message.value, this.roomId);

        if (res.success) { // send successful
          this.focusTouched = false;
          this.chatForm.patchValue({ message: '' }); // clear the message form field
          this.sendingMessage = false;

        } else { // error sending message
          this.alertService.alert('warning-message', 'Oops', `Something went wrong! Error: ${res.error}`);
        }
      } else {
        console.log('Cannot post message: No participant uids!');
      }
    } else {
      console.log('Invalid chatform!');
    }
  }

}
