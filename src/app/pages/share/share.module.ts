import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ShareComponent } from './share.component';
import { ShareRoutes } from './share.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ShareRoutes),
    ComponentsModule
  ],
  declarations: [ShareComponent]
})
export class ShareModule {}
