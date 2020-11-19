import { ChatroomComponent } from './chatroom.component';
export const ChatroomRoutes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: ChatroomComponent
            }
        ]
    }
];
//# sourceMappingURL=chatroom.routing.js.map