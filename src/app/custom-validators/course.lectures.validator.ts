import { FormGroup } from '@angular/forms';
import { CoachingCourseLecture } from 'app/interfaces/course.interface';

export function CourseLecturesValidator(controlName: string) {
    return (formGroup: FormGroup) => {
        const lecturesControl = formGroup.controls[controlName];
        const lectures = lecturesControl.value as CoachingCourseLecture[];

        if (lecturesControl.errors) {
            // return if another validator has already found an error on the control
            return;
        }

        // set error on control (1 error at a time) if validation fails for the following reasons..

        // no lectures
        if (!lectures.length) {
            lecturesControl.setErrors({ noLectures: true });
            return;
        }

        // check lecture content. if an error is found on any lecture, set the error along with the index of the lecture
        const errArr = [];

        lectures.forEach((l, index) => {
            if (!l.type) {
                errArr.push({ missingLectureType: true, index });
            }
            if (l.type === 'Article' && !l.article) {
                errArr.push({ missingArticle: true, index });
            }
            if (l.type === 'Video' && !l.video) {
                errArr.push({ missingVideo: true, index });
            }
        });

        if (errArr.length) {
            errArr.forEach((i, index) => {
                lecturesControl.setErrors(i);
            });
            return;
        }

        // valid!
        lecturesControl.setErrors(null);
    };
}
