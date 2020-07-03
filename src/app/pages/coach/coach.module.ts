import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoachComponent } from './coach.component';
import { CoachRoutes } from './coach.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(CoachRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [CoachComponent]
})
export class CoachModule {}
