var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Injectable } from '@angular/core';
import { CloudFunctionsService } from '../services/cloud-functions.service';
let SsoService = class SsoService {
    constructor(cloudFunctionsService) {
        this.cloudFunctionsService = cloudFunctionsService;
    }
    getSsoToken(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = JSON.parse(localStorage.getItem('jwt')); // check local storage for a saved token
            if (token) { // saved token exists
                return token;
            }
            else { // no saved token
                const res = yield this.cloudFunctionsService.generateJWT(uid); // cloud call to generate a token
                if (!res.error && res.token) {
                    localStorage.setItem('jwt', JSON.stringify(res.token));
                    return res.token;
                }
                else {
                    console.error(res.error);
                    return null;
                }
            }
        });
    }
};
SsoService = __decorate([
    Injectable({
        providedIn: 'root'
    }),
    __metadata("design:paramtypes", [CloudFunctionsService])
], SsoService);
export { SsoService };
//# sourceMappingURL=sso.service.js.map