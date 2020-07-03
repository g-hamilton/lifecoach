import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';

import { CoursesComponent } from './courses.component';
import { CoursesRoutes } from './courses.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(CoursesRoutes),
    FormsModule,
    ComponentsModule
  ],
  declarations: [
    CoursesComponent
  ]
})
export class CoursesModule {}
