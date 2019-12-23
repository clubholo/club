import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router, } from "@angular/router";
import { Event } from '../../entity/event/event.model';
import { EventFirebaseService } from '../../event-firebase.service';
import { UserFirebaseService } from '../../user-firebase.service';
import { MatDialog } from '@angular/material';
import { MobileDetectorService } from '../../mobile-detector.service';
import { AuthService } from '../../auth.service';
import { User } from '../../entity/user/user';
import { WallService } from '../../wall.service';
import { Wall } from '../../entity/wall/wall.model';
import { WallPost } from '../../entity/wall/wall-post.model';
import { CreateWallPostComponent } from '../../create-wall-post/create-wall-post.component';
import { ToastrService } from 'ngx-toastr';
import { CreateNewEventComponent } from '../../create-new-event/create-new-event.component';
import { RatingService } from '../../rating.service';
import { EditEventPopupComponent } from '../edit-event-popup/edit-event-popup.component';

export interface DialogData {
  fk_wall: string;
}

export interface User {
  username: string;
}

@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.component.html',
  styleUrls: ['./view-event.component.css']
})
export class ViewEventComponent implements OnInit {

  isMobile = false;
  hasOptions = true;
  isParticipating = false;
  wasParticipating = false;
  isHost = false;
  host: User;
  eventRating = 0;
  eventRatingRemainderPercent = 0;
  hasRatedEvent = false;
  comments = [];
  scoreCount = 0;
  username;
  isPastEvent: boolean = false;

  selectedEvent = new Event({});
  key;
  pKey = "";
  participantsDisplayNames = [];
  participantsData = []
  ratings;
  
  // inQueue
  queueDisplayNames = [];
  queueData = [];

  // Wall
  wall = new Wall({});
  wallKey = "";
  // userNames = [];
  tempDate = new Date().toLocaleString();
  wallIsEmpty = true;

  hostName = "...HENTER VÆRTSNAVN...";


  constructor(
    private route: ActivatedRoute, 
    private efbs: EventFirebaseService, 
    private ufbs: UserFirebaseService, 
    private router: Router, 
    private md: MobileDetectorService, 
    private authService: AuthService, 
    private ws: WallService, 
    public dialog: MatDialog, 
    private toast: ToastrService,
    private ratingService: RatingService,
  ) { 
    this.ufbs.getUserByID(this.authService.afAuth.auth.currentUser.uid).subscribe( (userSnapshot:any) => {
      this.username = userSnapshot.username;

      this.route.queryParams.subscribe(params => {
        let key = params['key'];
        this.key = key;
        this.getDisplayData();
        this.getWall();
        this.showEventRating();
      });
    });
  }

  ngOnInit() {
    this.isMobile = this.md.check();
  }

