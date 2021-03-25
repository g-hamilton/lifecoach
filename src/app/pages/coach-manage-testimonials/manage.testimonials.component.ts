import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { EditClientTestimonialModalComponent } from 'app/components/edit-client-testimonial-modal/edit-client-testimonial-modal.component';
import { ClientTestimonial } from 'app/interfaces/client.testimonial.interface';
import { AuthService } from 'app/services/auth.service';
import { TestimonialsService } from 'app/services/testimonials.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-manage-testimonials',
    templateUrl: './manage.testimonials.component.html',
    styleUrls: ['./manage.testimonials.component.scss']
})
export class ManageTestimonialsComponent implements OnInit, OnDestroy {

    public bsModalRef: BsModalRef;
    public browser: boolean;
    private userId: string;
    public testimonials: ClientTestimonial[];
    private subscriptions: Subscription = new Subscription();

    constructor(
        @Inject(PLATFORM_ID) private platformId: object,
        private authService: AuthService,
        private testimonialsService: TestimonialsService,
        private modalService: BsModalService
    ) {}

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
            this.getUserData();
        }
    }

    getUserData() {
        this.subscriptions.add(
          this.authService.getAuthUser().subscribe(user => {
            if (user) {
              this.userId = user.uid;
              this.fetchTestimonials();
            }
          })
        );
    }

    fetchTestimonials() {
        this.subscriptions.add(
            this.testimonialsService.getCoachTestimonials(this.userId).subscribe(data => {
                if (data) {
                    this.testimonials = data;
                }
            })
        );
    }

    createTestimonial() {
        // pop the modal
        // we can send data to the modal & open in a another component via a service
        // https://valor-software.com/ngx-bootstrap/#/modals#service-component
        const config: ModalOptions = {
            class: 'modal-lg', // let's make this a large one!
            initialState: {
            title: `Add Testimonial`
            } as any
        };
        this.bsModalRef = this.modalService.show(EditClientTestimonialModalComponent, config);
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

}
