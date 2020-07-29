import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AngularFirestore } from '@angular/fire/firestore';

import { AuthService } from '../../services/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { DataService } from 'app/services/data.service';
import { PaginationService } from 'app/services/pagination.service';

import { ChatMessage } from 'app/interfaces/chat.message';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-chatroom',
  templateUrl: 'chatroom.component.html',
  styleUrls: ['./chatroom.component.scss']
})
export class ChatroomComponent implements OnInit, OnDestroy {

  @ViewChild('scrollFeed', {static: false}) private feedContainer: ElementRef;

  public browser: boolean;
  public userId: string;
  public roomID: string;
  public roomLoaded: boolean;
  public noUserRooms: boolean;
  public userRooms = [];
  public feed: ChatMessage[];
  public paginationService: PaginationService;
  public leadsSelected = true;
  public courseQaSelected: boolean;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private afs: AngularFirestore
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
    this.route.params.subscribe(params => {
      if (!params.roomId) { // active route does not include a room ID

        // Get & load user's last active room.
        // NB: Will reload this component from a new route that includes a room ID.
        const roomSub = this.dataService.getUserRooms(uid).subscribe(async data => {

          if (data) { // user has sent at least one message and has a lastActiveRoom
            const defaultRoom = data.lastActiveRoom ? data.lastActiveRoom : await this.getDefaultRoom();
            this.router.navigate(['/messages/rooms', defaultRoom]);

          } else { // user has no lastActiveRoom. Try to get a default room..
            const defaultRoom = await this.getDefaultRoom();
            if (defaultRoom) {
              this.router.navigate(['/messages/rooms', defaultRoom]);

            } else { // user has no rooms
              this.noUserRooms = true;
            }
          }
          roomSub.unsubscribe();
        });
        this.subscriptions.add(roomSub);

      } else { // active route does include a room id
        this.roomID = params.roomId;

        // Reset the pagination service when the room (active route) changes
        this.paginationService = null;
        this.paginationService = new PaginationService(this.afs); // manual constructor

        // Get this room's message feed
        this.paginationService.init(`chatrooms/${this.roomID}/messages`, 'sent', {
          reverse: true,
          prepend: true,
          limit: 10
        });

        // Subscribe to the message feed here in the component
        this.subscriptions.add(
          this.paginationService.data.subscribe(data => {

            // Update the time this user last read a message in this room
            const timestampPromise = this.dataService.updateUserRoomLastReadTimestamp(this.userId, this.roomID);

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

        // Get all the rooms that this user is active in
        const roomSub = this.dataService.getAllUserRooms(uid).subscribe(data => {
          if (data) {
            data.sort((a, b) => parseFloat(a.lastActive) + parseFloat(b.lastActive)); // sort by last active (desc)
            this.userRooms = data;
            console.log(data);
          }
        });
        this.subscriptions.add(roomSub);

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
          }
        })
    );
  }

  getDefaultRoom(): Promise<string | null> {
    return new Promise(resolve => {
      const roomSub = this.dataService.getAllUserRooms(this.userId).subscribe(data => {
        if (data.length > 0) {
          data.sort((a, b) => {
            return a.lastActive + b.lastActive;
          });
          resolve(data[0].roomId);
        }
        roomSub.unsubscribe();
        resolve(null);
      });
      this.subscriptions.add(roomSub);
    });
  }

  feedScrollHandler(ev: any) {
    // console.log(ev); // should log top or bottom
    if (ev === 'top') {
      this.paginationService.more(); // going back in time, call for older messages
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