  getParticipantKey(): Promise<string> {
    let isDone = false;
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < this.participantsData.length; i++) {
        const observerSeven = this.ufbs.getUserByID(this.authService.afAuth.auth.currentUser.uid).subscribe((userSnapshot:any) => {
        if (this.participantsData[i].username ===  userSnapshot.username || this.queueData[i].username === userSnapshot.username) {
            isDone = true;
            resolve(userSnapshot.username);
          } 
          observerSeven.unsubscribe();
        });
      }
      if (isDone) {
        resolve("Not Found");
      }
    });
  }

  removeParticipant() {
    let observerFour = this.ufbs.getUserByID(this.authService.afAuth.auth.currentUser.uid).subscribe(snapshot => {
      let u: User = new User(snapshot);
      for (let i = 0; i < this.participantsData.length; i++) {
        if (this.participantsData[i].username === u.username)  {
          this.participantsData.splice(i, 1);
          this.participantsDisplayNames.splice(i, 1);
        }
        if (this.queueDisplayNames[i].username === u.username) {
          this.queueData.splice(i, 1);
          this.queueDisplayNames.splice(i,1);
        }
      }
      observerFour.unsubscribe();
    });
  }

  onAttend() {
    const observer = this.ufbs.getUserByID(this.authService.afAuth.auth.currentUser.uid).subscribe( (user:any) => {
      this.efbs.signupVerification(this.key, user).then( resolve => {
        if (resolve) {
          this.isParticipating = true;
          this.getDisplayData();
        }  
      });
      observer.unsubscribe();
    });
  }

  onUnattend() {
    this.efbs.leaveEvent(this.key, this.authService.afAuth.auth.currentUser.uid);
    this.isParticipating = false;
    this.getDisplayData();
  }


  onRateClick() {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        "key": this.key
      }
    }
    let observerFive = this.ufbs.getUserByID(this.authService.afAuth.auth.currentUser.uid).subscribe( userSnapshot => {
      let u: User = new User(userSnapshot);
      if (this.participantsDisplayNames.includes(u.username)) {
        this.router.navigate(['/rate-event'], navigationExtras);
      } else {
        this.toast.warning('Du kan ikke rate et event, som du ikke har deltaget i','Hov!')
      }
      observerFive.unsubscribe();
    });
  }

  arrayOne(n: number): any[] {
    return Array(n);
  }

  showEventRating() {
    let observerTwo = this.ratingService.getRatings().subscribe(ratings => {
      this.ratings = ratings;
      let eventScore = 0;
        ratings.forEach(rating => {

          let payloadValue: any = rating.payload.val();


        if(payloadValue.fk_event === this.key) {
          if (payloadValue.feedback) {
            this.comments.push({score: payloadValue.score, feedback: payloadValue.feedback})
          }
          this.hasRatedEvent = (this.username == payloadValue.byUser) ? true : this.hasRatedEvent;
          eventScore += Number(payloadValue.score);
          this.scoreCount++;
        }
      });
      
      this.eventRating = (this.scoreCount) ? eventScore / this.scoreCount : 0;
      this.eventRatingRemainderPercent = (this.eventRating % 1) * 100;

      let hasAlreadyRated = this.ratings.find(rating => rating.key == this.username + this.selectedEvent.key);
      const userId = this.authService.afAuth.auth.currentUser.uid;
      this.wasParticipating = this.selectedEvent.dateStart <= Date.now() && this.selectedEvent.participants[userId] !== undefined && !hasAlreadyRated && !this.isHost;

      observerTwo.unsubscribe();
    });
  }

  rate() {
    let navigationExtras: NavigationExtras = {
      queryParams: {
        "key": this.key
      }
    }
    this.router.navigate(['/rate-event'], navigationExtras);
  }

  getStarPercentage() {
    return {
      'background': `linear-gradient(90deg, rgba(255,122,0,1) ${this.eventRatingRemainderPercent}%, 
        rgba(128,128,128,1) ${this.eventRatingRemainderPercent}%)`
    }
  }

  createWallPost(formData) {
    this.ws.insertPost(formData, this.key);
  }

  openWallPostDialog() {
    const dialogRef = this.dialog.open(CreateWallPostComponent, {
      width: '500px',
      data: {fk_wall: this.wallKey}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  deleteWallPost(postObj) {
    //this.wall.posts.splice(idx, 1);
    this.ws.deletePost(this.wallKey, Object.assign(postObj, WallPost));
  }

  // updateDisplayForWall() {
  //   /* Display usernames */
  //   this.userNames = [];
  //   this.wall.posts.forEach(post => {
  //     const observerSix = this.ufbs.getUserByID(post.fk_id).subscribe( (u:any) => {
  //       if (u !== null) {
  //         this.userNames.push(u.username);
  //       }
  //       observerSix.unsubscribe();
  //     });
  //   });
  // }

  getHostNameFromUID(uid: string) {
    return new Promise( (resolve, reject) => {
      let observer = this.ufbs.getUserByID(uid).subscribe( (snapshot:any) => {
        this.host = snapshot;
        resolve(snapshot.username);
        observer.unsubscribe();
      });
    });
  } 

  getDisplayData() {
    /* Event */
    let observerTwo = this.efbs.getEventByKey(this.key).snapshotChanges().subscribe(then => {
      this.renderParticipantsIntoView(then);
      this.renderParticipantsInQueueIntoView(then);
      /* Participation limited to one signup. */
      // this.getParticipantKey().then(resolved => {
        
      //   if (resolved !== "Not Found") {
      //     this.isParticipating = true;
      //   } else {
      //     this.isParticipating = false;
      //   }
      // });

      this.getHostNameFromUID(this.selectedEvent.host).then( (value:string) => {
        this.hostName = value;
      });
      
      this.isHost = this.authService.afAuth.auth.currentUser.uid == this.selectedEvent.host;

      if (this.selectedEvent.host === this.authService.afAuth.auth.currentUser.uid) {
        
        this.hasOptions = false;
      }
    });
  }

  getWall() {
    /* Wall */
    let observerThree = this.ws.getWallByKey(this.key).subscribe(wallSnapshot => {
      this.wall.posts = [];
      if (wallSnapshot.length > 0) {
        let wall: any = wallSnapshot[0];
        this.wallKey = wall.key;
        if (wall.posts) {
          console.log('p', wall.posts)
          Object.keys(wall.posts).forEach(key => {
            const wallPostObj = wall.posts[key];
            let observerFour = this.ufbs.getUserByID(wallPostObj.fk_id).subscribe( (userSnapshot:any) => {
              let mergedObj = {...wallPostObj, ...{username: userSnapshot.username, key}};
              
              this.wall.posts.push(mergedObj);
            });
          });
          this.wallIsEmpty = false;
        }
      } 
    });
  }

  renderParticipantsIntoView(then) {
    this.selectedEvent = new Event(then.payload.val());
    this.isPastEvent = this.selectedEvent.dateStart < Date.now();
    this.participantsData = [];
    this.participantsDisplayNames = [];
    for (let property in this.selectedEvent.participants) {
      for (let value in this.selectedEvent.participants[property]) {
            this.participantsDisplayNames.push(this.selectedEvent.participants[property][value]);
            this.participantsData.push({key: property, username: this.selectedEvent.participants[property][value]});
      }
    }
  }

  renderParticipantsInQueueIntoView(then) {
    this.selectedEvent = new Event(then.payload.val());
    this.queueData = [];
    this.queueDisplayNames = [];
    for (let property in this.selectedEvent.inQueue) {
      for (let value in this.selectedEvent.inQueue[property]) {
          this.queueDisplayNames.push(this.selectedEvent.inQueue[property][value]);
          this.queueData.push({key: property, username: this.selectedEvent.inQueue[property][value]});
      }
    }
  }

  editEvent() {
    this.dialog.open(CreateNewEventComponent, {
      width: screen.width / 1 + "px",
      data: {event: this.selectedEvent, stepIndex: 0, eventKey: this.key}
    });
  }

  publishEvent() {
    if (this.validateEvent(this.selectedEvent)) {
      this.selectedEvent.published = true;
      this.efbs.updateEvent(this.key, this.selectedEvent);
    } else {
      this.dialog.open(EditEventPopupComponent, {
        width: screen.width / 1.25 + "px",
        data: {event: this.selectedEvent, eventKey: this.key}
      });

    }
  }

  validateEvent(event: Event): boolean {
    return !!event.price
  }
}
