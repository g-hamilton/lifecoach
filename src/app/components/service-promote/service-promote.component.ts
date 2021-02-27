import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from 'app/services/alert.service';
import { isPlatformBrowser } from '@angular/common';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-service-promote',
  templateUrl: './service-promote.component.html',
  styleUrls: ['./service-promote.component.scss']
})
export class ServicePromoteComponent implements OnInit, OnChanges {

  @Input() userId: string;
  @Input() service: CoachingService;

  public browser: boolean;
  public promoteForm: FormGroup;

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildPromoteForm();
    }
  }

  ngOnChanges() {
    if (this.userId && this.service) {
      const baseUrl = `${environment.baseUrl}/coaching-service/${this.service.serviceId}`;
      const queryparams = `?referralCode=${this.userId}`;
      this.promoteForm.patchValue({ referralCode: `${baseUrl}${queryparams}` });
    }
  }

  buildPromoteForm() {
    this.promoteForm = this.formBuilder.group({
      referralCode: ['', [Validators.required]]
    });
  }

  get promoteF(): any {
    return this.promoteForm.controls;
  }

  copyReferralCode(element: any) {
    // Copy to the clipboard.
    // Note: Don't try this in SSR environment unless injecting document!
    // console.log('copy clicked', element);
    element.select();
    document.execCommand('copy');
    element.setSelectionRange(0, 0);
    this.alertService.alert('auto-close', 'Copied!', 'Link copied to clipboard.');
  }

}
