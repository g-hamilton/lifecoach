import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ReservedSessionsComponent } from './reserved-sessions.component';
import { ReservedSessionsRoutes } from './reserved.sessions.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ReservedSessionsRoutes),
    ComponentsModule
  ],
  declarations: [ReservedSessionsComponent]
})
export class ReservedSessionsModule {}
