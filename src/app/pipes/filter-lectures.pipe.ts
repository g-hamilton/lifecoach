import { Pipe, PipeTransform } from '@angular/core';
import { CoachingCourseLecture, CoachingCourseSection } from 'app/interfaces/course.interface';

@Pipe({
  name: 'filterLectures',
  pure: false // enable change detection to re-run pipe
})
export class FilterLecturesPipe implements PipeTransform {

  transform(items: CoachingCourseLecture[], section: CoachingCourseSection): any {
    if (!items || !section || !section.lectures) {
        return null;
    }

    // filter all course lectures.
    // any lectures which do not have a matching id in the relevant section will be filtered out.
    // so, sections should only contain associated lectures in the UI.
    // Important: for correct drag and drop ordering, the original order of filtered items must be preserved

    const filteredPreservingOrder = [];
    section.lectures.forEach(l => {
      const index = items.findIndex(i => i.id === l);
      if (index !== -1) {
        filteredPreservingOrder.push(items[index]);
      }
    });

    return filteredPreservingOrder;
  }

}
