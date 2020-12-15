import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminReviewProgramComponent } from './admin-review-program.component';
import { AdminReviewProgramRoutes } from './admin-review-program.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(AdminReviewProgramRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [AdminReviewProgramComponent]
})
export class AdminReviewProgramModule {}
