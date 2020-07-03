import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { CloudFunctionsService } from 'app/services/cloud-functions.service';
import { AlertService } from 'app/services/alert.service';

@Component({
  selector: 'app-admin-special-ops',
  templateUrl: 'admin-special-ops.component.html'
})
export class AdminSpecialOpsComponent implements OnInit {

    public browser: boolean;

    public runningProfileUpdate: boolean;

    constructor(
        @Inject(PLATFORM_ID) private platformId: object,
        private cloudFunctionsService: CloudFunctionsService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
        }
    }

    async triggerServerSideProfileUpdateInSequence() {
        this.runningProfileUpdate = true;
        const res = await this.cloudFunctionsService.adminTriggerAllProfilesUpdateInSequence() as any;
        if (res.success) {
            this.alertService.alert('success-message', 'Success!', res.message);
        } else if (res.error) {
            this.alertService.alert('warning-message', 'Oops!', res.error);
        }
        this.runningProfileUpdate = false;
    }

}
