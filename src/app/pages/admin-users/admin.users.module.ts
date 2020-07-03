import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminUsersComponent } from './admin.users.component';
import { AdminUsersRoutes } from './admin.users.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(AdminUsersRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [AdminUsersComponent]
})
export class AdminUsersModule {}
