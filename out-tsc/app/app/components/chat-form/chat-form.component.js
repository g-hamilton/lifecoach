var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Component, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';
import { AnalyticsService } from 'app/services/analytics.service';
let ChatFormComponent = class ChatFormComponent {
    constructor(formBuilder, cloudFunctionsService, alertService, analyticsService) {
        this.formBuilder = formBuilder;
        this.cloudFunctionsService = cloudFunctionsService;
        this.alertService = alertService;
        this.analyticsService = analyticsService;
        this.invalidMessage = false;
    }
    ngOnInit() {
        this.buildChatForm();
    }
    buildChatForm() {
        this.chatForm = this.formBuilder.group({
            message: ['', [Validators.required]]
        });
    }
    get chatF() {
        return this.chatForm.controls;
    }
    sendMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.chatForm.valid) {
                if (this.userId && this.roomId) {
                    this.analyticsService.sendChatMessage();
                    this.sendingMessage = true;
                    const res = yield this.cloudFunctionsService.postNewMessage(this.userId, null, this.chatF.message.value, this.roomId);
                    this.invalidMessage = false;
                    console.log('sendM');
                    if (res.success) { // send successful
                        this.focusTouched = false;
                        this.chatForm.patchValue({ message: '' }); // clear the message form field
                        this.sendingMessage = false;
                        this.invalidMessage = false;
                        console.log('sendM-res');
                    }
                    else { // error sending message
                        this.alertService.alert('warning-message', 'Oops', `Something went wrong! Error: ${res.error}`);
                    }
                }
                else {
                    console.log('Cannot post message: No participant uids!');
                }
            }
            else {
                this.invalidMessage = true;
                console.log('Invalid chatform!');
            }
        });
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], ChatFormComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", String)
], ChatFormComponent.prototype, "roomId", void 0);
ChatFormComponent = __decorate([
    Component({
        selector: 'app-chat-form',
        templateUrl: './chat-form.component.html',
        styleUrls: ['./chat-form.component.scss']
    }),
    __metadata("design:paramtypes", [FormBuilder,
        CloudFunctionsService,
        AlertService,
        AnalyticsService])
], ChatFormComponent);
export { ChatFormComponent };
//# sourceMappingURL=chat-form.component.js.map