import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LandingPageComponent } from './landing-page/landing-page.component';
import { DummyListComponent} from './dummy-list/dummy-list.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import { LoggedinDashboardComponent } from './loggedin-dashboard/loggedin-dashboard.component';
import { EventsComponent } from './events/events.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { CreateNewEventComponent } from './create-new-event/create-new-event.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { TermsOfServiceComponent} from './terms-of-service/terms-of-service.component';
import { CookiesConsentComponent } from './cookies-consent/cookies-consent.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { MyEventsComponent } from './my-events/my-events.component';
import { PricesComponent } from './prices/prices.component';
import { PaymentComponent } from './payment/payment.component';
import { MyEventComponent } from './my-event/my-event.component';
import { PatchNotesComponent } from './patch-notes/patch-notes.component';
import { ViewEventComponent } from './events/view-event/view-event.component';
import { RateEventComponent } from './rate-event/rate-event.component';

import { AdminModule } from './admin/admin.module';
import { AuthGuard } from './core/auth.guard';
import { AttendedEventsComponent } from './attended-events/attended-events.component';
import { AttendingEventsComponent } from './attending-events/attending-events.component';
import { SignUpPageComponent } from './pages/sign-up-page/sign-up-page.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { WebinarsComponent } from './webinars/webinars.component';

const routes: Routes = [
  { path: 'landing-page', component: LandingPageComponent},
  { path: 'sign-up', component: SignUpPageComponent},
  { path: 'verify-email', component: VerifyEmailComponent},
  { path: 'loggedin-dashboard', component: LoggedinDashboardComponent, canActivate: [AuthGuard] },
  { path: 'events', component: EventsComponent, canActivate: [AuthGuard] },
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard] },
  { path: 'create-new-event', component: CreateNewEventComponent, canActivate: [AuthGuard] },
  { path: 'about', component: AboutComponent },
  { path: 'feedback', component: FeedbackComponent, canActivate: [AuthGuard] },
  { path: 'contact', component: ContactComponent },
  { path: 'terms-of-service', component: TermsOfServiceComponent},
  { path: 'cookies-consent', component: CookiesConsentComponent, canActivate: [AuthGuard] },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'my-events', component: MyEventsComponent, canActivate: [AuthGuard] },
  { path: 'prices', component: PricesComponent},
  { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard] },
  { path: 'webinars', component: WebinarsComponent, canActivate: [AuthGuard] },
  { path: 'my-event', component: MyEventComponent, canActivate: [AuthGuard] },
  { path: 'patch-notes', component: PatchNotesComponent, canActivate: [AuthGuard] },
  { path: 'view-event', component: ViewEventComponent, canActivate: [AuthGuard] },
  { path: 'rate-event', component: RateEventComponent, canActivate: [AuthGuard] },
  { path: 'attended-events', component: AttendedEventsComponent, canActivate: [AuthGuard] },
  { path: 'attending-events', component: AttendingEventsComponent, canActivate: [AuthGuard] },
  { path: 'admin-module', loadChildren: () => AdminModule, canActivate: [AuthGuard] },
  {
    path: 'dummy-list',
    component: DummyListComponent
  },
  { 
    path: '',
    component: EventsComponent, canActivate: [AuthGuard]
  },
  { path: '**', component: PageNotFoundComponent }
];

// export const ModuleRouting: ModuleWithProviders = RouterModule.forRoot(routes);
export const routingModule: ModuleWithProviders = RouterModule.forRoot(routes);

@NgModule({
  exports: [ RouterModule ],
  imports: [ RouterModule.forRoot(routes) ]
})
export class RoutingModule {}