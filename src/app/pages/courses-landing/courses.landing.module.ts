import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

import { CoursesLandingComponent } from './courses.landing.component';
import { CoursesLandingRoutes } from './courses.landing.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CoursesLandingRoutes),
    FormsModule,
    ComponentsModule,
    ProgressbarModule.forRoot(),
  ],
  declarations: [
    CoursesLandingComponent
  ]
})
export class CoursesLandingModule {}
