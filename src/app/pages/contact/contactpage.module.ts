import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../components/components.module';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

import { ContactPageComponent } from './contactpage.component';
import { ContactPageRoutes } from './contactpage.routing';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ContactPageRoutes),
    FormsModule,
    ComponentsModule,
    ProgressbarModule.forRoot(),
  ],
  declarations: [
    ContactPageComponent
  ]
})
export class ContactPageModule {}
