import { Component, OnInit, Inject, PLATFORM_ID, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { UserAccount } from 'app/interfaces/user.account.interface';
import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-new-program',
  templateUrl: './new-program.component.html',
  styleUrls: ['./new-program.component.scss']
})
export class NewProgramComponent implements OnInit {

  @Input() userId: string;
  @Input() account: UserAccount;

  public browser: boolean;

  public newProgramForm: FormGroup;

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

  public objKeys = Object.keys;

  constructor(
    @Inject(PLATFORM_ID) public platformId: object,
    public formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.buildCourseForm();
    }
  }

  buildCourseForm() {
    this.newProgramForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(this.titleMinLength), Validators.maxLength(this.titleMaxLength)]]
    });
  }

  get programF(): any {
    return this.newProgramForm.controls;
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

  async onSubmit() {
    // Safety checks
    if (this.newProgramForm.invalid) {
      this.alertService.alert('warning-message', 'Oops', 'Invalid form.');
      return;
    }
    if (!this.userId) {
      this.alertService.alert('warning-message', 'Oops', 'Missing UID.');
      return;
    }
    if (!this.account) {
      this.alertService.alert('warning-message', 'Oops', 'Missing account data.');
      return;
    }

    // Prepare the new program object
    const programId = Math.random().toString(36).substr(2, 9); // generate semi-random id
    const newProgram = {
      programId,
      sellerUid: this.userId,
      stripeId: this.account.stripeUid ? this.account.stripeUid : null,
      title: this.programF.title.value,
    } as CoachingProgram;

    // Save the new program to the db
    await this.dataService.savePrivateProgram(this.userId, newProgram);

    // Navigate to continue
    this.router.navigate(['/my-programs', programId, 'content'], { queryParams: { targetUser: this.userId }});
  }

}
