import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { VideochatroomComponent } from './videochatroom.component';
import { VideoChatroomRoutes } from './videochatroom.routing';
import { ComponentsModule } from '../../components/components.module';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(VideoChatroomRoutes),
    ComponentsModule,
    FormsModule
  ],
  declarations: [VideochatroomComponent]
})
export class VideochatroomModule {}
