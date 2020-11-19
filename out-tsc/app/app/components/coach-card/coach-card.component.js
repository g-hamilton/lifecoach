var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
import { CountryService } from 'app/services/country.service';
import { CoachingSpecialitiesService } from 'app/services/coaching.specialities.service';
/*
  This component shows a coach profile card in the view.
*/
let CoachCardComponent = class CoachCardComponent {
    constructor(countryService, specialitiesService) {
        this.countryService = countryService;
        this.specialitiesService = specialitiesService;
        this.countryList = this.countryService.getCountryList();
        this.specialityList = this.specialitiesService.getSpecialityList();
    }
    ngOnInit() {
        // console.log(`Coach card component init with profile: ${JSON.stringify(this.coachProfile)}`);
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], CoachCardComponent.prototype, "coachProfile", void 0);
CoachCardComponent = __decorate([
    Component({
        selector: 'app-coach-card',
        templateUrl: './coach-card.component.html',
        styleUrls: ['./coach-card.component.scss']
    }),
    __metadata("design:paramtypes", [CountryService,
        CoachingSpecialitiesService])
], CoachCardComponent);
export { CoachCardComponent };
//# sourceMappingURL=coach-card.component.js.map