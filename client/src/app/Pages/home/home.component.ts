import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { JobModalComponent } from 'src/app/Components/job-modal/job-modal.component';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { DataService } from 'src/app/Services/data/data.service';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';

const API_URL = environment.apiUrl;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private jobSubscripton: Subscription;
  jobCollection: any = [];

  private modalSubscription: Subscription;
  modalStatus: boolean = false;

  modalRef: any = null;

  p = 1;
  
  constructor(
    private _modalService: ModalService,
    private _dataService: DataService,
    private _httpClient: HttpClient,
    private _matSnackBar: MatSnackBar
  ) { 
    this.jobSubscripton = this._dataService.sharedJobList.subscribe(data => {
      this.jobCollection = data;
    });
    this.modalSubscription = this._dataService.sharedJobModalStatus.subscribe(data => {
      if (data) {
        this.modalRef.close();
        this._matSnackBar.open('Job created successfully!', 'Close', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          // We can't add an attribute to the snackbar element, so we have to use the panelClass property to add a class to the snackbar element
          panelClass: ['cy-success-snackbar']
        });
        this._dataService.modalIsCompleted(false);
      }     
    });
  }

  ngOnInit(): void {
    this.getJobs();
  }

  ngOnDestroy(): void {
    this.jobSubscripton.unsubscribe();
    this.modalSubscription.unsubscribe();
  }

  openModal() {
    this.modalRef = this._modalService.openModal(JobModalComponent);
  }

  getJobs() {
    this._httpClient.get(`${API_URL}/api/job`).subscribe({
      next: (data: any) => {
        this.jobCollection = data?.data
        this._dataService.updateJobList(this.jobCollection);
      },
      error: async (exception: any) => console.log(exception.error.message)
    });
  }
}
