var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
// Menu Items
export const ROUTES = [
    {
        path: '/dashboard',
        title: 'Dashboard',
        type: 'link',
        icontype: 'tim-icons icon-chart-pie-36',
        rtlTitle: 'لوحة القيادة',
        userTypes: ['regular', 'coach', 'publisher', 'provider', 'admin']
    },
    // {
    //   path: '/calendar',
    //   title: 'Calendar',
    //   type: 'link',
    //   icontype: 'tim-icons icon-calendar-60',
    //   rtlTitle: 'لوحة القيادة',
    //   userTypes: ['coach']
    // },
    // {
    //   path: '/people',
    //   title: 'People',
    //   type: 'link',
    //   icontype: 'tim-icons icon-single-02',
    //   rtlTitle: 'لوحة القيادة',
    //   userTypes: ['coach']
    // },
    {
        path: '/messages',
        title: 'Messages',
        rtlTitle: 'التقويم',
        type: 'link',
        icontype: 'tim-icons icon-chat-33',
        userTypes: ['regular', 'coach', 'admin']
    },
    {
        path: '/profile',
        title: 'Profile',
        rtlTitle: 'التقويم',
        type: 'link',
        icontype: 'tim-icons icon-badge',
        userTypes: ['regular', 'coach']
    },
    // {
    //   path: '/services',
    //   title: 'Services',
    //   type: 'link',
    //   icontype: 'tim-icons icon-bullet-list-67',
    //   rtlTitle: 'لوحة القيادة',
    //   userTypes: ['coach']
    // },
    {
        path: '/my-courses',
        title: 'Courses',
        rtlTitle: 'التقويم',
        type: 'link',
        icontype: 'tim-icons icon-tv-2',
        userTypes: ['regular', 'coach'],
    },
    {
        path: '/admin-users',
        title: 'Users',
        rtlTitle: 'التقويم',
        type: 'link',
        icontype: 'tim-icons icon-satisfied',
        userTypes: ['admin']
    },
    {
        path: '/admin-rates',
        title: 'Rates',
        rtlTitle: 'التقويم',
        type: 'link',
        icontype: 'tim-icons icon-coins',
        userTypes: ['admin']
    },
    {
        path: '/admin-refunds',
        title: 'Refunds',
        rtlTitle: 'التقويم',
        type: 'link',
        icontype: 'tim-icons icon-double-left',
        userTypes: ['admin']
    },
    {
        path: '/admin-course-review',
        title: 'Course Review',
        rtlTitle: 'التقويم',
        type: 'link',
        icontype: 'tim-icons icon-zoom-split',
        userTypes: ['admin']
    },
    {
        path: '/account',
        title: 'Account',
        rtlTitle: 'التقويم',
        type: 'link',
        icontype: 'tim-icons icon-lock-circle',
        userTypes: ['regular', 'coach', 'publisher', 'provider', 'admin']
    },
    {
        path: '/admin-more',
        title: 'More',
        rtlTitle: 'التقويم',
        type: 'sub',
        icontype: 'fas fa-ellipsis-h',
        userTypes: ['admin'],
        isCollapsed: true,
        children: [
            {
                path: 'special-ops',
                rtlTitle: ' التسعير ',
                rtlSmallTitle: 'ع ',
                title: 'Special Ops',
                type: 'link',
                smallTitle: 'S'
            },
            {
                path: 'uploader',
                rtlTitle: 'دعم رتل ',
                rtlSmallTitle: 'ص',
                title: 'Uploader',
                type: 'link',
                smallTitle: 'U'
            }
        ]
    }
    /* Example of child navigation items
    {
      path: '/pages',
      title: 'Pages',
      type: 'sub',
      icontype: 'tim-icons icon-image-02',
      collapse: 'pages',
      rtlTitle: 'صفحات',
      isCollapsed: true,
      children: [
        {
          path: 'pricing',
          rtlTitle: ' التسعير ',
          rtlSmallTitle: 'ع ',
          title: 'Pricing',
          type: 'link',
          smallTitle: 'P'
        },
        {
          path: 'rtl',
          rtlTitle: 'دعم رتل ',
          rtlSmallTitle: 'ص',
          title: 'RTL Support',
          type: 'link',
          smallTitle: 'RS'
        }
      ]
    },
    */
];
let SidebarComponent = class SidebarComponent {
    constructor() { }
    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
    ngOnChanges() {
        // console.log('Sidebar user claims:', this.userClaims);
        if (this.userClaims) { // we know the type of user now
            let userType = 'regular'; // default
            if (this.userClaims.coach) {
                userType = 'coach';
            }
            else if (this.userClaims.admin) {
                userType = 'admin';
            }
            else if (this.userClaims.publisher) {
                userType = 'publisher';
            }
            else if (this.userClaims.provider) {
                userType = 'provider';
            }
            // Filter menu items based on user type
            this.menuItems = ROUTES.filter(menuItem => menuItem.userTypes.includes(userType));
        }
    }
};
__decorate([
    Input(),
    __metadata("design:type", Object)
], SidebarComponent.prototype, "userClaims", void 0);
SidebarComponent = __decorate([
    Component({
        selector: 'app-sidebar',
        templateUrl: './sidebar.component.html',
        styleUrls: ['./sidebar.component.css']
    }),
    __metadata("design:paramtypes", [])
], SidebarComponent);
export { SidebarComponent };
//# sourceMappingURL=sidebar.component.js.map