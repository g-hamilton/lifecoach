import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { SearchService } from 'app/services/search.service';

@Component({
  selector: 'app-search-filter-ui',
  templateUrl: './search-filter-ui.component.html',
  styleUrls: ['./search-filter-ui.component.scss']
})
export class SearchFilterUiComponent implements OnInit {

  @Output() messageEventCountries = new EventEmitter<any>();
  @Output() messageEventCities = new EventEmitter<any>();

  public searchTerm: string;
  public filters: any;
  public dataForm: FormGroup;

  public coachCountries = [];
  public coachCities = [];
  public specialitiesList = [
    { itemName: 'Business & Career' },
    { itemName: 'Health, Fitness & Wellness' },
    { itemName: 'Relationship' },
    { itemName: 'Money & Financial' },
    { itemName: 'Family' },
    { itemName: 'Religion & Faith' },
    { itemName: 'Retirement' },
    { itemName: 'Transformation & Mindset' },
    { itemName: 'Relocation' },
    { itemName: 'Academic' },
    { itemName: 'Holistic' },
    { itemName: 'Productivity & Personal Organisation' }
  ];

  public focus: boolean;
  public focusTouched: boolean;

  public numGoals = 0;
  public goalsIsCollapsed = true;
  public goalOptions = ['Becoming a Better Leader', 'Growing Your Influence', 'Building Confidence', 'Developing Self-Awareness',
  'Recovering from Injury', 'Creating Better Habits', 'Achieving Your Goals', 'Better Time-Management', 'Finding Your Purpose', 'Increasing Your Energy',
  'Teamwork', 'Determination', 'Managing Finances', 'Deeper Sleep', 'Forgiveness',
  'Healing From Trauma', 'Long-Term Planning', 'Overcoming Fear & Anxiety', 'Finding Clarity', 'Defining Your Vision',
  'Moving Past Pain', 'Focus', 'Building Resilience to Stress', 'Authenticity', 'Improved Flexibility', 'Self-Acceptance', 'Love',
  'Stronger Relationships', 'Renewing Your Passion', 'Inspiring Others', 'Emotional Intelligence', 'Positive Thinking',
  'Better Ageing', 'Deeper Meditation', 'Athletic Performance', 'Healthier Immune System', 'Achieving More',
  'Emotional Balance', 'Getting Fit', 'Improving Your Posture', 'Resistance to Overwhelm', 'Finding Inner Peace'];

  public numChallenges = 0;
  public challengesIsCollapsed = true;
  public challengeOptions = ['financial crisis', 'health crisis', 'difficult relationship', 'personal conflict', 'career pressure',
  'unfair treatment', 'emptiness', 'boredom', 'confusion', 'friendship struggles', 'jealousy', 'physical pain', 'emotional pain',
  'stress', 'anxiety', 'haunting past', 'failure', 'insecurity', 'feeling unsafe', 'forgiveness', 'lack of knowledge',
  'understanding', 'loss', 'grief', 'complexity', 'citicism', 'redundancy', 'bankruptcy', 'making mistakes', 'breakup',
  'low confidence', 'embarassment', 'low self-esteem', 'dark thoughts', 'fear', 'staying on track', 'too many options',
  'finding the time', 'not sure how to plan', 'giving up', 'poor self-awareness'];

