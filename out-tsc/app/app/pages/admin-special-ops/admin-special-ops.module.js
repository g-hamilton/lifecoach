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
import { AdminSpecialOpsComponent } from './admin-special-ops.component';
import { AdminSpecialOpsRoutes } from './admin-special-ops.routing';
import { ComponentsModule } from '../../components/components.module';
let AdminSpecialOpsModule = class AdminSpecialOpsModule {
};
AdminSpecialOpsModule = __decorate([
    NgModule({
        imports: [CommonModule, RouterModule.forChild(AdminSpecialOpsRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
        declarations: [AdminSpecialOpsComponent]
    })
], AdminSpecialOpsModule);
export { AdminSpecialOpsModule };
//# sourceMappingURL=admin-special-ops.module.js.map