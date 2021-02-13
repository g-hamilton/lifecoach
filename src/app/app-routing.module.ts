import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import {Routes, RouterModule, PreloadAllModules} from '@angular/router';

import { AuthGuardService as AuthGuard } from './services/auth-guard.service';
import { AdminAuthGuardService as AdminAuthGuard } from './services/admin-auth-guard.service';
import { PaywallAuthGuardService as PaywallAuthGuard } from './services/paywall-auth-guard.service';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
    pathMatch: 'full'
  },
  {
    path: 'register/:type',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterModule),
    pathMatch: 'full'
  },
  {
    path: 'for-life-coaches',
    loadChildren: () => import('./pages/pricing/pricing.module').then(m => m.PricingModule),
    pathMatch: 'full'
  },
  {
    path: 'for-coaches',
    loadChildren: () => import('./pages/pricing/pricing.module').then(m => m.PricingModule),
    pathMatch: 'full'
  },
  {
    path: 'for-partners',
    loadChildren: () => import('./pages/for-partners/for.partners.module').then(m => m.ForPartnersModule),
    pathMatch: 'full'
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule),
    pathMatch: 'full'
  },
  {
    path: 'contact',
    loadChildren: () => import('./pages/contact/contactpage.module').then(m => m.ContactPageModule),
    pathMatch: 'full'
  },
  {
    path: 'sell-coaching-courses',
    loadChildren: () => import('./pages/courses-landing/courses.landing.module').then(m => m.CoursesLandingModule),
    pathMatch: 'full'
  },
  {
    path: 'sell-coaching-ecourses',
    loadChildren: () => import('./pages/courses-landing/courses.landing.module').then(m => m.CoursesLandingModule),
    pathMatch: 'full'
  },
  {
    path: 'search-results',
    loadChildren: () => import('./pages/home-search-results/home-search-results.module').then(m => m.HomeSearchResultsModule),
    pathMatch: 'full'
  },
  {
    path: 'coaches',
    loadChildren: () => import('./pages/browse/browse.module').then(m => m.BrowseModule),
    pathMatch: 'full'
  },
  {
    path: 'coach/:uid',
    loadChildren: () => import('./pages/coach/coach.module').then(m => m.CoachModule),
    pathMatch: 'full'
  },
  {
    path: 'courses',
    loadChildren: () => import('./pages/courses/courses.module').then(m => m.CoursesModule),
    pathMatch: 'full'
  },
  {
    path: 'course/:id',
    loadChildren: () => import('./pages/course/course.module').then(m => m.CourseModule),
    pathMatch: 'full'
  },
  {
    path: 'course/:courseId/learn',
    loadChildren: () => import('./pages/learn/learn.module').then(m => m.LearnModule),
    canActivate: [PaywallAuthGuard],
    pathMatch: 'full'
  },
  {
    path: 'course/:courseId/learn/lecture/:lectureId',
    loadChildren: () => import('./pages/learn/learn.module').then(m => m.LearnModule),
    canActivate: [PaywallAuthGuard],
    pathMatch: 'full'
  },
  {
    path: 'programs',
    loadChildren: () => import('./pages/programs/programs.module').then(m => m.ProgramsModule),
    pathMatch: 'full'
  },
  {
    path: 'program/:id',
    loadChildren: () => import('./pages/program/program.module').then(m => m.ProgramModule),
    pathMatch: 'full'
  },
  {
    path: 'coaching-service/:id',
    loadChildren: () => import('./pages/coaching-service/coaching.service.module').then(m => m.CoachingServiceModule),
    pathMatch: 'full'
  },

  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./pages/user/user-profile.module').then(m => m.UserModule)
      },
      {
        path: 'calendar',
        loadChildren: () => import('./pages/calendar/calendar.page.module').then(m => m.CalendarPageModule)
      },
      {
        path: 'coach-products-services',
        loadChildren: () => import('./pages/coach-services/coach.services.module').then(m => m.CoachServicesModule)
      },
      {
        path: 'coach-journey',
        loadChildren: () => import('./pages/coach-as-regular-user/coach.as.regular.user.module').then(m => m.CoachAsRegularUserModule)
      },
      {
        path: 'people',
        loadChildren: () => import('./pages/coach-people/coach.people.module').then(m => m.CoachPeopleModule)
      },
      {
        path: 'person-history/:uid',
        loadChildren: () => import('./pages/person-history/person.history.module').then(m => m.PersonHistoryModule)
      },
      {
        path: 'account',
        loadChildren: () => import('./pages/account/account.module').then(m => m.AccountModule)
      },
      {
        path: 'account/payout-settings',
        loadChildren: () => import('./pages/account/account.module').then(m => m.AccountModule)
      },
      {
        path: 'account/stripe/oauth',
        loadChildren: () => import('./pages/account/account.module').then(m => m.AccountModule)
      },
      {
        path: 'refer-a-friend',
        loadChildren: () => import('./pages/refer-a-friend/referfriend.module').then(m => m.ReferFriendModule)
      },
      {
        path: 'share',
        loadChildren: () => import('./pages/share/share.module').then(m => m.ShareModule)
      },

      {
        path: 'messages',
        loadChildren: () => import('./pages/chatroom/chatroom.module').then(m => m.ChatroomModule)
      },
      {
        path: 'messages/rooms/:roomId',
        loadChildren: () => import('./pages/chatroom/chatroom.module').then(m => m.ChatroomModule)
      },
      {
        path: 'course-discussions',
        loadChildren: () => import('./pages/course-discussions/course.discussions.module').then(m => m.CourseDiscussionsModule)
      },
      {
        path: 'course-discussions/rooms/:roomId',
        loadChildren: () => import('./pages/course-discussions/course.discussions.module').then(m => m.CourseDiscussionsModule)
      },
      {
        path: 'admin-rates',
        loadChildren: () => import('./pages/rates/rates.module').then(m => m.RatesModule)
      },
      {
        path: 'my-courses',
        loadChildren: () => import('./pages/my-courses/mycourses.module').then(m => m.MyCoursesModule),
        pathMatch: 'full'
      },
      {
        path: 'my-courses/new-course',
        loadChildren: () => import('./pages/edit-course-lectures/edit.course.lectures.module').then(m => m.EditCourseLecturesModule),
        pathMatch: 'full'
      },
      {
        path: 'my-courses/:courseId/content',
        loadChildren: () => import('./pages/edit-course-lectures/edit.course.lectures.module').then(m => m.EditCourseLecturesModule),
        pathMatch: 'full'
      },
      {
        path: 'my-courses/:courseId/content/section/new',
        loadChildren: () => import('./pages/edit-course-lectures/edit.course.lectures.module').then(m => m.EditCourseLecturesModule),
        pathMatch: 'full'
      },
      {
        path: 'my-courses/:courseId/content/section/:sectionId',
        loadChildren: () => import('./pages/edit-course-lectures/edit.course.lectures.module').then(m => m.EditCourseLecturesModule),
        pathMatch: 'full'
      },
      {
        path: 'my-courses/:courseId/content/section/:sectionId/lecture/new',
        loadChildren: () => import('./pages/edit-course-lectures/edit.course.lectures.module').then(m => m.EditCourseLecturesModule),
        pathMatch: 'full'
      },
      {
        path: 'my-courses/:courseId/content/section/:sectionId/lecture/:lectureId',
        loadChildren: () => import('./pages/edit-course-lectures/edit.course.lectures.module').then(m => m.EditCourseLecturesModule),
        pathMatch: 'full'
      },
      {
        path: 'my-programs',
        loadChildren: () => import('./pages/my-programs/myprograms.module').then(m => m.MyProgramsModule),
        pathMatch: 'full'
      },
      {
        path: 'my-programs/new-program',
        loadChildren: () => import('./pages/edit-coach-program/edit-coach.program.module').then(m => m.EditCoachProgramModule),
        pathMatch: 'full'
      },
      {
        path: 'my-programs/:programId/content',
        loadChildren: () => import('./pages/edit-coach-program/edit-coach.program.module').then(m => m.EditCoachProgramModule),
        pathMatch: 'full'
      },
      {
        path: 'my-programs/:programId/clients/:clientId/sessions/:sessionId',
        loadChildren: () => import('./pages/session-history/session-history.module').then(m => m.SessionHistoryModule),
        pathMatch: 'full'
      },
      {
        path: 'my-programs/:programId/clients/:clientId/sessions',
        loadChildren: () => import('./pages/session-history/session-history.module').then(m => m.SessionHistoryModule),
        pathMatch: 'full'
      },
      {
        path: 'my-services/new-service',
        loadChildren: () => import('./pages/edit-coach-service/edit.coach.service.module').then(m => m.EditCoachServiceModule),
        pathMatch: 'full'
      },
      {
        path: 'my-services/:serviceId/content',
        loadChildren: () => import('./pages/edit-coach-service/edit.coach.service.module').then(m => m.EditCoachServiceModule),
        pathMatch: 'full'
      },
      {
        path: 'my-sessions',
        loadChildren: () => import('./pages/video/video.module').then(m => m.VideoModule),
        pathMatch: 'full'
      },
      {
        path: 'my-sessions/:sessionId',
        loadChildren: () => import('./pages/video-chatroom/videochatroom.module').then(m => m.VideochatroomModule),
        pathMatch: 'full'
      },
      {
        path: 'admin-users',
        loadChildren: () => import('./pages/admin-users/admin.users.module').then(m => m.AdminUsersModule),
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'admin-refunds',
        loadChildren: () => import('./pages/admin-refunds/admin.refunds.module').then(m => m.AdminRefundsModule),
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'admin-course-review',
        loadChildren: () => import('./pages/admin-course-reviews/admin-course-reviews.module').then(m => m.AdminCourseReviewsModule),
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'admin-course-review-player/:courseId',
        loadChildren: () => import('./pages/admin-course-review-player/admin-course-review-player.module').then(m => m.AdminCourseReviewPlayerModule),
        pathMatch: 'full',
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'admin-course-review-player/:courseId/learn/lecture/:lectureId',
        loadChildren: () => import('./pages/admin-course-review-player/admin-course-review-player.module').then(m => m.AdminCourseReviewPlayerModule),
        pathMatch: 'full',
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'admin-program-review',
        loadChildren: () => import('./pages/admin-program-review/admin-program-review.module').then(m => m.AdminProgramReviewModule),
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'admin-review-program/:programId',
        loadChildren: () => import('./pages/admin-review-program/admin-review-program.module').then(m => m.AdminReviewProgramModule),
        pathMatch: 'full',
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'admin-service-review',
        loadChildren: () => import('./pages/admin-service-review/admin-service-review.module').then(m => m.AdminServiceReviewModule),
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'admin-review-service/:serviceId',
        loadChildren: () => import('./pages/admin-review-service/admin-review-service.module').then(m => m.AdminReviewServiceModule),
        pathMatch: 'full',
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'receipt/:id',
        loadChildren: () => import('./pages/receipt/receipt.module').then(m => m.ReceiptModule)
      },
      {
        path: 'admin-manage-user/:targetUserUid',
        loadChildren: () => import('./pages/admin-manage-user/admin-manage-user.module').then(m => m.AdminManageUserModule),
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'admin-edit-user-profile/:uid',
        loadChildren: () => import('./pages/user/user-profile.module').then(m => m.UserModule),
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'admin-more/special-ops',
        loadChildren: () => import('./pages/admin-special-ops/admin-special-ops.module').then(m => m.AdminSpecialOpsModule),
        canActivate: [AdminAuthGuard]
      },
      {
        path: 'admin-more/uploader',
        loadChildren: () => import('./pages/admin-uploader/admin.uploader.module').then(m => m.AdminUploaderModule),
        canActivate: [AdminAuthGuard]
      }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled', // removes blinking during page loading
      useHash: false,
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      scrollOffset: [0, 64],
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
