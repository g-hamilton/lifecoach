import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MyProgramsComponent } from './myprograms.component';
import { MyProgramsRoutes } from './myprograms.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(MyProgramsRoutes),
    ComponentsModule
  ],
  declarations: [MyProgramsComponent]
})
export class MyProgramsModule {}
