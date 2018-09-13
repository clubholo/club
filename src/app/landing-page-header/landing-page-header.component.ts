import { Component, OnInit, Inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormGroup, FormControl } from '@angular/forms';
import { $ } from 'protractor';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { MobileLoginHeaderComponent } from '../mobile-login-header/mobile-login-header.component';

@Component({
  selector: 'landing-page-header',
  templateUrl: './landing-page-header.component.html',
  styleUrls: ['./landing-page-header.component.css']
})
export class LandingPageHeaderComponent implements OnInit {

  isMobile = false;
  hide: true;

  public loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl('')
});

  constructor(private authService: AuthService, public dialog: MatDialog) { }

  ngOnInit() {
    if (window.screen.width <= 600) {
      this.isMobile = true;
    }
  }

  tryLogin(formData) {
    this.authService.doLogin(formData);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(MobileLoginHeaderComponent, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed: ' + result);
    });
  }

}

