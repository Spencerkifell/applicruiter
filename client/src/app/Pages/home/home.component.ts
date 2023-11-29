import { Component } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { JobModalComponent } from 'src/app/Components/job-modal/job-modal.component';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { DataService } from 'src/app/Services/data/data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { AuthService } from '@auth0/auth0-angular';

const API_URL = environment.apiUrl;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private jobSubscription: Subscription;
  jobCollection: any = [];

  private contentLoadedSubscription: Subscription;
  contentLoaded: boolean = false;

  private authSubscription: Subscription;
  isAuthenticated: any = null;

  private modalSubscription: Subscription;
  modalStatus: boolean = false;

  modalRef: any = null;

  p = 1;
  
  constructor(
    private _modalService: ModalService,
    private _dataService: DataService,
    private _httpClient: HttpClient,
    private _matSnackBar: MatSnackBar,
    private _authService: AuthService
  ) { 
    this.jobSubscription = this._dataService.sharedJobList.subscribe(data => {
      this.jobCollection = data;
    });
    this.contentLoadedSubscription = this._dataService.sharedContentLoaded.subscribe(data => {
      this.contentLoaded = data;
    });
    this.authSubscription = combineLatest([this._authService.idTokenClaims$]).subscribe(([idTokenClaims]) => {
      this.isAuthenticated = idTokenClaims;
      
      if (!this.isAuthenticated)
        return;

      this.getJobs();
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

  ngOnDestroy(): void {
    this.jobSubscription.unsubscribe();
    this.contentLoadedSubscription.unsubscribe();
    this.modalSubscription.unsubscribe();
    this.authSubscription.unsubscribe();
  }

  openModal() {
    this.modalRef = this._modalService.openModal(JobModalComponent);
  }

  getJobs() {
    const accessToken = this.isAuthenticated.__raw;
    const userId = this.isAuthenticated.sub;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    });

    const params = { userId };

    this._httpClient.get(`${API_URL}/api/job`, { headers, params}).subscribe({
      next: (data: any) => {
        this.jobCollection = data?.data
        this._dataService.updateContentLoaded(true);
        // Make every job have a checked property of false
        this.jobCollection = this.jobCollection.map((job: any) => {
          job.checked = false;
          return job;
        });
        this._dataService.updateJobList(this.jobCollection);
      },
      error: async (exception: any) => console.log(exception.error.message)
    });
  }
}
