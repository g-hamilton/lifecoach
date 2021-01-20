import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import * as algoliasearch from 'algoliasearch';
import { isPlatformBrowser } from '@angular/common';

import { AnalyticsService } from './analytics.service';
import {environment} from '../../environments/environment';



/*
  https://www.algolia.com/doc/api-reference/api-parameters/
*/

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private searchClient: algoliasearch.Client;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private analyticsService: AnalyticsService
  ) {
    this.searchClient = algoliasearch(environment.algoliaApplicationID, environment.algoliaApiKey, { protocol: 'https:' }); //work on test
    // this.searchClient = algoliasearch(environment.algoliaApplicationID, environment.apiKey, { protocol: 'https:' }); // work on prod
  }

  // ================================================================================
  // =====                         SEARCHING COACHES                           ======
  // ================================================================================

  private buildAlgoliaCoachFilters(filters: any) {
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
      let facetKey: string;
      const str: string = filters.params[p];
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

  private recordCoachesSearch(filters: any, query?: string) {
    this.analyticsService.searchCoaches(filters, query);
  }

  async searchCoaches(hitsPerPage?: number, page?: number, filters?: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_COACHES';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
      hitsPerPage: hitsPerPage ? hitsPerPage : 6,
      page: page ? page - 1 : 0, // because Algolia is zero indexed but we always start at 1
      filters: filters ? this.buildAlgoliaCoachFilters(filters) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Record the search if we're in the browser (not SSR)
      if (isPlatformBrowser(this.platformId)) {
        const p = (filters && filters.params) ? filters.params : null;
        this.recordCoachesSearch(p, params.query);
      }

      // Run the search
      const res = await index.search(params);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  async searchCoachCountries(category?: string) {

    // Init search index & default params
    const searchIndex = 'prod_COACHES';
    const params: algoliasearch.SearchForFacetValues.Parameters = {
      facetName: 'country.name',
      facetFilters: category ? [`speciality1.itemName:${category}`] : null,
      facetQuery: ''
    };

    // Run the search
    try {
      const res = await this.searchClient.searchForFacetValues([{indexName: searchIndex, params}]);
      // console.log('Algolia search countries response:', res);
      return res;

    } catch (err) {
      console.error(err);
    }

  }

  async searchCoachCities(category: string, countryName: string, query?: string) {

    // Init search index & default params
    const searchIndex = 'prod_COACHES';
    const filters = [];
    if (category) {
      filters.push(`speciality1.itemName:${category}`);
    }
    if (countryName) {
      filters.push(`country.name:${countryName}`);
    }
    const params: algoliasearch.SearchForFacetValues.Parameters = {
      facetName: 'city',
      facetFilters: filters,
      facetQuery: '',
      query: query ? query : ''
    };

    // Run the search
    try {
      const res = await this.searchClient.searchForFacetValues([{indexName: searchIndex, params}]);
      // console.log('Algolia search cities response:', res);
      return res;

    } catch (err) {
      console.error(err);
    }

  }

  // ================================================================================
  // =====                         SEARCHING USERS                             ======
  // ================================================================================

  private buildAlgoliaUserFilters(filters: any) {
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
      let facetKey: string;
      const str: string = filters.params[p];
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

  async searchUsers(hitsPerPage?: number, page?: number, filters?: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_USERS';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
      hitsPerPage: hitsPerPage ? hitsPerPage : 6,
      page: page ? page - 1 : 0, // because Algolia is zero indexed but we always start at 1
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
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  // ================================================================================
  // =====                         SEARCHING COURSES                           ======
  // ================================================================================

  private buildAlgoliaCourseFilters(filters: any) {
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
        let facetKey: string;
        const str: string = filters.params[p];
        if (p === 'category') {
          facetKey = 'category';
        }
        if (p !== 'page' && p !== 'q') { // skip the query & page params as we deal with them higher up
          // Add facet to the AND array
          andArray.push(`${facetKey}:'${str}'`);
        }
      }
    }

    const builtAndString = andArray.join(' AND ');
    // console.log('Algolia filters string constructed:', builtAndString);

    return builtAndString;
  }

  private recordCoursesSearch(filters: any, query?: string) {
    this.analyticsService.searchCourses(filters, query);
  }

  async searchCourses(hitsPerPage?: number, page?: number, filters?: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_COURSES';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
      hitsPerPage: hitsPerPage ? hitsPerPage : 6,
      page: page ? page - 1 : 0, // because Algolia is zero indexed but we always start at 1
      filters: filters ? this.buildAlgoliaCourseFilters(filters) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Run the search
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  async searchDraftCourses(hitsPerPage?: number, page?: number, filters?: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_DRAFT_COURSES';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
      hitsPerPage: hitsPerPage ? hitsPerPage : 6,
      page: page ? page - 1 : 0, // because Algolia is zero indexed but we always start at 1
      filters: filters ? this.buildAlgoliaCourseFilters(filters) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Run the search
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  // ================================================================================
  // =====                      SEARCHING COURSE REVIEWS                       ======
  // ================================================================================

  private buildAlgoliaCourseReviewFilters(facets: any) {
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

  async searchCourseReviews(hitsPerPage: number, page: number, filters: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_COURSE_REVIEWS';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: filters.query ? filters.query : '',
      hitsPerPage,
      page: page - 1, // because Algolia is zero indexed but we always start at 1
      filters: filters.facets ? this.buildAlgoliaCourseReviewFilters(filters.facets) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Run the search
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  // ================================================================================
  // =====                      SEARCHING COURSE QUESTIONS                     ======
  // ================================================================================

  private buildAlgoliaCourseQuestionFilters(facets: any) {
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

  async searchCourseQuestions(hitsPerPage: number, page: number, filters: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_COURSE_QUESTIONS';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: filters.query ? filters.query : '',
      hitsPerPage,
      page: page - 1, // because Algolia is zero indexed but we always start at 1
      filters: filters.facets ? this.buildAlgoliaCourseQuestionFilters(filters.facets) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Run the search
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  // ================================================================================
  // =====                    SEARCHING COURSE REFUND REQUESTS                 ======
  // ================================================================================

  private buildAlgoliaCourseRefundRequestFilters(facets: any) {
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

  async searchCourseRefundRequests(hitsPerPage: number, page: number, filters: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_REFUNDS';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: filters.query ? filters.query : '',
      hitsPerPage,
      page: page - 1, // because Algolia is zero indexed but we always start at 1
      filters: filters.facets ? this.buildAlgoliaCourseRefundRequestFilters(filters.facets) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Run the search
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  // ================================================================================
  // =====                    SEARCHING COACH LEADS (CHATROOMS)                ======
  // ================================================================================

  private buildAlgoliaCoachLeadFilters(facets: any) {
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

  async searchCoachLeads(hitsPerPage: number, page: number, filters: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_LEADS';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: filters.query ? filters.query : '',
      hitsPerPage,
      page: page - 1, // because Algolia is zero indexed but we always start at 1
      filters: filters.facets ? this.buildAlgoliaCoachLeadFilters(filters.facets) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Run the search
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  // ================================================================================
  // =====                         SEARCHING PROGRAMS                          ======
  // ================================================================================

  private buildAlgoliaProgramFilters(filters: any) {
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
        let facetKey: string;
        const str: string = filters.params[p];
        if (p === 'category') {
          facetKey = 'category';
        }
        if (p !== 'page' && p !== 'q') { // skip the query & page params as we deal with them higher up
          // Add facet to the AND array
          andArray.push(`${facetKey}:'${str}'`);
        }
      }
    }

    const builtAndString = andArray.join(' AND ');
    // console.log('Algolia filters string constructed:', builtAndString);

    return builtAndString;
  }

  private recordProgramsSearch(filters: any, query?: string) {
    this.analyticsService.searchPrograms(filters, query);
  }

  async searchPrograms(hitsPerPage?: number, page?: number, filters?: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_PROGRAMS';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
      hitsPerPage: hitsPerPage ? hitsPerPage : 6,
      page: page ? page - 1 : 0, // because Algolia is zero indexed but we always start at 1
      filters: filters ? this.buildAlgoliaProgramFilters(filters) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Run the search
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  async searchDraftPrograms(hitsPerPage?: number, page?: number, filters?: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_DRAFT_PROGRAMS';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
      hitsPerPage: hitsPerPage ? hitsPerPage : 6,
      page: page ? page - 1 : 0, // because Algolia is zero indexed but we always start at 1
      filters: filters ? this.buildAlgoliaProgramFilters(filters) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Run the search
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  // ================================================================================
  // =====                      SEARCHING PROGRAM REVIEWS                      ======
  // ================================================================================

  private buildAlgoliaProgramReviewFilters(facets: any) {
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

  async searchProgramReviews(hitsPerPage: number, page: number, filters: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_PROGRAM_REVIEWS';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: filters.query ? filters.query : '',
      hitsPerPage,
      page: page - 1, // because Algolia is zero indexed but we always start at 1
      filters: filters.facets ? this.buildAlgoliaProgramReviewFilters(filters.facets) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Run the search
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  // ================================================================================
  // =====                   SEARCHING PROGRAM REFUND REQUESTS                 ======
  // ================================================================================

  private buildAlgoliaProgramRefundRequestFilters(facets: any) {
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

  async searchProgramRefundRequests(hitsPerPage: number, page: number, filters: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_REFUNDS';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: filters.query ? filters.query : '',
      hitsPerPage,
      page: page - 1, // because Algolia is zero indexed but we always start at 1
      filters: filters.facets ? this.buildAlgoliaProgramRefundRequestFilters(filters.facets) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Run the search
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

}
