import { Component, OnInit, Input, OnChanges, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

import { DataService } from 'app/services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-conversation',
  templateUrl: './chat-conversation.component.html',
  styleUrls: ['./chat-conversation.component.scss']
})
export class ChatConversationComponent implements OnInit, OnChanges, OnDestroy {

  @Input() userId: string;
  @Input() conversation: any; // Note: a conversation is just a chat room

  private activeRouteRoomId: string;
  public unreadMessagesCount: number;
  public otherUserFullName: string;
  public otherUserFirstName: string;
  public otherUserAvatar: string;
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.getRouteData();
    }
  }

  ngOnChanges() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.userId && this.conversation && this.conversation.roomId && this.conversation.users) {

        // Get profile names for chat participants
        const notMe = (this.conversation.users as []).filter(uid => uid !== this.userId);
        const otherUid = notMe[0];

        this.subscriptions.add(
          this.dataService.getPublicCoachProfile(otherUid).subscribe(profile => {
            if (profile) { // user is a Coach
              this.otherUserFullName = `${profile.firstName} ${profile.lastName}`;
              this.otherUserFirstName = profile.firstName;
              this.otherUserAvatar = profile.photo;
            } else { // user is Regular
              this.subscriptions.add(
                this.dataService.getRegularProfile(otherUid).subscribe(regProfile => {
                  if (regProfile) {
                    this.otherUserFullName = `${regProfile.firstName} ${regProfile.lastName}`;
                    this.otherUserFirstName = regProfile.firstName;
                    this.otherUserAvatar = regProfile.photo ? regProfile.photo :
                      `https://eu.ui-avatars.com/api/?name=${regProfile.firstName}+${regProfile.lastName}`; // https://eu.ui-avatars.com/
                  }
                })
              );
            }
          })
        );

        // Get unread messages count
        this.getUnreadMessagesCount();
      }
    }
  }

  getDisplayDate(unix: number) {
    const date = new Date(unix * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    return `${day} ${date.toLocaleDateString()}`;
  }

  getDisplaytime(unix: number) {
    return new Date(unix * 1000).toLocaleTimeString();
  }

  getRouteData() {
    this.route.params.subscribe(params => {
      this.activeRouteRoomId = params.roomId;
    });
  }

  async getUnreadMessagesCount() {
    this.unreadMessagesCount = await this.dataService
      .getUserRoomUnreadMessageCount(this.conversation.roomId, this.conversation.lastRead);
  }

  onRoomClick() {
    if (this.activeRouteRoomId && this.conversation.roomId && (this.conversation.roomId !== this.activeRouteRoomId)) {
      // user has clicked on a room other than the currently active room
      this.router.navigate(['/messages/rooms', this.conversation.roomId]);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
