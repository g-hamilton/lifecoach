import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { ClientTestimonial } from 'app/interfaces/client.testimonial.interface';

@Component({
  selector: 'app-client-testimonial',
  templateUrl: './client-testimonial.component.html',
  styleUrls: ['./client-testimonial.component.scss']
})
export class ClientTestimonialComponent implements OnInit, OnChanges {

  @Input() testimonial: ClientTestimonial;

  public avatar: string;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.checkAvatar();
  }

  checkAvatar() {
    if (this.testimonial) {
      if (this.testimonial.img) {
        this.avatar = this.testimonial.img;
      } else {
        this.avatar = `https://eu.ui-avatars.com/api/?name=${this.testimonial.firstName}+${this.testimonial.lastName}&size=100`;
      }
    }
  }

}
