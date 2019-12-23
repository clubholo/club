import { Component, OnInit } from '@angular/core';
// Firebase
import { AngularFireDatabase } from '@angular/fire/database'; 
import { Observable } from 'rxjs/Observable';
import { EventFirebaseService } from '../event-firebase.service';

@Component({
  selector: 'dummy-list',
  templateUrl: './dummy-list.component.html',
  styleUrls: ['./dummy-list.component.css']
})
export class DummyListComponent implements OnInit {
  eventsObservable: Observable<any[]>;
  events: any[];

  constructor(
    private db: AngularFireDatabase,
    private efbs: EventFirebaseService,
    ) { }

  ngOnInit() {
    this.eventsObservable = this.efbs.getList();
  }

  getDummy(listPath): Observable<any[]> {
    return this.db.list(listPath).valueChanges();
  }
}
