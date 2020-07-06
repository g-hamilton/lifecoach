import { Component, OnInit, Input, OnChanges } from '@angular/core';

export interface RouteInfo {
  path: string;
  title: string;
  type: string;
  icontype: string;
  rtlTitle: string;
  userTypes: string[]; // Who should see this menu item?
  collapse?: string;
  isCollapsed?: boolean;
  isCollapsing?: any;
  children?: ChildrenItems[];
}

export interface ChildrenItems {
  path: string;
  title: string;
  smallTitle?: string;
  rtlTitle: string;
  rtlSmallTitle?: string;
  type?: string;
  collapse?: string;
  children?: ChildrenItems2[];
  isCollapsed?: boolean;
}
export interface ChildrenItems2 {
  path?: string;
  smallTitle?: string;
  rtlSmallTitle?: string;
  title?: string;
  rtlTitle: string;
  type?: string;
}
// Menu Items
export const ROUTES: RouteInfo[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    type: 'link',
    icontype: 'tim-icons icon-chart-pie-36',
    rtlTitle: 'لوحة القيادة',
    userTypes: ['regular', 'coach', 'admin']
  },
  {
    path: '/calendar',
    title: 'Calendar',
    type: 'link',
    icontype: 'tim-icons icon-calendar-60',
    rtlTitle: 'لوحة القيادة',
    userTypes: ['coach']
  },
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
  {
    path: '/services',
    title: 'Services',
    type: 'link',
    icontype: 'tim-icons icon-bullet-list-67',
    rtlTitle: 'لوحة القيادة',
    userTypes: ['coach']
  },
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
    userTypes: ['regular', 'coach', 'admin']
  },
  {
    path: '/admin-special-ops',
    title: 'Special Ops',
    rtlTitle: 'التقويم',
    type: 'link',
    icontype: 'tim-icons icon-alert-circle-exc',
    userTypes: ['admin']
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

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnChanges {

  @Input() userClaims: any;

  menuItems: any[];

  constructor() {}

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }

  ngOnChanges() {
    // console.log('Sidebar user claims:', this.userClaims);

    if (this.userClaims) { // we know the type of user now
      let userType = 'regular'; // default
      if (this.userClaims.coach) {
        userType = 'coach'; // user is a coach
      }
      if (this.userClaims.admin) {
        userType = 'admin'; // user is an admin
      }

      // Filter menu items based on user type
      this.menuItems = ROUTES.filter(menuItem => menuItem.userTypes.includes(userType));
    }
  }
}
