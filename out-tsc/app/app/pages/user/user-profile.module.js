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
import { ComponentsModule } from '../../components/components.module';
import { UserComponent } from './user.component';
import { UserRoutes } from './user-profile.routing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
let UserModule = class UserModule {
};
UserModule = __decorate([
    NgModule({
        imports: [
            CommonModule,
            RouterModule.forChild(UserRoutes),
            FormsModule,
            ReactiveFormsModule,
            ComponentsModule,
            MatFormFieldModule,
            MatChipsModule,
        ],
        declarations: [UserComponent]
    })
], UserModule);
export { UserModule };
//# sourceMappingURL=user-profile.module.js.map