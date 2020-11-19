import { DashboardComponent } from "./dashboard.component";
export const DashboardRoutes = [
    {
        path: "",
        children: [
            {
                path: "dashboard",
                component: DashboardComponent
            }
        ]
    }
];
//# sourceMappingURL=dashboard.routing.js.map