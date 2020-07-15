import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AdminUploaderComponent } from './admin.uploader.component';
import { AdminUploaderRoutes } from './admin.uploader.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(AdminUploaderRoutes), ComponentsModule],
  declarations: [AdminUploaderComponent]
})
export class AdminUploaderModule {}
