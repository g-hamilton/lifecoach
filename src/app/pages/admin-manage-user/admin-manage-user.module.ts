import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AdminManageUserComponent } from './admin-manage-user.component';
import { AdminManageUserRoutes } from './admin-manage-user.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(AdminManageUserRoutes), ComponentsModule],
  declarations: [AdminManageUserComponent]
})
export class AdminManageUserModule {}
