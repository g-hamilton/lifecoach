import { Component, OnInit, Input } from '@angular/core';

import { AlgoliaCoachProfile } from '../../interfaces/algolia.coach.profile';
import { CountryService } from 'app/services/country.service';
import { CoachingSpecialitiesService } from 'app/services/coaching.specialities.service';
import { EmojiCountry } from 'app/interfaces/emoji.country.interface';

/*
  This component shows a coach profile card in the view.
*/

@Component({
  selector: 'app-coach-card',
  templateUrl: './coach-card.component.html',
  styleUrls: ['./coach-card.component.scss']
})
export class CoachCardComponent implements OnInit {

  @Input() coachProfile: AlgoliaCoachProfile; // <-- Input the coach's profile

  public countryList = this.countryService.getCountryList();
  public specialityList = this.specialitiesService.getSpecialityList();

  constructor(
    private countryService: CountryService,
    private specialitiesService: CoachingSpecialitiesService
  ) { }

  ngOnInit() {
    // console.log(`Coach card component init with profile: ${JSON.stringify(this.coachProfile)}`);
  }

}
