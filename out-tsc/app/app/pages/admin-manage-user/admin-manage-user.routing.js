import { AdminManageUserComponent } from './admin-manage-user.component';
export const AdminManageUserRoutes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: AdminManageUserComponent
            }
        ]
    }
];
//# sourceMappingURL=admin-manage-user.routing.js.map