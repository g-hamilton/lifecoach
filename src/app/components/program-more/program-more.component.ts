import { Component, OnInit, Input } from '@angular/core';
import { CoachingProgram } from 'app/interfaces/coach.program.interface';
import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-program-more',
  templateUrl: './program-more.component.html',
  styleUrls: ['./program-more.component.scss']
})
export class ProgramMoreComponent implements OnInit {

  @Input() userId: string;
  @Input() program: CoachingProgram;

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

  async onDeleteProgram() {
    const res = await this.alertService.alert('warning-message-and-confirmation', 'Are you sure?', 'Deleting your program is final. It CANNOT BE UNDONE! Note: Any clients who have already purchased/enrolled in this program will still have access.', 'Yes - Delete') as any;
    if (res && res.action) { // user confirms
      // console.log('User confirms delete');
      this.dataService.deletePrivateProgram(this.userId, this.program.programId);
      this.alertService.alert('success-message', 'Success!', 'Your program has been deleted.');
      if (this.editingAsAdmin) {
        this.router.navigate(['/admin-manage-user', this.userId]);
      } else {
        this.router.navigate(['/coach-products-services']);
      }
    }
  }

}
