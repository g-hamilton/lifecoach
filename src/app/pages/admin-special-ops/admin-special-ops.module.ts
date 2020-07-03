import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminSpecialOpsComponent } from './admin-special-ops.component';
import { AdminSpecialOpsRoutes } from './admin-special-ops.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(AdminSpecialOpsRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [AdminSpecialOpsComponent]
})
export class AdminSpecialOpsModule {}
