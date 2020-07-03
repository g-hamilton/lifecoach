import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LearnComponent } from './learn.component';
import { LearnRoutes } from './learn.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(LearnRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [LearnComponent]
})
export class LearnModule {}
