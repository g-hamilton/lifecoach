import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminServiceReviewComponent } from './admin-service-review.component';
import { AdminServiceReviewRoutes } from './admin-service-review.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(AdminServiceReviewRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [AdminServiceReviewComponent]
})
export class AdminServiceReviewModule {}
