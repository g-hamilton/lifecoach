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
import { HomeSearchResultsComponent } from './home-search-results.component';
import { HomeSearchResultsRoutes } from './home-search-results.routing';
let HomeSearchResultsModule = class HomeSearchResultsModule {
};
HomeSearchResultsModule = __decorate([
    NgModule({
        imports: [
            CommonModule,
            RouterModule.forChild(HomeSearchResultsRoutes),
            ComponentsModule
        ],
        declarations: [
            HomeSearchResultsComponent
        ]
    })
], HomeSearchResultsModule);
export { HomeSearchResultsModule };
//# sourceMappingURL=home-search-results.module.js.map