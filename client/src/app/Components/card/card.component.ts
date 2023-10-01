import { Component, Input } from '@angular/core';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { JobInfoComponent } from '../job-info/job-info.component';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/Services/data/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
  
})

export class CardComponent {
  @Input() jobPosting: any = [];

  private jobInfoModalSubscription: Subscription;
  jobInfoModalStatus: boolean = false;

  detailModalRef: any = null;

  constructor(
    private _modalService: ModalService, 
    private _dataService: DataService,
    private _matSnackBar: MatSnackBar
  ) { 
    this.jobInfoModalSubscription = this._dataService.sharedResumeModalStatus.subscribe(data => {
      if (data) {
        this.detailModalRef.close();
        this._matSnackBar.open('Resume sent successfully!', 'Close', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this._dataService.resumeModalIsCompleted(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.jobInfoModalSubscription.unsubscribe();
  }
    
  openJobDetails() {
    this.detailModalRef = this._modalService.openModal(JobInfoComponent, this.jobPosting);
  }
} 

