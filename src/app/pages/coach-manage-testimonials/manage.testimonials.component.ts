import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ClientTestimonial } from 'app/interfaces/client.testimonial.interface';
import { AuthService } from 'app/services/auth.service';
import { TestimonialsService } from 'app/services/testimonials.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-manage-testimonials',
    templateUrl: './manage.testimonials.component.html',
    styleUrls: ['./manage.testimonials.component.scss']
})
export class ManageTestimonialsComponent implements OnInit, OnDestroy {

    public browser: boolean;
    private userId: string;
    public testimonials: ClientTestimonial[];
    private subscriptions: Subscription = new Subscription();

    constructor(
        @Inject(PLATFORM_ID) private platformId: object,
        private authService: AuthService,
        private testimonialsService: TestimonialsService
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
        //
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

}
