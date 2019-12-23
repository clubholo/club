import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';


//Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';

//Environment
import { environment } from '../environments/environment';
import { AppNavbarComponent } from './lib/app-navbar/app-navbar.component';

//Ngb bootstrap
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Components
import { DummyListComponent } from './dummy-list/dummy-list.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoggedinDashboardComponent } from './loggedin-dashboard/loggedin-dashboard.component';
import { FooterComponent } from './footer/footer.component';
import { LandingPageHeaderComponent } from './landing-page-header/landing-page-header.component';
import { CreateAccountFormComponent } from './create-account-form/create-account-form.component';
import { MyEventComponent } from './my-event/my-event.component';
import { PatchNotesComponent } from './patch-notes/patch-notes.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { RateEventComponent } from './rate-event/rate-event.component';
import { MyEventsComponent } from './my-events/my-events.component';
import { PaymentComponent } from './payment/payment.component';
import { WebinarsComponent } from './webinars/webinars.component';
import { PricesComponent } from './prices/prices.component';
import { CreateNewEventComponent } from './create-new-event/create-new-event.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { UserImageGalleryComponent } from './user-image-gallery/user-image-gallery.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { CookiesConsentComponent } from './cookies-consent/cookies-consent.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { MobileLoginHeaderComponent } from './mobile-login-header/mobile-login-header.component';

// Routing
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RoutingModule, routingModule } from './routing.module'

// Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material and animation
import {
  MatButtonModule,
  MatNativeDateModule,
  MatCheckboxModule,
  MatProgressBarModule,
  MatCardModule,
  MatListModule,
  MatIconModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatChipsModule,
  MatSelectModule,
  MatGridListModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSortModule,
  MatTableModule,
  MatPaginatorModule,
  MatMenuModule,
  MatToolbarModule,
  MatTooltipModule,
  MatDialogModule,
  MatRadioModule,
  MatStepperModule,
  MatBadgeModule,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatDatepickerModule,
  MatTabsModule,
  DateAdapter,
  NativeDateAdapter
} from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'hammerjs';

// Modal gallery
import 'mousetrap'; // <------ mandatory dependency for angular-modal-gallery
import { ModalGalleryModule } from 'angular-modal-gallery';

// Font Awesome
import { AngularFontAwesomeModule } from 'angular-font-awesome';

// Web storage
import { AngularWebStorageModule } from 'angular-web-storage';

// Test suite
import { RouterTestingModule } from '@angular/router/testing';

// Pipes
import { ActiveBlockedPipe } from './pipes/active-blocked.pipe';

// Spinner
import { NgxSpinnerModule } from 'ngx-spinner';
import { AdminModule } from './admin/admin.module';
import { AuthGuard } from './core/auth.guard';
import { AuthService } from './auth.service';

// Toaster
import { ToastrModule } from 'ngx-toastr';
import { CreateWallPostComponent } from './create-wall-post/create-wall-post.component';
import { AttendedEventsComponent } from './attended-events/attended-events.component';

// HTTP
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { ParticipantListActionsComponent } from './participant-list-actions/participant-list-actions.component';
import { AttendingEventsComponent } from './attending-events/attending-events.component';

// Translations
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SignUpPageComponent } from './pages/sign-up-page/sign-up-page.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { EventsModule } from './events/events.module';
import { LibModule } from './lib/lib.module';
import { HaversineService } from "ng2-haversine";
import { EditEventControlsComponent } from './edit-event-controls/edit-event-controls.component';

// Translate loader factory
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/translations/', '.json');
}


export const MY_FORMATS = {
  parse: {
      dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
      dateInput: 'input',
      monthYearLabel: { year: 'numeric', month: 'numeric' },
      dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
      monthYearA11yLabel: { year: 'numeric', month: 'long' },
  }
};

export class AppDateAdapter extends NativeDateAdapter {

  format(date: Date, displayFormat: Object): string {

      if (displayFormat === 'input') {

          const day = date.getDate();
          const month = date.getMonth() + 1;
          const year = date.getFullYear();

          return `${day}/${month}/${year}`;
      }

      return date.toDateString();
  }
  
  getFirstDayOfWeek(): number {
    return 1;
  }

}

@NgModule({
  declarations: [
    AppComponent,
    DummyListComponent,
    LandingPageComponent,
    LoggedinDashboardComponent,
    PageNotFoundComponent,
    FooterComponent,
    LandingPageHeaderComponent,
    CreateAccountFormComponent,
    CreateNewEventComponent,
    EditEventControlsComponent,
    MyProfileComponent,
    ImageUploadComponent,
    UserImageGalleryComponent,
    FeedbackComponent,
    AboutComponent,
    ContactComponent,
    AboutComponent,
    ContactComponent,
    FeedbackComponent,
    TermsOfServiceComponent,
    CookiesConsentComponent,
    PrivacyPolicyComponent,
    ActiveBlockedPipe,
    MobileLoginHeaderComponent,
    MyEventsComponent,
    PaymentComponent,
    WebinarsComponent,
    PricesComponent,
    MyEventComponent,
    PatchNotesComponent,
    ConfirmationDialogComponent,
    RateEventComponent,
    CreateWallPostComponent,
    AttendedEventsComponent,
    ParticipantListActionsComponent,
    AttendingEventsComponent,
    SignUpPageComponent,
    VerifyEmailComponent
  ],
  entryComponents: [MobileLoginHeaderComponent, ConfirmationDialogComponent, CreateWallPostComponent, ParticipantListActionsComponent],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    EventsModule,
    LibModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTabsModule,
    ModalGalleryModule.forRoot(),
    AngularFontAwesomeModule,
    AngularWebStorageModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    MatInputModule,
    MatChipsModule,
    MatSelectModule,
    MatGridListModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDialogModule,
    MatRadioModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatBadgeModule,
    MatRadioModule,
    RouterTestingModule,
    NgxSpinnerModule,
    AdminModule,
    ToastrModule.forRoot(),
    RoutingModule,
    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  exports: [HttpClientModule, HttpModule],
  providers: [
    AuthGuard,
    AuthService,
    HttpClientModule,
    HttpModule,
    HaversineService,
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'da-DK' }
  ],
  bootstrap: [AppComponent]
})



export class AppModule { }
