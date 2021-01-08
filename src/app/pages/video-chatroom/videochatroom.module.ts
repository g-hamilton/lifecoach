import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { VideochatroomComponent } from './videochatroom.component';
import { VideoChatroomRoutes } from './videochatroom.routing';
import { ComponentsModule } from '../../components/components.module';
import { FormsModule } from '@angular/forms';

import { CoachInviteComponent } from 'app/components/coach-invite/coach-invite.component';
import { SessionManagerComponent } from 'app/components/session-manager/session-manager.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(VideoChatroomRoutes),
    ComponentsModule,
    FormsModule
  ],
  declarations: [VideochatroomComponent],
  entryComponents: [
    CoachInviteComponent,
    SessionManagerComponent
  ]
})
export class VideochatroomModule {}
