import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AlertModule } from 'ngx-bootstrap/alert';
// import { DxVectorMapModule } from 'devextreme-angular';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { EditorModule } from '@tinymce/tinymce-angular';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { NgAisModule } from 'angular-instantsearch';
import { VgCoreModule } from 'videogular2/compiled/core';
import { VgControlsModule } from 'videogular2/compiled/controls';
// import { VgOverlayPlayModule } from 'videogular2/compiled/overlay-play';
// import { VgBufferingModule } from 'videogular2/compiled/buffering';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
// import { VectorMapComponent1 } from './vector-map/vector-map.component';
import { PictureUploadComponent } from './picture-upload/picture-upload.component';
import { AuthNavbarComponent } from './auth-navbar/auth-navbar.component';
import { FixedPluginComponent } from './fixed-plugin/fixed-plugin.component';
import { PageFooterComponent } from './page-footer/page-footer.component';
import { ProfileWizardComponent } from './profile-wizard/profile.wizard.component';
import { ContactComponent } from './contact/contact.component';
import { ResultsComponent } from './results/results.component';
import { CoachCardComponent } from './coach-card/coach-card.component';
import { NavigatorComponent } from './navigator/navigator.component';
import { SearchFilterUiComponent } from './search-filter-ui/search-filter-ui.component';
import { BotlinksComponent } from './botlinks/botlinks.component';
import { CoachContactComponent } from './coach-contact/coach-contact.component';
import { ChatroomsComponent } from './chatrooms/chatrooms.component';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatFeedComponent } from './chat-feed/chat-feed.component';
import { ChatMsgComponent } from './chat-msg/chat-msg.component';
import { LoginInFlowComponent } from './login-in-flow/login-in-flow.component';
import { ChatFormComponent } from './chat-form/chat-form.component';
import { ProfileVideoUploaderComponent } from '../components/profile-video-uploader/profile-video-uploader.component';
import { ProfileVideoUploadTaskComponent } from '../components/profile-video-upload-task/profile-video-upload-task.component';
import { SelectCurrencyComponent } from './select-currency/select-currency.component';
import { NewCourseComponent } from './new-course/new-course.component';
import { NewProgramComponent } from './new-program/new-program.component';
import { CourseSectionComponent } from './course-section/course-section.component';
import { CourseLecturesNavigatorComponent } from './course-lectures-navigator/course-lectures-navigator.component';
import { CourseLectureComponent } from './course-lecture/course-lecture.component';
import { CourseLandingPageComponent } from './course-landing-page/course-landing-page.component';
import { CoursePricingComponent } from './course-pricing/course-pricing.component';
import { CourseVideoUploadTaskComponent } from './course-video-upload-task/course-video-upload-task.component';
import { CourseVideoUploaderComponent } from './course-video-uploader/course-video-uploader.component';

import { ScrollableDirective } from '../directives/scrollable.directive';
import { DropzoneDirective } from '../directives/dropzone.directive';

import { FilterLecturesPipe } from '../pipes/filter-lectures.pipe';
import { CourseVideoLibraryComponent } from './course-video-library/course-video-library.component';
import { CourseSubmitComponent } from './course-submit/course-submit.component';
import { CoursePromoVideoUploaderComponent } from './course-promo-video-uploader/course-promo-video-uploader.component';
import { CoursePromoVideoUploadTaskComponent } from './course-promo-video-upload-task/course-promo-video-upload-task.component';
import { CourseSearchFilterUiComponent } from './course-search-filter-ui/course-search-filter-ui.component';
import { CourseResultsComponent } from './course-results/course-results.component';
import { CourseBotlinksComponent } from './course-botlinks/course-botlinks.component';
import { CourseCardComponent } from './course-card/course-card.component';
import { StarReviewComponent } from './star-review/star-review.component';
import { StarsComponent } from './stars/stars.component';
import { CourseContentsComponent } from './course-contents/course-contents.component';
import { CourseCoachComponent } from './course-coach/course-coach.component';
import { CourseFeedbackComponent } from './course-feedback/course-feedback.component';
import { CourseBrowseReviewsComponent } from './course-browse-reviews/course-browse-reviews.component';
import { LearnLecturesNavigatorComponent } from './learn-lectures-navigator/learn-lectures-navigator.component';
import { AuthCourseNavbarComponent } from './auth-course-navbar/auth-course-navbar.component';
import { CourseResourceUploaderComponent } from './course-resource-uploader/course-resource-uploader.component';
import { CourseResourceUploadTaskComponent } from './course-resource-upload-task/course-resource-upload-task.component';
import { CourseQaComponent } from './course-qa/course-qa.component';
import { CourseQaResultsComponent } from './course-qa-results/course-qa-results.component';
import { CourseQaSearchFiltersComponent } from './course-qa-search-filters/course-qa-search-filters.component';
import { CoursePromoteComponent } from './course-promote/course-promote.component';
import { DiscussionFeedComponent } from './discussion-feed/discussion-feed.component';
import { DiscussionReplyComponent } from './discussion-reply/discussion-reply.component';
import { DiscussionsComponent } from './discussions/discussions.component';
import { DiscussionComponent } from './discussion/discussion.component';
import { DiscussionReplyFormComponent } from './discussion-reply-form/discussion-reply-form.component';
import { CourseMoreComponent } from './course-more/course-more.component';
import { AdminVideoUploaderComponent } from './admin-video-uploader/admin-video-uploader.component';
import { AdminVideoUploadTaskComponent } from './admin-video-upload-task/admin-video-upload-task.component';

