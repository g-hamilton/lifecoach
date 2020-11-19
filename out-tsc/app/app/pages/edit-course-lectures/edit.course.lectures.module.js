var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditCourseLecturesComponent } from './edit.course.lectures.component';
import { EditCourseLecturesRoutes } from './edit.course.lectures.routing';
import { ComponentsModule } from '../../components/components.module';
let EditCourseLecturesModule = class EditCourseLecturesModule {
};
EditCourseLecturesModule = __decorate([
    NgModule({
        imports: [CommonModule, RouterModule.forChild(EditCourseLecturesRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
        declarations: [EditCourseLecturesComponent]
    })
], EditCourseLecturesModule);
export { EditCourseLecturesModule };
//# sourceMappingURL=edit.course.lectures.module.js.map