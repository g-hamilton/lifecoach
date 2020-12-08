import { FormGroup } from '@angular/forms';
import { CoachingCourseSection } from 'app/interfaces/course.interface';

export function CourseSectionsValidator(controlName: string) {
    return (formGroup: FormGroup) => {
        const sectionsControl = formGroup.controls[controlName];
        const sections = sectionsControl.value as CoachingCourseSection[];

        if (sectionsControl.errors) {
            // return if another validator has already found an error on the control
            return;
        }

        // set error on control (1 error at a time) if validation fails for the following reasons..

        // no sections
        if (!sections.length) {
            sectionsControl.setErrors({ noSections: true });
            return;
        }

        // every section must include at least 1 lecture
        const emptySections = [];
        sections.forEach((s, index) => {
            if (!s.lectures) {
                emptySections.push(index);
            }
        });
        if (emptySections.length) {
            sectionsControl.setErrors({ sectionMissingLectures: true });
            return;
        }

        // valid!
        sectionsControl.setErrors(null);
    };
}
