import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MyCoachesComponent } from './mycoaches.component';
import { MyCoachesRoutes } from './mycoaches.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MyCoachesRoutes),
    ComponentsModule
  ],
  declarations: [MyCoachesComponent]
})
export class MyCoachesModule {}
