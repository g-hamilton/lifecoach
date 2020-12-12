import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import * as algoliasearch from 'algoliasearch/lite';

import { DataService } from '../../services/data.service';
import {environment} from '../../../environments/environment';

const searchClient = algoliasearch(
    environment.algoliaApplicationID,
    environment.algoliaApiKey
);

@Component({
  selector: 'app-admin-users',
  templateUrl: 'admin.users.component.html'
})
export class AdminUsersComponent implements OnInit {

    public browser: boolean;
    public userId: string;
    public aisConfig = {
        indexName: 'prod_USERS',
        searchClient
    };

    constructor(
        @Inject(DOCUMENT) private document: any,
        @Inject(PLATFORM_ID) private platformId: object,
        private dataService: DataService,
        private router: Router
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.browser = true;
        }
    }

    timestampToDate(timestamp: number) {
        // Convert unix timestamp (epoch) to date string
        return new Date(timestamp * 1000).toDateString();
    }

    viewPublicProfile(uid: string) {
        this.router.navigate(['coach', uid]);
    }

    manageUser(uid: string) {
        this.router.navigate(['admin-manage-user', uid]);
    }

}
