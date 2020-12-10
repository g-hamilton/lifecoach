import { Component, OnInit, Input, Inject, PLATFORM_ID, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from 'app/services/alert.service';
import { isPlatformBrowser } from '@angular/common';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';

@Component({
  selector: 'app-program-promote',
  templateUrl: './program-promote.component.html',
  styleUrls: ['./program-promote.component.scss']
})
export class ProgramPromoteComponent implements OnInit, OnChanges {

  @Input() userId: string;
  @Input() program: CoachingProgram;

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
    if (this.userId && this.program) {
      const baseUrl = `https://lifecoach.io/programs/${this.program.programId}/`;
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
