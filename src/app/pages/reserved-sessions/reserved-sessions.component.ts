import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {AuthService} from '../../services/auth.service';
import {Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-reserved-sessions',
  templateUrl: './reserved-sessions.component.html',
  styleUrls: ['./reserved-sessions.component.scss']
})
export class ReservedSessionsComponent implements OnInit, OnDestroy {

  orderedSessions: any;
  user: any;
  onLoad = true;
  uid: string;
  public reservedEvents: Array<any> = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {

    console.log('Initialized');

    this.subscriptions.add(
      this.authService.getAuthUser().subscribe(user => {
        if (user) {
          console.log('USER OBJ:', user);
          this.uid = user.uid;
          console.log('ID is ', this.uid);

          this.subscriptions.add(
            this.dataService.getUserReservedEvents(this.uid).pipe(
          // @ts-ignore
              map( i => i.sort((a, b) => a.timeOfReserve - b.timeOfReserve))
            ).subscribe(next => {
              console.log(next);
              if (next) {
                this.reservedEvents = next;
                console.log(next);
              } else {
                this.reservedEvents = [];
              }
            })
          );

          // this.dataService.getTestDocFromReference(this.uid)
          //   .then(e => console.log(e))
          //   .catch(e => console.log(e));

        }
      })
    );

  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
