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
    title: 'My Dashboard',
    type: 'link',
    icontype: 'tim-icons icon-chart-pie-36',
    rtlTitle: 'لوحة القيادة',
    userTypes: ['regular', 'coach', 'partner', 'provider', 'admin']
  },
  {
    path: '/people',
    title: 'My People',
    type: 'link',
    icontype: 'tim-icons icon-single-02',
    rtlTitle: 'لوحة القيادة',
    userTypes: ['coach']
  },
  {
    path: '/calendar',
    title: 'My Calendar',
    rtlTitle: 'التقويم',
    type: 'link',
    icontype: 'tim-icons icon-calendar-60',
    userTypes: ['coach']
  },
  {
    path: '/messages',
    title: 'My Messages',
    rtlTitle: 'التقويم',
    type: 'link',
    icontype: 'tim-icons icon-email-85',
    userTypes: ['regular', 'coach', 'admin']
  },
  {
    path: '/my-sessions',
    title: 'My Sessions',
    rtlTitle: 'التقويم',
    type: 'link',
    icontype: 'tim-icons icon-chat-33',
    userTypes: ['regular']
  },
  {
    path: '/my-programs',
    title: 'My Programs',
    rtlTitle: 'التقويم',
    type: 'link',
    icontype: 'tim-icons icon-trophy',
    userTypes: ['regular'],
  },
  {
    path: '/my-courses',
    title: 'My e-Courses',
    rtlTitle: 'التقويم',
    type: 'link',
    icontype: 'tim-icons icon-tv-2',
    userTypes: ['regular'],
  },
  {
    path: '/profile',
    title: 'My Profile',
    rtlTitle: 'التقويم',
    type: 'link',
    icontype: 'tim-icons icon-badge',
    userTypes: ['regular', 'coach']
  },
  {
    path: '/coach-products-services',
    title: 'My Products & Services',
    type: 'link',
    icontype: 'tim-icons icon-bullet-list-67',
    rtlTitle: 'لوحة القيادة',
    userTypes: ['coach'],
  },
  {
    path: '/coach-journey',
    title: 'My Journey',
    type: 'link',
    icontype: 'tim-icons icon-compass-05',
    rtlTitle: 'لوحة القيادة',
    userTypes: ['coach'],
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
    path: '/',
    title: 'Review',
    rtlTitle: 'التقويم',
    type: 'sub',
    icontype: 'tim-icons icon-zoom-split',
    userTypes: ['admin'],
    isCollapsed: true,
    children: [
      {
        path: 'admin-course-review',
        rtlTitle: ' التسعير ',
        rtlSmallTitle: 'ع ',
        title: 'eCourse Review',
        type: 'link',
        smallTitle: 'eCR'
      },
      {
        path: 'admin-program-review',
        rtlTitle: 'دعم رتل ',
        rtlSmallTitle: 'ص',
        title: 'Program Review',
        type: 'link',
        smallTitle: 'PR'
      },
      {
        path: 'admin-service-review',
        rtlTitle: 'دعم رتل ',
        rtlSmallTitle: 'ص',
        title: 'Service Review',
        type: 'link',
        smallTitle: 'SR'
      }
    ]
  },
  {
    path: '/account',
    title: 'My Account',
    rtlTitle: 'التقويم',
    type: 'link',
    icontype: 'tim-icons icon-lock-circle',
    userTypes: ['regular', 'coach', 'partner', 'provider', 'admin']
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
  }

  ngOnChanges() { // starts when props incoming (userClaims)
    // console.log('Sidebar user claims:', this.userClaims);

    if (this.userClaims) { // we know the type of user now
      let userType = 'regular'; // default
      if (this.userClaims.coach) {
        userType = 'coach';
      } else if (this.userClaims.admin) {
        userType = 'admin';
      } else if (this.userClaims.partner) {
        userType = 'partner';
      } else if (this.userClaims.provider) {
        userType = 'provider';
      }

      // Filter menu items based on user type
      this.menuItems = ROUTES.filter(menuItem => menuItem.userTypes.includes(userType));
    }
  }
}
