var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { TabsModule } from "ngx-bootstrap/tabs";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { AlertModule } from "ngx-bootstrap/alert";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { CarouselModule } from "ngx-bootstrap/carousel";
import { ModalModule } from "ngx-bootstrap/modal";
import { JwBootstrapSwitchNg2Module } from "jw-bootstrap-switch-ng2";
import { PopoverModule } from "ngx-bootstrap/popover";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { TimepickerModule } from "ngx-bootstrap/timepicker";
let AdminLayoutModule = class AdminLayoutModule {
};
AdminLayoutModule = __decorate([
    NgModule({
        imports: [
            CommonModule,
            FormsModule,
            HttpClientModule,
            JwBootstrapSwitchNg2Module,
            BsDropdownModule.forRoot(),
            ProgressbarModule.forRoot(),
            TooltipModule.forRoot(),
            TimepickerModule.forRoot(),
            PopoverModule.forRoot(),
            CollapseModule.forRoot(),
            AngularMultiSelectModule,
            TabsModule.forRoot(),
            PaginationModule.forRoot(),
            AlertModule.forRoot(),
            BsDatepickerModule.forRoot(),
            CarouselModule.forRoot(),
            ModalModule.forRoot()
        ],
        declarations: []
    })
], AdminLayoutModule);
export { AdminLayoutModule };
//# sourceMappingURL=admin-layout.module.js.map