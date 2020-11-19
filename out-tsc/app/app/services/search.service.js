var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import * as algoliasearch from 'algoliasearch';
import { isPlatformBrowser } from '@angular/common';
import { AnalyticsService } from './analytics.service';
import { environment } from '../../environments/environment';
/*
  https://www.algolia.com/doc/api-reference/api-parameters/
*/
let SearchService = class SearchService {
    constructor(platformId, analyticsService) {
        this.platformId = platformId;
        this.analyticsService = analyticsService;
        this.searchClient = algoliasearch(environment.algoliaApplicationID, environment.apiKey, { protocol: 'https:' });
    }
    // ================================================================================
    // =====                         SEARCHING COACHES                           ======
    // ================================================================================
    buildAlgoliaCoachFilters(filters) {
        /*
        Accepts an object containing search filters that we capture from the route params, eg:
        {"0":"category","params":{"category":"business&career"}}
        Builds and returns a 'filters' query string from that object using Algolia rules.
        https://www.algolia.com/doc/api-reference/api-parameters/filters/
        We should end up with a string like:
        'category:business&career'
        */
        const andArray = [];
        for (const p of Object.keys(filters.params)) {
            // Map each param to an Algolia defined facet in the relevant index
            let facetKey;
            const str = filters.params[p];
            if (p === 'category') {
                facetKey = 'speciality1.itemName';
            }
            if (p === 'country') {
                facetKey = 'country.name';
            }
            if (p === 'city') {
                facetKey = 'city';
            }
            if (p === 'accountType') {
                facetKey = 'accountType';
            }
            if (p !== 'page' && p !== 'q') { // skip the query & page params as we deal with them higher up
                // Add facet to the AND array
                andArray.push(`${facetKey}:'${str}'`);
            }
        }
        const builtAndString = andArray.join(' AND ');
        // console.log('Algolia filters string constructed:', builtAndString);
        return builtAndString;
    }
    recordCoachesSearch(filters, query) {
        this.analyticsService.searchCoaches(filters, query);
    }
    searchCoaches(hitsPerPage, page, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('filters:', filters);
            // Init search index & default params
            const searchIndex = 'prod_COACHES';
            const index = this.searchClient.initIndex(searchIndex);
            const params = {
                query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
                hitsPerPage: hitsPerPage ? hitsPerPage : 6,
                page: page ? page - 1 : 0,
                filters: filters ? this.buildAlgoliaCoachFilters(filters) : ''
            };
            console.log('Algolia query params constructed:', params);
            try {
                // Record the search if we're in the browser (not SSR)
                if (isPlatformBrowser(this.platformId)) {
                    const p = (filters && filters.params) ? filters.params : null;
                    this.recordCoachesSearch(p, params.query);
                }
                // Run the search
                const res = yield index.search(params);
                return res;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    searchCoachCountries(category) {
        return __awaiter(this, void 0, void 0, function* () {
            // Init search index & default params
            const searchIndex = 'prod_COACHES';
            const params = {
                facetName: 'country.name',
                facetFilters: category ? [`speciality1.itemName:${category}`] : null,
                facetQuery: ''
            };
            // Run the search
            try {
                const res = yield this.searchClient.searchForFacetValues([{ indexName: searchIndex, params }]);
                // console.log('Algolia search countries response:', res);
                return res;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    searchCoachCities(category, countryName, query) {
        return __awaiter(this, void 0, void 0, function* () {
            // Init search index & default params
            const searchIndex = 'prod_COACHES';
            const filters = [];
            if (category) {
                filters.push(`speciality1.itemName:${category}`);
            }
            if (countryName) {
                filters.push(`country.name:${countryName}`);
            }
            const params = {
                facetName: 'city',
                facetFilters: filters,
                facetQuery: '',
                query: query ? query : ''
            };
            // Run the search
            try {
                const res = yield this.searchClient.searchForFacetValues([{ indexName: searchIndex, params }]);
                // console.log('Algolia search cities response:', res);
                return res;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    // ================================================================================
    // =====                         SEARCHING USERS                             ======
    // ================================================================================
    buildAlgoliaUserFilters(filters) {
        /*
        Accepts an object containing search filters that we capture from the route params, eg:
        {"0":"category","params":{"category":"business&career"}}
        Builds and returns a 'filters' query string from that object using Algolia rules.
        https://www.algolia.com/doc/api-reference/api-parameters/filters/
        We should end up with a string like:
        'category:business&career'
        */
        const andArray = [];
        for (const p of Object.keys(filters.params)) {
            // Map each param to an Algolia defined facet in the relevant index
            let facetKey;
            const str = filters.params[p];
            if (p === 'accountType') {
                facetKey = 'accountType';
            }
            if (p !== 'page' && p !== 'q') { // skip the query & page params as we deal with them higher up
                // Add facet to the AND array
                andArray.push(`${facetKey}:'${str}'`);
            }
        }
        const builtAndString = andArray.join(' AND ');
        // console.log('Algolia filters string constructed:', builtAndString);
        return builtAndString;
    }
    searchUsers(hitsPerPage, page, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('filters:', filters);
            // Init search index & default params
            const searchIndex = 'prod_USERS';
            const index = this.searchClient.initIndex(searchIndex);
            const params = {
                query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
                hitsPerPage: hitsPerPage ? hitsPerPage : 6,
                page: page ? page - 1 : 0,
                filters: filters ? this.buildAlgoliaUserFilters(filters) : ''
            };
            // console.log('Algolia query params constructed:', params);
            try {
                // Record the search if we're in the browser (not SSR)
                if (isPlatformBrowser(this.platformId)) {
                    const p = (filters && filters.params) ? filters.params : null;
                    this.recordCoursesSearch(p, params.query);
                }
                // Run the search
                const res = yield index.search(params);
                // console.log('Algolia search hit results:', res);
                return res;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    // ================================================================================
    // =====                         SEARCHING COURSES                           ======
    // ================================================================================
    buildAlgoliaCourseFilters(filters, includeTestData) {
        /*
        Accepts an object containing search filters that we capture from the route params, eg:
        {"0":"category","params":{"category":"business&career"}}
        Builds and returns a 'filters' query string from that object using Algolia rules.
        https://www.algolia.com/doc/api-reference/api-parameters/filters/
        We should end up with a string like:
        'category:business&career'
        */
        const andArray = [];
        if (filters && filters.params) {
            for (const p of Object.keys(filters.params)) {
                // Map each param to an Algolia defined facet in the relevant index
                let facetKey;
                const str = filters.params[p];
                if (p === 'category') {
                    facetKey = 'category';
                }
                if (p !== 'page' && p !== 'q') { // skip the query & page params as we deal with them higher up
                    // Add facet to the AND array
                    andArray.push(`${facetKey}:'${str}'`);
                }
            }
        }
        // *** FOR TESTING ***
        if (!includeTestData) {
            andArray.push(`isTest:false`); // excludes all test data (production). Otherwise allows a mix of real & test data.
        }
        const builtAndString = andArray.join(' AND ');
        // console.log('Algolia filters string constructed:', builtAndString);
        return builtAndString;
    }
    recordCoursesSearch(filters, query) {
        this.analyticsService.searchCourses(filters, query);
    }
    searchCourses(hitsPerPage, page, filters, includeTestData) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('filters:', filters);
            // Init search index & default params
            const searchIndex = 'prod_COURSES';
            const index = this.searchClient.initIndex(searchIndex);
            const params = {
                query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
                hitsPerPage: hitsPerPage ? hitsPerPage : 6,
                page: page ? page - 1 : 0,
                filters: filters ? this.buildAlgoliaCourseFilters(filters, includeTestData) : ''
            };
            // console.log('Algolia query params constructed:', params);
            try {
                // Run the search
                const res = yield index.search(params);
                // console.log('Algolia search hit results:', res);
                return res;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    searchDraftCourses(hitsPerPage, page, filters, includeTestData) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('filters:', filters);
            // Init search index & default params
            const searchIndex = 'prod_DRAFT_COURSES';
            const index = this.searchClient.initIndex(searchIndex);
            const params = {
                query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
                hitsPerPage: hitsPerPage ? hitsPerPage : 6,
                page: page ? page - 1 : 0,
                filters: filters ? this.buildAlgoliaCourseFilters(filters, includeTestData) : ''
            };
            // console.log('Algolia query params constructed:', params);
            try {
                // Run the search
                const res = yield index.search(params);
                // console.log('Algolia search hit results:', res);
                return res;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    // ================================================================================
    // =====                      SEARCHING COURSE REVIEWS                       ======
    // ================================================================================
    buildAlgoliaCourseReviewFilters(facets) {
        /*
        Accepts an object containing search filters, eg.
        { courseId: abc, starValue: 5 }
        Builds and returns a 'filters' query string from that object using Algolia rules.
        https://www.algolia.com/doc/api-reference/api-parameters/filters/
        We should end up with a string like:
        'courseId:abc AND starValue:5'
        */
        const andArray = [];
        Object.keys(facets).forEach(key => {
            andArray.push(`${key}:${facets[key]}`);
        });
        const builtAndString = andArray.join(' AND ');
        // console.log('Algolia filters string constructed:', builtAndString);
        return builtAndString;
    }
    searchCourseReviews(hitsPerPage, page, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('filters:', filters);
            // Init search index & default params
            const searchIndex = 'prod_COURSE_REVIEWS';
            const index = this.searchClient.initIndex(searchIndex);
            const params = {
                query: filters.query ? filters.query : '',
                hitsPerPage,
                page: page - 1,
                filters: filters.facets ? this.buildAlgoliaCourseReviewFilters(filters.facets) : ''
            };
            // console.log('Algolia query params constructed:', params);
            try {
                // Run the search
                const res = yield index.search(params);
                // console.log('Algolia search hit results:', res);
                return res;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    // ================================================================================
    // =====                      SEARCHING COURSE QUESTIONS                     ======
    // ================================================================================
    buildAlgoliaCourseQuestionFilters(facets) {
        /*
        Accepts an object containing search filters, eg.
        { courseId: abc, lectureId: xyz }
        Builds and returns a 'filters' query string from that object using Algolia rules.
        https://www.algolia.com/doc/api-reference/api-parameters/filters/
        We should end up with a string like:
        'courseId:abc AND lectureId:xyz'
        */
        const andArray = [];
        Object.keys(facets).forEach(key => {
            andArray.push(`${key}:${facets[key]}`);
        });
        const builtAndString = andArray.join(' AND ');
        // console.log('Algolia filters string constructed:', builtAndString);
        return builtAndString;
    }
    searchCourseQuestions(hitsPerPage, page, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('filters:', filters);
            // Init search index & default params
            const searchIndex = 'prod_COURSE_QUESTIONS';
            const index = this.searchClient.initIndex(searchIndex);
            const params = {
                query: filters.query ? filters.query : '',
                hitsPerPage,
                page: page - 1,
                filters: filters.facets ? this.buildAlgoliaCourseQuestionFilters(filters.facets) : ''
            };
            // console.log('Algolia query params constructed:', params);
            try {
                // Run the search
                const res = yield index.search(params);
                // console.log('Algolia search hit results:', res);
                return res;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    // ================================================================================
    // =====                    SEARCHING COURSE REFUND REQUESTS                 ======
    // ================================================================================
    buildAlgoliaCourseRefundRequestFilters(facets) {
        /*
        Accepts an object containing search filters, eg.
        { courseId: abc, lectureId: xyz }
        Builds and returns a 'filters' query string from that object using Algolia rules.
        https://www.algolia.com/doc/api-reference/api-parameters/filters/
        We should end up with a string like:
        'courseId:abc AND lectureId:xyz'
        */
        const andArray = [];
        Object.keys(facets).forEach(key => {
            andArray.push(`${key}:${facets[key]}`);
        });
        const builtAndString = andArray.join(' AND ');
        // console.log('Algolia filters string constructed:', builtAndString);
        return builtAndString;
    }
    searchCourseRefundRequests(hitsPerPage, page, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('filters:', filters);
            // Init search index & default params
            const searchIndex = 'prod_REFUNDS';
            const index = this.searchClient.initIndex(searchIndex);
            const params = {
                query: filters.query ? filters.query : '',
                hitsPerPage,
                page: page - 1,
                filters: filters.facets ? this.buildAlgoliaCourseQuestionFilters(filters.facets) : ''
            };
            // console.log('Algolia query params constructed:', params);
            try {
                // Run the search
                const res = yield index.search(params);
                // console.log('Algolia search hit results:', res);
                return res;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    // ================================================================================
    // =====                    SEARCHING COACH LEADS (CHATROOMS)                ======
    // ================================================================================
    buildAlgoliaCoachLeadFilters(facets) {
        /*
        Accepts an object containing search filters, eg.
        { courseId: abc, lectureId: xyz }
        Builds and returns a 'filters' query string from that object using Algolia rules.
        https://www.algolia.com/doc/api-reference/api-parameters/filters/
        We should end up with a string like:
        'courseId:abc AND lectureId:xyz'
        */
        const andArray = [];
        Object.keys(facets).forEach(key => {
            andArray.push(`${key}:${facets[key]}`);
        });
        const builtAndString = andArray.join(' AND ');
        // console.log('Algolia filters string constructed:', builtAndString);
        return builtAndString;
    }
    searchCoachLeads(hitsPerPage, page, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('filters:', filters);
            // Init search index & default params
            const searchIndex = 'prod_LEADS';
            const index = this.searchClient.initIndex(searchIndex);
            const params = {
                query: filters.query ? filters.query : '',
                hitsPerPage,
                page: page - 1,
                filters: filters.facets ? this.buildAlgoliaCoachLeadFilters(filters.facets) : ''
            };
            // console.log('Algolia query params constructed:', params);
            try {
                // Run the search
                const res = yield index.search(params);
                // console.log('Algolia search hit results:', res);
                return res;
            }
            catch (err) {
                console.error(err);
            }
        });
    }
};
SearchService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __param(0, Inject(PLATFORM_ID)),
    __metadata("design:paramtypes", [Object, AnalyticsService])
], SearchService);
export { SearchService };
//# sourceMappingURL=search.service.js.map