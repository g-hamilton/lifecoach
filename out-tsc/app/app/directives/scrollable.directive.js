/*
  A scroll listening directive.
  Place on any host element with a container styled with 'overflow-y: scroll'.
  Useful to detect when scroll reaches the top or bottom of it's container for
  features such as infinite scroll.
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Directive, HostListener, EventEmitter, Output, ElementRef } from '@angular/core';
let ScrollableDirective = class ScrollableDirective {
    constructor(el) {
        this.el = el;
        this.scrollPosition = new EventEmitter();
    }
    onScroll(event) {
        try {
            const top = event.target.scrollTop;
            const height = this.el.nativeElement.scrollHeight;
            const offset = this.el.nativeElement.offsetHeight;
            // emit bottom event
            if (top > height - offset - 1) {
                this.scrollPosition.emit('bottom');
            }
            // emit top event
            if (top === 0) {
                this.scrollPosition.emit('top');
            }
        }
        catch (err) {
            console.log(err);
        }
    }
};
__decorate([
    Output(),
    __metadata("design:type", Object)
], ScrollableDirective.prototype, "scrollPosition", void 0);
__decorate([
    HostListener('scroll', ['$event']) // listen for the scroll event on the host element
    ,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ScrollableDirective.prototype, "onScroll", null);
ScrollableDirective = __decorate([
    Directive({
        selector: '[appScrollable]'
    }),
    __metadata("design:paramtypes", [ElementRef])
], ScrollableDirective);
export { ScrollableDirective };
//# sourceMappingURL=scrollable.directive.js.map