// Angular calendar: https://github.com/mattlewis92/angular-calendar#getting-started
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarHeaderComponent } from './calendar-header/calendar-header.component';
import * as moment from 'moment';
import { PersonHistoryTimelineComponent } from './person-history-timeline/person-history-timeline.component';
import { ProgramOutlineComponent } from './program-outline/program-outline.component';
import { ProgramLandingPageComponent } from './program-landing-page/program-landing-page.component';
import { ProgramPromoVideoUploaderComponent } from './program-promo-video-uploader/program-promo-video-uploader.component';
import { ProgramPromoVideoUploadTaskComponent } from './program-promo-video-upload-task/program-promo-video-upload-task.component';
import { ProgramSubmitComponent } from './program-submit/program-submit.component';
import { ProgramPromoteComponent } from './program-promote/program-promote.component';
import { ProgramStarsComponent } from './program-stars/program-stars.component';
import { ProgramCoachComponent } from './program-coach/program-coach.component';
import { ProgramFeedbackComponent } from './program-feedback/program-feedback.component';
import { ProgramBrowseReviewsComponent } from './program-browse-reviews/program-browse-reviews.component';
import { ProgramContentComponent } from './program-content/program-content.component';
import { ProgramMoreComponent } from './program-more/program-more.component';
import { VideoSessionCardComponent } from './video-session-card/video-session-card.component';
import { ProgramSearchFilterUiComponent } from './program-search-filter-ui/program-search-filter-ui.component';
import { ProgramResultsComponent } from './program-results/program-results.component';
import { ProgramCardComponent } from './program-card/program-card.component';
import { ProgramBotlinksComponent } from './program-botlinks/program-botlinks.component';
import { CoachInviteComponent } from './coach-invite/coach-invite.component';
import { ScheduleCallComponent } from './schedule-call/schedule-call.component';
import { SessionManagerComponent } from './session-manager/session-manager.component';