  public experienceIsCollapsed = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    public formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.buildDataForm();
    // Check activated route query params
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.filters = {...params.keys, ...params};
        console.log('Navigator filters updated:', this.filters);
        // When route params change, update the UI with relevant data
        this.updateUI();
      }
    });
  }

  buildDataForm() {
    this.dataForm = this.formBuilder.group({
      goals: [[]], // init with an empty array
      challenges: [[]], // init with an empty array
      showCertified: [false],
      anyCert: [null],
      icf: [null],
      emcc: [null],
      ac: [null],
      anyExp: [null],
      foundation: [null],
      experienced: [null],
      master: [null],
      gender: ['any'],
      category: [null],
      country: [null],
      city: [null]
    });
  }

  updateUI() {
    // update search term value
    if (this.filters.q) {
      this.searchTerm = this.filters.q; // note: searchTerm is deliberately not part of the form!
    }
    // update form & component values
    if (this.filters.goals) { // note: may be string or array of strings
      if (Array.isArray(this.filters.goals)) {
        this.numGoals = this.filters.goals.length;
        this.dataForm.patchValue({ goals: this.filters.goals});
      } else {
        this.numGoals = 1;
        this.dataForm.patchValue({ goals: [this.filters.goals]});
      }
    } else {
      this.numGoals = 0;
    }
    if (this.filters.challenges) { // note: may be string or array of strings
      if (Array.isArray(this.filters.challenges)) {
        this.numChallenges = this.filters.challenges.length;
        this.dataForm.patchValue({ challenges: this.filters.challenges});
      } else {
        this.numChallenges = 1;
        this.dataForm.patchValue({ challenges: [this.filters.challenges]});
      }
    } else {
      this.numChallenges = 0;
    }
    if (this.filters.showCertified) {
      this.dataForm.patchValue({ showCertified: this.filters.showCertified === 'true' ? true : false  });
      this.onCertifiedChange();
    }
    if (this.filters.anyCert) {
      this.dataForm.patchValue({ anyCert: this.filters.anyCert });
    }
    if (this.filters.icf) {
      this.dataForm.patchValue({ icf: this.filters.icf });
    }
    if (this.filters.emcc) {
      this.dataForm.patchValue({ emcc: this.filters.emcc });
    }
    if (this.filters.ac) {
      this.dataForm.patchValue({ ac: this.filters.ac });
    }
    if (this.filters.anyExp) {
      this.dataForm.patchValue({ anyExp: this.filters.anyExp });
    }
    if (this.filters.foundation) {
      this.dataForm.patchValue({ foundation: this.filters.foundation });
    }
    if (this.filters.experienced) {
      this.dataForm.patchValue({ experienced: this.filters.experienced });
    }
    if (this.filters.master) {
      this.dataForm.patchValue({ master: this.filters.master });
    }
    if (this.filters.gender) {
      this.dataForm.patchValue({ gender: this.filters.gender });
    }
    if (this.filters.category) {
      let cat = this.filters.category;
      cat = cat.toLowerCase()
      .split(' ')
      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
      .join(' '); // convert to title case
      this.dataForm.patchValue({ category: cat });
    }
    if (this.filters.country) {
      this.dataForm.patchValue({ country: this.filters.country });
      this.loadCoachCities(); // load city options when country selected
    }
    console.log('this.filters', this.filters);
    if (this.filters.city) {
      this.dataForm.patchValue({ city: this.filters.city });
    }
    // load country options
    this.loadCoachCountries();
  }

  async loadCoachCountries() {
    this.coachCountries = [];
    const res = await this.searchService.searchCoachCountries(this.searchTerm, this.filters);
    // console.log(res);
    const hits = res[0].facetHits;
    hits.forEach(hit => {
      this.coachCountries.push({
        itemName: hit.value,
        itemCount: hit.count
      });
    });
    this.messageEventCountries.emit(this.coachCountries);
  }

  async loadCoachCities() {
    this.coachCities = [];
    const res = await this.searchService.searchCoachCities(this.searchTerm, this.filters);
    // console.log(res);
    const hits = res[0].facetHits;
    hits.forEach(hit => {
      this.coachCities.push({
        itemName: hit.value,
        itemCount: hit.count
      });
    });
    this.messageEventCities.emit(this.coachCities);
  }

  toggleGoals() {
    if (!this.challengesIsCollapsed) {
      this.challengesIsCollapsed = true;
      setTimeout(() => {
        this.goalsIsCollapsed = !this.goalsIsCollapsed;
      }, 1200);
      return;
    }
    this.goalsIsCollapsed = !this.goalsIsCollapsed;
  }

  toggleChallenges() {
    if (!this.goalsIsCollapsed) {
      this.goalsIsCollapsed = true;
      setTimeout(() => {
        this.challengesIsCollapsed = !this.challengesIsCollapsed;
      }, 1200);
      return;
    }
    this.challengesIsCollapsed = !this.challengesIsCollapsed;
  }

  onCertifiedChange() {
    const val = this.dataForm.controls.showCertified.value;
    if (val) {
      this.experienceIsCollapsed = false;
      return;
    }
    this.experienceIsCollapsed = true;
  }

  reset() {
    // todo
  }

  clearCity() {
    this.dataForm.patchValue({ city: null });
  }

  makeNewRequest() {
    const formData = this.dataForm.value;
    console.log(formData);

    // cleanup!
    const newParams = {};
    Object.keys(formData).forEach(key => {
      if (key) {
        if (!formData[key]) { // remove any null or undefined data
          return;
        }
        if (formData[key] === 'false') { // remove any string false
          return;
        }
        if (formData[key] === 'null') { // remove any string null
          return;
        }
        if (Array.isArray(formData[key]) && !formData[key].length) { // remove any empty arrays
          return;
        }
        if (key === 'anyExp') { // remove the anyExp key
          return;
        }
        if (key === 'gender' && formData[key] === 'any') { // remove any gender
          return;
        }
        newParams[key] = formData[key];
      }
    });
    console.log(newParams);
    this.router.navigate(['/coaches'], { queryParams: newParams });
  }

}
