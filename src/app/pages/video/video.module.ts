import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import { VideoComponent } from './video.component';
import {VideoRoutes} from './video.routing';
import {ComponentsModule} from '../../components/components.module';
import {FormsModule} from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(VideoRoutes),
    ComponentsModule,
    FormsModule
  ],
  declarations: [VideoComponent]
})
export class VideoModule {

}
