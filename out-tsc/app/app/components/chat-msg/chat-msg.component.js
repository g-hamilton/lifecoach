var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
let ChatMsgComponent = class ChatMsgComponent {
    constructor() { }
    ngOnInit() {
    }
    convertTimestamp(unix) {
        const date = new Date(unix * 1000);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = days[date.getDay()];
        const timeString = date.toLocaleTimeString();
        return `${day} ${date.toLocaleDateString()} ${timeString}`;
    }
};
__decorate([
    Input(),
    __metadata("design:type", String)
], ChatMsgComponent.prototype, "userId", void 0);
__decorate([
    Input(),
    __metadata("design:type", Object)
], ChatMsgComponent.prototype, "message", void 0);
ChatMsgComponent = __decorate([
    Component({
        selector: 'app-chat-msg',
        templateUrl: './chat-msg.component.html',
        styleUrls: ['./chat-msg.component.scss']
    }),
    __metadata("design:paramtypes", [])
], ChatMsgComponent);
export { ChatMsgComponent };
//# sourceMappingURL=chat-msg.component.js.map