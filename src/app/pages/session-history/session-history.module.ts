import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import { SessionHistoryComponent } from './session-history.component';
import { SessionHistoryRoutes } from './session-history.routing';
import { ComponentsModule } from '../../components/components.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SessionHistoryRoutes),
    ComponentsModule,
    FormsModule
  ],
  declarations: [SessionHistoryComponent]
})
export class SessionHistoryModule {

}
