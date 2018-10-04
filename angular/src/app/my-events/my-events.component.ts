import { Component, OnInit, ViewChild  } from '@angular/core';
import { Observable } from '../../../node_modules/rxjs';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { EventFirebaseService } from '../event-firebase.service';
import { MobileDetectorService } from '../mobile-detector.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserFirebaseService } from '../user-firebase.service';
import { Event } from '../entity/event/event.model';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

export interface EventData {
  name: string;
  address: string;
  distance: number;
  genderRatio: string;
  targetGroup: boolean;
  available: number;
  actions: string;
}

export interface EventDataMobile {
  name: string;
  address: string;
  available: number;
  actions: string;
}

@Component({
  selector: 'my-events',
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.css']
})
export class MyEventsComponent implements OnInit {

  isMobile = false;

  dataSource = new MatTableDataSource<EventData>();
  displayedColumns = ['name', 'address', 'distance', 'category', 'genderRatio', 'targetGroup', 'available', 'actions'];
  dataSourceMobile = new MatTableDataSource<EventDataMobile>();
  displayedColumnsMobile = ['name', 'address', 'available', 'actions'];

  events = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private efbs: EventFirebaseService, private mds: MobileDetectorService, 
    private spinner: NgxSpinnerService, private ufbs: UserFirebaseService, 
    public dialog: MatDialog) {
      this.efbs.getEventsByHost(this.ufbs.getStorage().email).subscribe(res => {
        this.events = res;
        this.dataSource = new MatTableDataSource(this.events);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.dataSourceMobile = new MatTableDataSource(this.events);
      this.dataSourceMobile.paginator = this.paginator;
      this.dataSourceMobile.sort = this.sort;
      this.spinner.hide();
      });
    }

  ngOnInit() {
    this.spinner.show();
    this.isMobile = this.mds.check();
  }

  onEditClick(element) {
    let e: Event = element;
    this.efbs.myEventSelection = e;
  }

  onDeleteClick(element) {
    this.efbs.deleteEvent(element.key);
  }

  openDialog(element): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {key: element.key, buttonNo: "For Guds skyld nej!", buttonYes: "Ja", dialogText: "Er du sikker på at du vil slette dette event?"}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
