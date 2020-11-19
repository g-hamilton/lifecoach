import { AdminUsersComponent } from './admin.users.component';
export const AdminUsersRoutes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: AdminUsersComponent
            }
        ]
    }
];
//# sourceMappingURL=admin.users.routing.js.map