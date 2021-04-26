import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import * as algoliasearch from 'algoliasearch';
import { isPlatformBrowser } from '@angular/common';

import { AnalyticsService } from './analytics.service';
import {environment} from '../../environments/environment';
import { SearchCoachesRequest } from 'app/interfaces/search.coaches.request.interface';
import { I } from '@angular/cdk/keycodes';



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
    this.searchClient = algoliasearch(environment.algoliaApplicationID, environment.algoliaApiKey, { protocol: 'https:' });
  }

  // ================================================================================
  // =====                         SEARCHING COACHES                           ======
  // ================================================================================

  private buildAlgoliaCoachFilters(filters: any) {
    // console.log('FILTERS:', filters);
    /*
    Accepts a facets object containing search filters.
    Builds and returns a 'filters' query string from that object using Algolia rules.
    https://www.algolia.com/doc/api-reference/api-parameters/filters/
    We should end up with a string like:
    'category:business&career'
    */
    const andArray = [];
    const orArray = [];

    if (filters.category) {
      andArray.push(`speciality1.itemName:'${filters.category}'`);
    }
    if (filters.gender) {
      andArray.push(`gender:'${filters.gender}'`);
    }
    if (filters.country) {
      andArray.push(`country.name:'${filters.country}'`);
    }
    if (filters.city) {
      andArray.push(`city:'${filters.city}'`);
    }
    if (filters.accountType) {
      andArray.push(`accountType:'${filters.accountType}'`);
    }
    if (filters.showCertified) {
      andArray.push(`(qualAcc:true OR qualPcc:true OR qualMcc:true OR qualEmccFoundation:true OR qualEmccPractitioner:true OR qualEmccSeniorPractitioner:true OR qualEmccMasterPractitioner:true OR qualAcFoundation:true OR qualAcCoach:true OR qualAcProfessionalCoach:true OR qualAcMasterCoach:true OR qualApecsAssociate:true OR qualApecsProfessional:true OR qualApecsMaster:true)`);
    }
    if (filters.icf) {
      andArray.push(`(qualAcc:true OR qualPcc:true OR qualMcc:true)`);
    }
    if (filters.emcc) {
      andArray.push(`(qualEmccFoundation:true OR qualEmccPractitioner:true OR qualEmccSeniorPractitioner:true OR qualEmccMasterPractitioner:true)`);
    }
    if (filters.ac) {
      andArray.push(`(qualAcFoundation:true OR qualAcCoach:true OR qualAcProfessionalCoach:true OR qualAcMasterCoach:true)`);
    }
    if (filters.apecs) {
      andArray.push(`(qualApecsAssociate:true OR qualApecsProfessional:true OR qualApecsMaster:true)`);
    }
    if (filters.foundation) {
      orArray.push(`(qualAcc:true OR qualEmccFoundation:true OR qualAcFoundation:true OR qualApecsAssociate:true)`);
    }
    if (filters.experienced) {
      orArray.push(`(qualPcc:true OR qualEmccPractitioner:true OR qualAcCoach:true OR qualAcProfessionalCoach:true OR qualApecsProfessional:true)`);
    }
    if (filters.master) {
      orArray.push(`(qualMcc:true OR qualEmccMasterPractitioner:true OR qualAcMasterCoach:true OR qualApecsMaster:true)`);
    }

    // console.log('AND array', andArray);
    // console.log('OR Array', orArray);

    const builtAndString = andArray.join(' AND ');
    const builtOrString = orArray.join(' OR ');

    if (builtAndString.length && builtOrString.length) {
      return `${builtAndString} AND ${builtOrString}`;
    } else if (builtAndString.length && !builtOrString.length) {
      return builtAndString;
    } else if (!builtAndString.length && builtOrString.length) {
      return builtOrString;
    }
    return '';
  }

  private recordCoachesSearch(request: any) {
    this.analyticsService.searchCoaches(request);
  }

  async searchCoaches(req: SearchCoachesRequest) {
    // console.log('search coaches request:', req);

    // Init search index & default params
    const searchIndex = 'prod_COACHES';
    const index = this.searchClient.initIndex(searchIndex);

    const params: algoliasearch.QueryParameters = {
      query: req.q ? req.q : '',
      hitsPerPage: req.hitsPerPage ? req.hitsPerPage : 6,
      page: req.page ? req.page - 1 : 0, // because Algolia is zero indexed but we always start at 1
      filters: this.buildAlgoliaCoachFilters(req) // can be empty string but NOT null/undefined!
    };

    // do we want to extend the search query string?
    if (req.goals) {
      if (Array.isArray(req.goals)) {
        req.goals.forEach(element => {
          params.query = params.query.concat(` ${element}`);
        });
      } else {
        params.query = params.query.concat(` ${req.goals}`);
      }
    }
    if (req.challenges) {
      if (Array.isArray(req.challenges)) {
        req.challenges.forEach(element => {
          params.query = params.query.concat(` ${element}`);
        });
      } else {
        params.query = params.query.concat(` ${req.challenges}`);
      }
    }

    // remove any duplicate words from the query string prior to asking for results
    params.query = params.query.trim().toLowerCase();
    params.query = [...new Set(params.query.split(' '))].join(' ');

    // console.log('Algolia query params constructed:', params);

    try {
      // Record the search if we're in the browser (not SSR)
      if (isPlatformBrowser(this.platformId)) {
        this.recordCoachesSearch(req);
      }

      // Run the search
      const res = await index.search(params);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  async searchCoachCountries(query: string, filters: any) {
    // console.log('searchCoachCountries Filters:', filters);

    // delete own key
    const filtersCopy = Object.assign({}, filters);
    if (filtersCopy.country) {
      delete filtersCopy.country;
    }
    // delete city key as this is not backwards filtered
    if (filtersCopy.city) {
      delete filtersCopy.city;
    }

    // Init search index & default params
    const searchIndex = 'prod_COACHES';
    const params: algoliasearch.SearchForFacetValues.Parameters = {
      facetName: 'country.name',
      filters: filters ? this.buildAlgoliaCoachFilters(filtersCopy) : null,
      facetQuery: query ? query : ''
    };

    // delete null/undefined keys as they will break the search
    if (!params.filters) {
      delete params.filters;
    }

    // console.log('searchCoachCountries params:', params);

    // Run the search
    try {
      const res = await this.searchClient.searchForFacetValues([{indexName: searchIndex, params}]);
      // console.log('Algolia search countries response:', res);
      return res;

    } catch (err) {
      console.error(err);
    }

  }

  async searchCoachCities(query: string, filters: any) {
    // console.log('searchCoachCities Filters:', filters);

    // delete own key
    const filtersCopy = Object.assign({}, filters);
    if (filtersCopy.city) {
      delete filtersCopy.city;
    }

    // Init search index & default params
    const searchIndex = 'prod_COACHES';
    const params: algoliasearch.SearchForFacetValues.Parameters = {
      facetName: 'city',
      filters: filters ? this.buildAlgoliaCoachFilters(filtersCopy) : null,
      facetQuery: query ? query : ''
    };

    // console.log('searchCoachCities params:', params);

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
      // Record the search if we're in the browser (not SSR)
      if (isPlatformBrowser(this.platformId)) {
        const p = (filters && filters.params) ? filters.params : null;
        this.recordProgramsSearch(p, params.query);
      }
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

  // ================================================================================
  // =====                         SEARCHING SERVICES                          ======
  // ================================================================================

  private buildAlgoliaServiceFilters(filters: any) {
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

  private recordServicesSearch(filters: any, query?: string) {
    this.analyticsService.searchServices(filters, query);
  }

  async searchServices(hitsPerPage?: number, page?: number, filters?: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_SERVICES';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
      hitsPerPage: hitsPerPage ? hitsPerPage : 6,
      page: page ? page - 1 : 0, // because Algolia is zero indexed but we always start at 1
      filters: filters ? this.buildAlgoliaServiceFilters(filters) : ''
    };
    // console.log('Algolia query params constructed:', params);

    try {
      // Record the search if we're in the browser (not SSR)
      if (isPlatformBrowser(this.platformId)) {
        const p = (filters && filters.params) ? filters.params : null;
        this.recordServicesSearch(p, params.query);
      }
      // Run the search
      const res = await index.search(params);
      // console.log('Algolia search hit results:', res);
      return res;

    } catch (err) {
      console.error(err);
    }
  }

  async searchDraftServices(hitsPerPage?: number, page?: number, filters?: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_DRAFT_SERVICES';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: (filters && filters.params && filters.params.q) ? filters.params.q : '',
      hitsPerPage: hitsPerPage ? hitsPerPage : 6,
      page: page ? page - 1 : 0, // because Algolia is zero indexed but we always start at 1
      filters: filters ? this.buildAlgoliaServiceFilters(filters) : ''
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

  private buildAlgoliaServiceRefundRequestFilters(facets: any) {
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

  async searchServiceRefundRequests(hitsPerPage: number, page: number, filters: any) {
    // console.log('filters:', filters);

    // Init search index & default params
    const searchIndex = 'prod_REFUNDS';
    const index = this.searchClient.initIndex(searchIndex);
    const params: algoliasearch.QueryParameters = {
      query: filters.query ? filters.query : '',
      hitsPerPage,
      page: page - 1, // because Algolia is zero indexed but we always start at 1
      filters: filters.facets ? this.buildAlgoliaServiceRefundRequestFilters(filters.facets) : ''
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
