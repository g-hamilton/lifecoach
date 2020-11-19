var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../../components/components.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditCoachServiceComponent } from './edit.coach.service.component';
import { EditCoachServiceRoutes } from './edit.coach.service.routing';
let EditCoachServiceModule = class EditCoachServiceModule {
};
EditCoachServiceModule = __decorate([
    NgModule({
        imports: [
            CommonModule,
            RouterModule.forChild(EditCoachServiceRoutes), FormsModule, ReactiveFormsModule,
            ComponentsModule
        ],
        declarations: [
            EditCoachServiceComponent
        ]
    })
], EditCoachServiceModule);
export { EditCoachServiceModule };
//# sourceMappingURL=edit.coach.service.module.js.map