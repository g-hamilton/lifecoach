/*
  A scroll listening directive.
  Place on any host element with a container styled with 'overflow-y: scroll'.
  Useful to detect when scroll reaches the top or bottom of it's container for
  features such as infinite scroll.
*/

import { Directive, HostListener, EventEmitter, Output, ElementRef } from '@angular/core';

@Directive({
  selector: '[appScrollable]'
})
export class ScrollableDirective {

  @Output() scrollPosition = new EventEmitter();

  constructor(public el: ElementRef) { }

  @HostListener('scroll', ['$event']) // listen for the scroll event on the host element
  onScroll(event: any) {
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

    } catch (err) {
      console.log(err);
    }
  }

}
