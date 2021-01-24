import { Component, OnInit, Input } from '@angular/core';
import { CoachingService } from 'app/interfaces/coaching.service.interface';
import { AlertService } from 'app/services/alert.service';
import { DataService } from 'app/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-service-more',
  templateUrl: './service-more.component.html',
  styleUrls: ['./service-more.component.scss']
})
export class ServiceMoreComponent implements OnInit {

  @Input() userId: string;
  @Input() service: CoachingService;

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

  async onDeleteService() {
    const res = await this.alertService.alert('warning-message-and-confirmation', 'Are you sure?', 'Deleting your service is final. It CANNOT BE UNDONE! Note: Any clients who have already purchased/enrolled in this service will still have access.', 'Yes - Delete') as any;
    if (res && res.action) { // user confirms
      // console.log('User confirms delete');
      this.dataService.deletePrivateService(this.userId, this.service.serviceId);
      this.alertService.alert('success-message', 'Success!', 'Your service has been deleted.');
      if (this.editingAsAdmin) {
        this.router.navigate(['/admin-manage-user', this.userId]);
      } else {
        this.router.navigate(['/coach-products-services']);
      }
    }
  }

}
