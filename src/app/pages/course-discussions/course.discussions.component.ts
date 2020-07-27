import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AngularFirestore } from '@angular/fire/firestore';

import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { DataService } from 'app/services/data.service';
import { PaginationService } from 'app/services/pagination.service';

import { SearchService } from 'app/services/search.service';
import { CourseQuestionReply, CourseQuestion } from 'app/interfaces/q&a.interface';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-course-discussions',
  templateUrl: 'course.discussions.component.html',
  styleUrls: ['./course.discussions.component.scss']
})
export class CourseDiscussionsComponent implements OnInit, OnDestroy {

  @ViewChild('scrollFeed', {static: false}) private feedContainer: ElementRef;

  public browser: boolean;
  public userId: string;
  public roomID: string;
  public roomLoaded: boolean;
  public noUserRooms: boolean;
  public userRooms = [] as CourseQuestion[];
  public roomPaginationService: PaginationService;
  public feed: CourseQuestionReply[];
  public feedPaginationService: PaginationService;
  public leadsSelected: boolean;
  public courseQaSelected = true;
  public userProfile: any;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private afs: AngularFirestore,
    private searchService: SearchService
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.browser = true;
      this.analyticsService.pageView();
      this.getUserData();
    }
  }

  scrollToBottom() {
    this.feedContainer.nativeElement.scrollTop = this.feedContainer.nativeElement.scrollHeight;
  }

  getRouteData(uid: string) {
    this.route.params.subscribe(async params => {
      if (!params.roomId) { // active route does not include a room ID

        // Load the default room
        const roomId = await this.getDefaultRoom() as any;
        console.log(roomId);
        if (roomId) {
          this.router.navigate(['/course-discussions/rooms', roomId]);

        } else { // user has no rooms
          this.noUserRooms = true;
        }

      } else { // active route does include a room id
        this.roomID = params.roomId;

        // Reset the pagination service when the room (active route) changes
        this.feedPaginationService = null;
        this.feedPaginationService = new PaginationService(this.afs); // manual constructor

        // Get this room's message feed
        this.feedPaginationService.init(`public-course-questions/${this.roomID}/replies`, 'created', {
          // where: `courseSellerId == ${this.userId}`,
          reverse: true,
          prepend: true,
          limit: 10
        });

        // Subscribe to the message feed here in the component
        this.subscriptions.add(
          this.feedPaginationService.data.subscribe(data => {
            console.log('Feed results:', data);

            // Update the time this user last read a message in this room
            // const timestampPromise = this.dataService.updateUserRoomLastReadTimestamp(this.userId, this.roomID);

            // Scroll to feed bottom
            setTimeout(() => {
              this.scrollToBottom();
            }, 1000);
          })
        );

        // Scroll to bottom of messages on first load of the page (init)
        setTimeout(() => {
          this.scrollToBottom();
        }, 1000);

        // Get this user's discussions

        // Reset the pagination service when the room (active route) changes
        this.roomPaginationService = null;
        this.roomPaginationService = new PaginationService(this.afs); // manual constructor

        this.roomPaginationService.init(`public-course-questions`, 'created', {
          where: `courseSellerId == ${this.userId}`,
          reverse: true,
          prepend: true,
          limit: 10
        });

        // Subscribe to the rooms feed here in the component
        this.subscriptions.add(
          this.roomPaginationService.data.subscribe(data => {
            console.log('Room results:', data);

            this.userRooms = data;
          })
        );

        this.roomLoaded = true;  // load chatroom child components
      }
    });
  }

  getUserData() {
    this.subscriptions.add(
      this.authService.getAuthUser()
        .subscribe(user => {
          if (user) {
            this.userId = user.uid;
            this.getRouteData(user.uid);
            this.getUserProfile();
          }
        })
    );
  }

  getUserProfile() {
    const tempSub = this.dataService.getPublicCoachProfile(this.userId).subscribe(coachProfile => {
      // console.log(coachProfile);
      if (coachProfile) {
        this.userProfile = coachProfile;
      }
      tempSub.unsubscribe();
    });
    this.subscriptions.add(tempSub);
  }

  async getDefaultRoom() {
    /*
        Looks for all questions in all courses for the user.
        Returns the most recent question id, or null if no questions found.
        Sort by most recent date setting is set in Algolia so no sort needed here.
    */
    const filters = {
      facets: {
        courseSellerId: this.userId,
        type: 'course'
      }
    };
    const res = await this.searchService.searchCourseQuestions(1, 1, filters); // only need 1 result
    if (res && res.hits && res.hits.length) {
      return res.hits[0].objectID;
    }
    return null;
  }

  roomScrollHandler(ev: any) {
    // console.log(ev); // should log top or bottom
    if (ev === 'top') {
      this.roomPaginationService.more(); // going back in time, call for older messages
    }
  }

  feedScrollHandler(ev: any) {
    // console.log(ev); // should log top or bottom
    if (ev === 'top') {
      this.feedPaginationService.more(); // going back in time, call for older messages
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
