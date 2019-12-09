import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MobileDetectorService } from '../mobile-detector.service';


@Component({
  selector: 'edit-event-controls',
  templateUrl: './edit-event-controls.component.html',
  styleUrls: ['./edit-event-controls.component.css']
})

export class EditEventControlsComponent implements OnInit {

  @Input() isValid: boolean;
  @Input() isFirst: boolean;
  @Input() isLast: boolean;

  @Output() cancel = new EventEmitter();
  @Output() submit = new EventEmitter();

  isMobile = false;
  SaveText = "Gem kladde";

  constructor(
    private md: MobileDetectorService, 
  ) {}
  
  ngOnInit() {
    if (this.isLast) this.SaveText = "Publicer";
    this.isMobile = this.md.check();
  }

  onCancel() {
    this.cancel.emit();
  }

  onSubmit() {
    this.submit.emit();
  }

}
