import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ManageTestimonialsComponent } from './manage.testimonials.component';
import { ManageTestimonialsRoutes } from './manage.testimonials.routing';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(ManageTestimonialsRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
  declarations: [ManageTestimonialsComponent]
})
export class ManageTestimonialsModule {}
