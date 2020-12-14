/*!

 =========================================================
 * Black Dashboard Pro Angular - v1.0.0
 =========================================================

 * Product Page: http://creative-tim.com/product/black-dashboard-pro-angular
 * Copyright 2019 Creative Tim (http://www.creative-tim.com)


 =========================================================

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 */
import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";
import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
if (environment.production) {
    enableProdMode();
}
document.addEventListener('DOMContentLoaded', () => {
    platformBrowserDynamic()
        .bootstrapModule(AppModule)
        .catch(err => console.error(err));
});
//# sourceMappingURL=main.js.map