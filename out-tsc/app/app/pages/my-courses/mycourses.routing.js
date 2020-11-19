import { MyCoursesComponent } from './mycourses.component';
export const MyCoursesRoutes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: MyCoursesComponent
            }
        ]
    }
];
//# sourceMappingURL=mycourses.routing.js.map