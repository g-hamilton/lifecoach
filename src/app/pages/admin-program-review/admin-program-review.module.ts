import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminProgramReviewComponent } from './admin-program-review.component';
import { AdminProgramReviewRoutes } from './admin-program-review.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(AdminProgramReviewRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [AdminProgramReviewComponent]
})
export class AdminProgramReviewModule {}
