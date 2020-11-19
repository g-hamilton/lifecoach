var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
let CoachingSpecialitiesService = class CoachingSpecialitiesService {
    constructor() {
        this.specialities = [
            { id: '001', itemName: 'Business & Career' },
            { id: '002', itemName: 'Health, Fitness & Wellness' },
            { id: '003', itemName: 'Relationship' },
            { id: '004', itemName: 'Money & Financial' },
            { id: '005', itemName: 'Family' },
            { id: '006', itemName: 'Religion & Faith' },
            { id: '007', itemName: 'Retirement' },
            { id: '008', itemName: 'Transformation & Mindset' },
            { id: '009', itemName: 'Relocation' },
            { id: '010', itemName: 'Academic' },
            { id: '011', itemName: 'Holistic' },
            { id: '012', itemName: 'Productivity & Personal Organisation' }
        ];
    }
    getSpecialityList() {
        this.specialities.sort((a, b) => {
            const A = a.itemName.toLowerCase();
            const B = b.itemName.toLowerCase();
            return (A < B) ? -1 : (A > B) ? 1 : 0;
        });
        return this.specialities;
    }
    getSpecialityById(id) {
        const match = this.specialities.findIndex(i => i.id === id);
        if (match === -1) {
            console.log('Cannot find speciality by ID!');
        }
        return this.specialities[match];
    }
};
CoachingSpecialitiesService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [])
], CoachingSpecialitiesService);
export { CoachingSpecialitiesService };
//# sourceMappingURL=coaching.specialities.service.js.map