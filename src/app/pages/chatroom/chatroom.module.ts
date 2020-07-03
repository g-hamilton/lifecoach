import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ChatroomComponent } from './chatroom.component';
import { ChatroomRoutes } from './chatroom.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ChatroomRoutes),
    ComponentsModule
  ],
  declarations: [ChatroomComponent]
})
export class ChatroomModule {}
