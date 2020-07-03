import { Component, OnInit, Input } from '@angular/core';
import { CoachingCourse } from 'app/interfaces/course.interface';
import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-course-more',
  templateUrl: './course-more.component.html',
  styleUrls: ['./course-more.component.scss']
})
export class CourseMoreComponent implements OnInit {

  @Input() userId: string;
  @Input() course: CoachingCourse;

  private editingAsAdmin: boolean;

  constructor(
    private alertService: AlertService,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(qP => {
      if (qP.targetUser) { // We're editing course as an Admin on behalf of a user
        this.editingAsAdmin = true;
      }
    });
  }

  async onDeleteCourse() {
    const res = await this.alertService.alert('warning-message-and-confirmation', 'Are you sure?', 'Deleting your course is final. It CANNOT BE UNDONE! Note: Any students who have already purchased/enrolled in this course will still have access.', 'Yes - Delete') as any;
    if (res && res.action) { // user confirms
      console.log('User confirms delete');
      this.dataService.deletePrivateCourse(this.userId, this.course.courseId);
      this.alertService.alert('success-message', 'Success!', 'Your course has been deleted.');
      if (this.editingAsAdmin) {
        this.router.navigate(['/admin-manage-user', this.userId]);
      } else {
        this.router.navigate(['/my-courses']);
      }
    }
  }

}
