import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-coach-service',
  templateUrl: 'edit.coach.service.component.html'
})
export class EditCoachServiceComponent implements OnInit {

  public browser: boolean;

  public isNewService: boolean;
  public service: CoachingService;

  public serviceForm: FormGroup;

  public objKeys = Object.keys;

  public focus: boolean;
  public focusTouched: boolean;

  public titleMinLength = 10;
  public titleMaxLength = 60;
  public titleActualLength = 0;

  public errorMessages = {
    title: {
      minlength: `Your title should be at least ${this.titleMinLength} characters.`,
      maxlength: `Your title should be at less than ${this.titleMaxLength} characters.`
    }
  };

  public saving: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private route: ActivatedRoute,
    private router: Router,
    public formBuilder: FormBuilder
  ) {}

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildServiceForm();

      if (this.router.url.includes('new')) {
        this.isNewService = true;
      } else {
        this.route.params.subscribe(p => {
          if (p.id) {
            console.log(p.id);
          }
        });
      }
    }

  }

  buildServiceForm() {
    this.serviceForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]]
    });
  }

  get serviceF(): any {
    return this.serviceForm.controls;
  }

  showError(control: string, error: string) {
    if (this.errorMessages[control][error]) {
      return this.errorMessages[control][error];
    }
    return 'Invalid input';
  }

  onTitleInput(ev: any) {
    this.titleActualLength = (ev.target.value as string).length;
  }

  onSubmit() {
    //
  }

}
