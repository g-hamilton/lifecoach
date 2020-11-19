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
import { AdminUsersComponent } from './admin.users.component';
import { AdminUsersRoutes } from './admin.users.routing';
import { ComponentsModule } from '../../components/components.module';
let AdminUsersModule = class AdminUsersModule {
};
AdminUsersModule = __decorate([
    NgModule({
        imports: [CommonModule, RouterModule.forChild(AdminUsersRoutes), FormsModule, ReactiveFormsModule, ComponentsModule],
        declarations: [AdminUsersComponent]
    })
], AdminUsersModule);
export { AdminUsersModule };
//# sourceMappingURL=admin.users.module.js.map