export function momentAdapterFactory() {
  return adapterFactory(moment);
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    JwBootstrapSwitchNg2Module,
    // DxVectorMapModule,
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    ModalModule.forRoot(),
    ProgressbarModule.forRoot(),
    AngularMultiSelectModule,
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
    AlertModule.forRoot(),
    MatFormFieldModule,
    MatChipsModule,
    EditorModule,
    RecaptchaModule,
    RecaptchaFormsModule,
    MatStepperModule,
    NgAisModule.forRoot(),
    VgCoreModule,
    VgControlsModule,
    DragDropModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: momentAdapterFactory }),
  ],
  declarations: [
    FooterComponent,
    // VectorMapComponent1,
    NavbarComponent,
    SidebarComponent,
    PictureUploadComponent,
    AuthNavbarComponent,
    FixedPluginComponent,
    PageFooterComponent,
    ProfileWizardComponent,
    ContactComponent,
    ResultsComponent,
    CoachCardComponent,
    NavigatorComponent,
    SearchFilterUiComponent,
    BotlinksComponent,
    CoachContactComponent,
    ChatroomsComponent,
    ChatConversationComponent,
    ChatFeedComponent,
    ChatMsgComponent,
    LoginInFlowComponent,
    ChatFormComponent,
    ScrollableDirective,
    DropzoneDirective,
    ProfileVideoUploaderComponent,
    ProfileVideoUploadTaskComponent,
    SelectCurrencyComponent,
    NewCourseComponent,
    CourseSectionComponent,
    CourseLecturesNavigatorComponent,
    CourseLectureComponent,
    FilterLecturesPipe,
    CourseLandingPageComponent,
    CoursePricingComponent,
    CourseVideoUploadTaskComponent,
    CourseVideoUploaderComponent,
    CourseVideoLibraryComponent,
    CourseSubmitComponent,
    CoursePromoVideoUploaderComponent,
    CoursePromoVideoUploadTaskComponent,
    CourseSearchFilterUiComponent,
    CourseResultsComponent,
    CourseBotlinksComponent,
    CourseCardComponent,
    StarReviewComponent,
    StarsComponent,
    CourseContentsComponent,
    CourseCoachComponent,
    CourseFeedbackComponent,
    CourseBrowseReviewsComponent,
    LearnLecturesNavigatorComponent,
    AuthCourseNavbarComponent,
    CourseResourceUploaderComponent,
    CourseResourceUploadTaskComponent,
    CourseQaComponent,
    CourseQaResultsComponent,
    CourseQaSearchFiltersComponent,
    CoursePromoteComponent,
    DiscussionFeedComponent,
    DiscussionReplyComponent,
    DiscussionsComponent,
    DiscussionComponent,
    DiscussionReplyFormComponent,
    CourseMoreComponent,
    CalendarComponent,
    CalendarHeaderComponent,
    PersonHistoryTimelineComponent,
    AdminVideoUploaderComponent,
    AdminVideoUploadTaskComponent,
    VideoSessionCardComponent,
    AdminVideoUploadTaskComponent,
    NewProgramComponent,
    ProgramOutlineComponent,
    ProgramLandingPageComponent,
    ProgramPromoVideoUploaderComponent,
    ProgramPromoVideoUploadTaskComponent,
    ProgramSubmitComponent,
    ProgramPromoteComponent,
    ProgramStarsComponent,
    ProgramCoachComponent,
    ProgramFeedbackComponent,
    ProgramBrowseReviewsComponent,
    ProgramContentComponent,
    ProgramMoreComponent,
    ProgramSearchFilterUiComponent,
    ProgramResultsComponent,
    ProgramCardComponent,
    ProgramBotlinksComponent,
    CoachInviteComponent,
    ScheduleCallComponent,
    SessionManagerComponent
  ],
  exports: [
    TabsModule,
    FooterComponent,
    // VectorMapComponent1,
    NavbarComponent,
    SidebarComponent,
    PictureUploadComponent,
    AuthNavbarComponent,
    FixedPluginComponent,
    PageFooterComponent,
    ProfileWizardComponent,
    ContactComponent,
    AngularMultiSelectModule,
    JwBootstrapSwitchNg2Module,
    TooltipModule,
    AlertModule,
    EditorModule,
    ResultsComponent,
    CoachCardComponent,
    NavigatorComponent,
    SearchFilterUiComponent,
    BotlinksComponent,
    CoachContactComponent,
    ChatroomsComponent,
    ChatConversationComponent,
    ChatFeedComponent,
    ChatMsgComponent,
    ChatFormComponent,
    LoginInFlowComponent,
    ScrollableDirective,
    DropzoneDirective,
    ProfileVideoUploaderComponent,
    ProfileVideoUploadTaskComponent,
    ModalModule,
    SelectCurrencyComponent,
    NgAisModule,
    VgCoreModule,
    VgControlsModule,
    NewCourseComponent,
    CourseSectionComponent,
    CourseLecturesNavigatorComponent,
    DragDropModule,
    CourseLectureComponent,
    FilterLecturesPipe,
    CourseLandingPageComponent,
    CoursePricingComponent,
    CourseVideoUploadTaskComponent,
    CourseVideoUploaderComponent,
    CourseVideoLibraryComponent,
    CourseSubmitComponent,
    PaginationModule,
    CoursePromoVideoUploaderComponent,
    CoursePromoVideoUploadTaskComponent,
    CourseSearchFilterUiComponent,
    CourseResultsComponent,
    CourseBotlinksComponent,
    CourseCardComponent,
    StarReviewComponent,
    StarsComponent,
    CourseContentsComponent,
    CourseCoachComponent,
    CourseFeedbackComponent,
    CourseBrowseReviewsComponent,
    LearnLecturesNavigatorComponent,
    AuthCourseNavbarComponent,
    ProgressbarModule,
    CourseResourceUploaderComponent,
    CourseResourceUploadTaskComponent,
    CourseQaComponent,
    CourseQaResultsComponent,
    CourseQaSearchFiltersComponent,
    CoursePromoteComponent,
    DiscussionFeedComponent,
    DiscussionReplyComponent,
    DiscussionsComponent,
    DiscussionComponent,
    DiscussionReplyFormComponent,
    CourseMoreComponent,
    CalendarModule,
    CalendarComponent,
    CalendarHeaderComponent,
    PersonHistoryTimelineComponent,
    AdminVideoUploaderComponent,
    AdminVideoUploadTaskComponent,
    VideoSessionCardComponent,
    AdminVideoUploadTaskComponent,
    NewProgramComponent,
    ProgramOutlineComponent,
    ProgramLandingPageComponent,
    ProgramPromoVideoUploaderComponent,
    ProgramPromoVideoUploadTaskComponent,
    ProgramSubmitComponent,
    ProgramPromoteComponent,
    ProgramStarsComponent,
    ProgramCoachComponent,
    ProgramFeedbackComponent,
    ProgramBrowseReviewsComponent,
    ProgramContentComponent,
    ProgramMoreComponent,
    ProgramSearchFilterUiComponent,
    ProgramResultsComponent,
    ProgramCardComponent,
    ProgramBotlinksComponent,
    BsDropdownModule,
    CoachInviteComponent,
    ScheduleCallComponent,
    SessionManagerComponent
  ],
  entryComponents: [
    SessionManagerComponent
  ]
})
export class ComponentsModule {}
