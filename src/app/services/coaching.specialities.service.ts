import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoachingSpecialitiesService {

  private specialities = [
    {id: '001', itemName: 'Business & Career'},
    {id: '002', itemName: 'Health, Fitness & Wellness'},
    {id: '003', itemName: 'Relationship'},
    {id: '004', itemName: 'Money & Financial'},
    {id: '005', itemName: 'Family'},
    {id: '006', itemName: 'Religion & Faith'},
    {id: '007', itemName: 'Retirement'},
    {id: '008', itemName: 'Transformation & Mindset'},
    {id: '009', itemName: 'Relocation'},
    {id: '010', itemName: 'Academic'},
    {id: '011', itemName: 'Holistic'},
    {id: '012', itemName: 'Productivity & Personal Organisation'}
  ];

  constructor() { }

  getSpecialityList() {
    this.specialities.sort((a, b) => {
      const A = a.itemName.toLowerCase();
      const B = b.itemName.toLowerCase();
      return (A < B) ? -1 : (A > B) ? 1 : 0;
    });
    return this.specialities;
  }

  getSpecialityById(id: string) {
    const match = this.specialities.findIndex(i => i.id === id);
    if (match === -1) {
      console.log('Cannot find speciality by ID!');
    }
    return this.specialities[match];
  }

}
