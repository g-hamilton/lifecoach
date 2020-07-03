import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MyCoursesComponent } from './mycourses.component';
import { MyCoursesRoutes } from './mycourses.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MyCoursesRoutes),
    ComponentsModule
  ],
  declarations: [MyCoursesComponent]
})
export class MyCoursesModule {}
