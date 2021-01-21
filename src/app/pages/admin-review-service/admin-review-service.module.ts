import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminReviewServiceComponent } from './admin-review-service.component';
import { AdminReviewServiceRoutes } from './admin-review-service.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(AdminReviewServiceRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [AdminReviewServiceComponent]
})
export class AdminReviewServiceModule {}
