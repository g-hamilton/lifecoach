import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from 'app/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { CRMPerson } from 'app/interfaces/crm.person.interface';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CrmPeopleService } from 'app/services/crm-people.service';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap/modal';
import { CoachInviteComponent } from 'app/components/coach-invite/coach-invite.component';
import { DataService } from 'app/services/data.service';

@Component({
  selector: 'app-person-history',
  templateUrl: 'person.history.component.html'
})
export class PersonHistoryComponent implements OnInit, OnDestroy {

  public bsModalRef: BsModalRef;

  public browser: boolean;
  private userId: string; // the user's own id
  private personId: string; // the id of the person the user is looking at
  public person: CRMPerson;
  private subscriptions: Subscription = new Subscription();
  public msgUrl = '/messages';
  public enrolledInCourses = [];
  public enrolledInPrograms = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private crmPeopleService: CrmPeopleService,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private dataService: DataService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.route.params.subscribe(params => {
        if (params.uid) {
          this.personId = params.uid;
          this.getUserData();
        }
      });
    }
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          this.userId = user.uid;
          this.loadPerson();
        }
      })
    );
  }

  loadPerson() {
    this.subscriptions.add(
      this.crmPeopleService.getUserPerson(this.userId, this.personId).subscribe(async person => {
        if (person) {
          console.log('person:', person);
          this.person = await this.crmPeopleService.getFilledPerson(this.userId, person, this.personId);
          this.updateMsgUrl();

          // work out which eCourses and programs this person has enrolled in by looking at their history array
          if (this.person.history) {
            // deal with programs
            const programs = this.person.history.filter(i => i.action === 'enrolled_in_program_session' || i.action === 'enrolled_in_full_program');
            const mapped = programs.map(i => i.programId); // make an array of program ids (may contain duplicates if paying per session!)
            const uniqueProgramIds = [...new Set(mapped)]; // remove any duplicates
            this.enrolledInPrograms = []; // reset
            uniqueProgramIds.forEach(i => this.loadProgram(i));
          }
        }
      })
    );
  }

  updateMsgUrl() {
    // checks if this person has a message room. if so, updates the msg url to take
    // the coach to that room on click
    let roomId: string;
    if (this.person.history) {
      this.person.history.forEach(item => {
        if (item.roomId) {
          roomId = item.roomId;
        }
      });
    }
    if (roomId) {
      this.msgUrl = `/messages/rooms/${roomId}`;
    }
  }

  openInviteModal(type: 'ecourse' | 'program') {
    // we can send data to the modal & open in a another component via a service
    // https://valor-software.com/ngx-bootstrap/#/modals#service-component
    const config: ModalOptions = {
      initialState: {
        type,
        invitee: this.person
      }
    };
    this.bsModalRef = this.modalService.show(CoachInviteComponent, config);
  }

  loadProgram(programId: string) {
    // fetch the program and push it to the array of programs the person is enrolled in
    this.subscriptions.add(
      this.dataService.getPublicProgram(programId)
      .pipe(take(1))
      .subscribe(program => {
        if (program) {
          this.enrolledInPrograms.push(program);
          console.log('enrolled in programs:', this.enrolledInPrograms);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
