import { Component, OnInit, Inject, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { Event } from '../entity/event/event.model';
import { EventFirebaseService } from '../event-firebase.service';
import { AuthService } from '../auth.service';
import { UserFirebaseService } from '../user-firebase.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatStepper } from '@angular/material';
import { GeoCodingApiService } from '../geo-coding-api.service';
import { User, EventAddress } from '../entity/user/user';
import { WallService } from '../wall.service';
import { ToastrService } from 'ngx-toastr';
import { GeoCoord } from 'ng2-haversine';
import { TranslateService } from '@ngx-translate/core';

export interface DialogData {
  animal: string;
  name: string;
}

export function nameValueDictionaryFromObject(values: any): any {
  return Object.keys(values).map(function(key) {
    return Object.create({
      value: key.toLowerCase(),
      name: values[key]
    })
  });
}

@Component({
  selector: 'create-new-event',
  templateUrl: './create-new-event.component.html',
  styleUrls: ['./create-new-event.component.css']
})

export class CreateNewEventComponent implements OnInit {
  @ViewChild('stepper', {static: false}) stepper: MatStepper;

  onEventSaved: EventEmitter<Event> = new EventEmitter<Event>();
  onEventCreated: EventEmitter<string> = new EventEmitter<string>();

  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  fourthFormGroup: FormGroup;
  fifthFormGroup: FormGroup;
  isPaymentDeadlineDate = false;
  displayMobilePayInput = false;
  displayAccountNumberInput = false;
  isTransferingMoney = false;
  categories: any;
  genderOptions: any;
  childrenOptions: any;
  waitingListOptions: any;

  apiZipValue = "By";
  geoCoord: GeoCoord;
  lookupCity;
  eventData: Event = new Event({});

  isPreviewing = false;
  hasPrice = false;
  previews = [];

  // Date validation
  dateNow = new Date();
  minDate = new Date();
  maxDate = new Date(this.minDate.getFullYear() + 1, this.minDate.getMonth(), this.minDate.getDay());
  eventDate = new Date();
  maxRegistrationDate = new Date();
  user$: any;



  constructor(
    private efbs: EventFirebaseService, private authService: AuthService,
    private ufbs: UserFirebaseService,
    public dialogRef: MatDialogRef<CreateNewEventComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder, private geoAPI: GeoCodingApiService,
    private ws: WallService, private toast: ToastrService,
    private translateService: TranslateService,
    private cdRef: ChangeDetectorRef
  ) {

    this.translateService.get("COMPONENTS.NEW_EVENT.WHAT_AND_WHERE_STEP.CATEGORIES").subscribe(values => {
      this.categories = nameValueDictionaryFromObject(values);
    });

    this.translateService.get("COMPONENTS.NEW_EVENT.AUDIENCE_STEP.GENDER_OPTIONS").subscribe(values => {
      this.genderOptions = nameValueDictionaryFromObject(values);
    });

    this.translateService.get("COMPONENTS.NEW_EVENT.AUDIENCE_STEP.CHILDREN_OPTIONS").subscribe(values => {
      this.childrenOptions = nameValueDictionaryFromObject(values);
    });

    this.translateService.get("COMPONENTS.NEW_EVENT.AUDIENCE_STEP.WAITING_LIST_OPTIONS").subscribe(values => {
      this.waitingListOptions = nameValueDictionaryFromObject(values);
    });

    this.eventDate.setDate(this.dateNow.getDate() + 7);

  }

  changeEventDate(event) {
    this.maxRegistrationDate.setDate(event.target.value.getDate());
  }

  ngOnInit() {
    const event: Event = this.data.event;
    this.apiZipValue = event.address.city;
    this.maxRegistrationDate = new Date(event.dateStart);

    this.firstFormGroup = this._formBuilder.group({
      eventName: [event.name, Validators.required],
      eventDescription: [event.description],
      eventLocationStreet: [event.address.street, Validators.required],
      eventLocationCity: [event.address.city, Validators.required],
      eventLocationZip: [event.address.zip, Validators.required],
      eventCategory: [event.category, Validators.required],
      geoCoord: [event.geoCoord, Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      eventTargetGroup: [event.targetGroup || 'any', Validators.required],
      eventMinAge: [event.minAge || '18', [Validators.required, Validators.min(1), Validators.max(100)]],
      eventMaxAge: [event.maxAge || '100', [Validators.required, Validators.min(1), Validators.max(100)]],
      eventMinGuests: [event.minGuests || '2', [Validators.required, Validators.min(1), Validators.max(100)]],
      eventMaxGuests: [event.maxGuests || '8', [Validators.required, Validators.min(1), Validators.max(1000)]],
      eventGender: [event.genderRatio || 'any', Validators.required],
      eventQueue: [event.queue || 'no', Validators.required]
    });
    this.thirdFormGroup = this._formBuilder.group({
      eventDate: [new Date(event.dateStart) || this.eventDate, Validators.required],
      eventStartTime: [event.timeStart || '18:00', Validators.required],
      eventEndTime: [event.timeEnd || '22:00', Validators.required],
      eventDeadlineDate: [new Date(event.deadlineDate) || this.maxRegistrationDate, Validators.required],
      eventDeadlineTime: [event.deadlineTime || event.timeStart || '23:59']
    });
    this.fourthFormGroup = this._formBuilder.group({
      eventPrice: [event.price || '', [Validators.required, Validators.max(100000)]],
      eventPaymentOption: [event.paymentOption || '', Validators.required],
      eventPaymentDue: [event.paymentDue || ''],
      eventPaymentDate: [new Date(event.paymentDate) || ''],
      eventMobilePayNumber: [event.mobilePayNumber || ''],
      eventAccountNumber: [event.accountNumber || '']
    });
    this.fifthFormGroup = this._formBuilder.group({
      eventFile: ['', Validators.required],
    });
    // this.stepper.selectedIndex = this.data.stepIndex;

    this.cdRef.detectChanges();

  }

  onNextStep(event) {
    const control = event.previouslySelectedStep.stepControl;
    if (control) {
      this.updateEventData(control.value);
    }
  }

  onWhenPayChange(value) {
    if (value === "Dato") {
      this.isPaymentDeadlineDate = true;
    }
    else {
      this.isPaymentDeadlineDate = false;
    }
  }

  onPaymentOptionChange(value) {
    if (value === 'Mobilepay') {
      this.displayMobilePayInput = true;
      this.isTransferingMoney = true;
      this.displayAccountNumberInput = false;

      this.user$ = this.ufbs.getUserByID(this.authService.afAuth.auth.currentUser.uid).subscribe((user: User) => {
        this.fourthFormGroup.patchValue({
          eventMobilePayNumber: user.phone
        });
      });


    } else if (value === 'Bankoverførelse') {
      this.displayAccountNumberInput = true;
      this.isTransferingMoney = true;
      this.displayMobilePayInput = false;
    } else {
      this.displayMobilePayInput = false;
      this.displayAccountNumberInput = false;
      this.isTransferingMoney = false;
    }
  }

  onSubmitEvent(eventType:string = 'save') {
    let observer = this.ufbs.getUserByID(this.authService.afAuth.auth.currentUser.uid).subscribe((userSnapshot: any) => {
      let e: Event = this.formDataToModel(userSnapshot);
      e.published = (eventType == 'publish');
      if (!this.data.eventKey) {
        this.efbs.insertEvent(e).then((thenableRef) => {
          let key = thenableRef.key;
          this.ws.insertWall({ fk_event: key, posts: {} });
          this.onEventCreated.emit(key)
        });
      } else {
        this.efbs.updateEvent(this.data.eventKey, e).then(() => this.onEventSaved.emit(e));
      }
    });
  }

  updateEventData(newData) {

    this.eventData.name = (newData.eventName !== undefined) ? newData.eventName : this.eventData.name;
    this.eventData.address = new EventAddress(newData.eventLocationStreet,
    this.apiZipValue, newData.eventLocationZip);
    this.eventData.category = (newData.eventCategory !== undefined) ? newData.eventCategory : this.eventData.category;
    this.eventData.description = (newData.eventDescription !== undefined) ? newData.eventDescription : this.eventData.description;
    this.eventData.geoCoord = (newData.geoCoord !== undefined) ? newData.geoCoord : this.eventData.geoCoord;

    this.eventData.dateStart = (newData.eventDate !== undefined) ? newData.eventDate : this.eventData.dateStart;
    this.eventData.deadlineDate = (newData.eventDeadlineDate !== undefined) ? newData.eventDeadlineDate : this.eventData.deadlineDate
    this.eventData.deadlineTime = (newData.eventDeadlineTime !== undefined) ? newData.eventDeadlineTime : this.eventData.deadlineTime;
    this.eventData.timeEnd = (newData.eventEndTime !== undefined) ? newData.eventEndTime : this.eventData.timeEnd;
    this.eventData.timeStart = (newData.eventStartTime !== undefined) ? newData.eventStartTime : this.eventData.timeStart;

    this.eventData.paymentDate = (newData.eventPaymentDate !== undefined) ? newData.eventPaymentDate : this.eventData.paymentDate;
    this.eventData.paymentDue = (newData.eventPaymentDue !== undefined) ? newData.eventPaymentDue : this.eventData.paymentDue;
    this.eventData.paymentOption = (newData.eventPaymentOption !== undefined) ? newData.eventPaymentOption : this.eventData.paymentOption;
    this.eventData.price = (newData.eventPrice !== undefined) ? newData.eventPrice : this.eventData.price;
    this.eventData.mobilePayNumber = (newData.eventMobilePayNumber !== undefined) ? newData.eventMobilePayNumber : this.eventData.mobilePayNumber;
    this.eventData.accountNumber = (newData.eventAccountNumber !== undefined) ? newData.eventAccountNumber : this.eventData.accountNumber;

    this.eventData.file = this.fifthFormGroup.value.eventFile;

    this.eventData.genderRatio = (newData.eventGender !== undefined) ? newData.eventGender : this.eventData.genderRatio;
    // this.eventData.hostRating = userSnapshot.rating;
    this.eventData.maxAge = (newData.eventMaxAge !== undefined) ? newData.eventMaxAge : this.eventData.maxAge;
    this.eventData.minAge = (newData.eventMinAge !== undefined) ? newData.eventMinAge : this.eventData.minAge;
    this.eventData.maxGuests = (newData.eventMaxGuests !== undefined) ? newData.eventMaxGuests : this.eventData.maxGuests;
    this.eventData.minGuests = (newData.eventMinGuests !== undefined) ? newData.eventMinGuests : this.eventData.minGuests;
    this.eventData.queue = (newData.eventQueue !== undefined) ? newData.eventQueue : this.eventData.queue;
    this.eventData.targetGroup = (newData.eventTargetGroup !== undefined) ? newData.eventTargetGroup : this.eventData.targetGroup;

    // this.eventData.participants = [{ username: userSnapshot.username }];

    this.eventData.host = this.authService.afAuth.auth.currentUser.uid;

    if (this.eventData.hostRating === undefined) {
      this.eventData.hostRating = 0;
    }

    if (this.eventData.paymentOption == "Kontant") {
      this.eventData.paymentDue = "Kontant ved ankomst på dagen";
    }

  }

  formDataToModel(userSnapshot): Event {

    const event = new Event({});

    event.name = this.firstFormGroup.value.eventName;
    event.address = new EventAddress(this.firstFormGroup.value.eventLocationStreet,
      this.apiZipValue, this.firstFormGroup.value.eventLocationZip);
    event.category = this.firstFormGroup.value.eventCategory;
    event.description = this.firstFormGroup.value.eventDescription;
    event.geoCoord = this.firstFormGroup.value.geoCoord;

    event.dateStart = this.thirdFormGroup.value.eventDate.getTime();
    event.deadlineDate = this.thirdFormGroup.value.eventDeadlineDate.getTime();
    event.deadlineTime = this.thirdFormGroup.value.eventDeadlineTime;
    event.timeEnd = this.thirdFormGroup.value.eventEndTime;
    event.timeStart = this.thirdFormGroup.value.eventStartTime;

    event.paymentDate = this.fourthFormGroup.value.eventPaymentDate.getTime() || this.thirdFormGroup.value.eventDate.getTime();
    event.paymentDue = this.fourthFormGroup.value.eventPaymentDue;
    event.paymentOption = this.fourthFormGroup.value.eventPaymentOption;
    event.price = this.fourthFormGroup.value.eventPrice;
    event.mobilePayNumber = this.fourthFormGroup.value.eventMobilePayNumber;
    event.accountNumber = this.fourthFormGroup.value.eventAccountNumber;

    event.file = this.fifthFormGroup.value.eventFile;

    event.genderRatio = this.secondFormGroup.value.eventGender;
    event.hostRating = userSnapshot.rating;
    event.maxAge = this.secondFormGroup.value.eventMaxAge;
    event.minAge = this.secondFormGroup.value.eventMinAge;
    event.maxGuests = this.secondFormGroup.value.eventMaxGuests;
    event.minGuests = this.secondFormGroup.value.eventMinGuests;
    event.queue = this.secondFormGroup.value.eventQueue;
    event.targetGroup = this.secondFormGroup.value.eventTargetGroup;

    event.participants = [{ username: userSnapshot.username }];

    event.host = this.authService.afAuth.auth.currentUser.uid;

    if (event.hostRating === undefined) {
      event.hostRating = 0;
    }

    if (this.eventData.paymentOption == "Kontant") {
      event.paymentDue = "Kontant ved ankomst på dagen";
    }

    this.onNoClick();
    return event;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  lookUpZip(event) {
    if ((event.target.value as string).length > 3) {
      this.geoAPI.getZipFromCity(event.target.value).map(response => response.json()).subscribe(result => {
        this.geoCoord = {
          latitude: result.visueltcenter[1],
          longitude: result.visueltcenter[0]
        };
        this.apiZipValue = result.navn;
      });
    }
  }

  displayPreview() {
    this.previews.push({ label: 'Titel', body: this.firstFormGroup.value.eventName });
    this.previews.push({ label: 'Beskrivelse', body: this.firstFormGroup.get('eventDescription').value });
    this.previews.push({ label: 'Kategori', body: this.firstFormGroup.get('eventCategory').value });
    this.previews.push({
      label: 'Adresse', body: `
                                                ${this.firstFormGroup.get('eventLocationStreet').value},
                                                ${this.firstFormGroup.get('eventLocationZip').value},
                                                ${this.apiZipValue} `
    });
    this.previews.push({ label: 'Kønsfordeling', body: this.secondFormGroup.value.genderRatio });
    this.previews.push({ label: 'Børn', body: this.secondFormGroup.value.eventTargetGroup });
    this.previews.push({ label: 'Aldersgruppe', body: `${this.secondFormGroup.value.eventMinAge} til ${this.secondFormGroup.value.eventMaxAge}` });
    this.previews.push({ label: 'Antal gæster', body: `${this.secondFormGroup.value.eventMinGuests} til ${this.secondFormGroup.value.eventMaxGuests}` });
    this.previews.push({ label: 'Tving på venteliste', body: this.secondFormGroup.value.eventQueue });
    this.previews.push({ label: 'Dato for eventet', body: this.thirdFormGroup.value.eventDateStart });
    this.previews.push({ label: 'Tidspunkt for eventet', body: this.thirdFormGroup.value.eventTimeStart });
    this.previews.push({ label: 'Tilmeldingsfrist dato', body: this.thirdFormGroup.value.eventDeadlineDate });
    this.previews.push({ label: 'Tilmeldingsfrist tid', body: this.thirdFormGroup.value.eventDeadlineTime });
    this.previews.push({ label: 'Pris', body: this.fourthFormGroup.value.eventPrice });
    this.previews.push({ label: 'Betalingsform', body: this.fourthFormGroup.value.eventPaymentOption });
    this.previews.push({ label: 'Hvornår betales der', body: this.fourthFormGroup.value.eventPaymentDate });
    this.isPreviewing = true;
  }

  phoneValidation(eventTargetValue) {
    if (!/^\d+$/.test(eventTargetValue) && eventTargetValue !== "") {
      this.toast.toastrConfig.positionClass = "toast-bottom-center";
      this.toast.warning("🤖 Jeg er ret sikker på at telefonnumre ikke har bogstaver.");
      this.toast.toastrConfig.positionClass = "toast-top-right";
    }
  }

  accountNumberValidation(eventTargetValue) {
    if (!/^\d+$/.test(eventTargetValue) && eventTargetValue !== "") {
      this.toast.toastrConfig.positionClass = "toast-bottom-center";
      this.toast.warning("🤖 Ifølge bankerne i Danmark, så er bogstaver endnu ikke en del af kontonumre");
      this.toast.toastrConfig.positionClass = "toast-top-right";
    }
  }

  onPriceEnter(eventTargetValue) {
    this.hasPrice = eventTargetValue > 0;
  }

}
