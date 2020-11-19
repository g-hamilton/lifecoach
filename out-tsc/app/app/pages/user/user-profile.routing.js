import { UserComponent } from './user.component';
export const UserRoutes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: UserComponent
            }
        ]
    }
];
//# sourceMappingURL=user-profile.routing.js.map