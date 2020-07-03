import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

import { AboutComponent } from './about.component';
import { AboutRoutes } from './about.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AboutRoutes),
    FormsModule,
    ComponentsModule,
    ProgressbarModule.forRoot(),
  ],
  declarations: [
    AboutComponent
  ]
})
export class AboutModule {}
