import { Component } from '@angular/core';
import { Subscription, catchError, combineLatest, of, switchMap } from 'rxjs';
import { JobModalComponent } from 'src/app/Components/job-modal/job-modal.component';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { DataService } from 'src/app/Services/data/data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { AuthService } from '@auth0/auth0-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { RestService } from 'src/app/Services/rest/rest.service';
import { getAuthHeaderParams } from 'src/app/utils';
import { Organization } from 'src/app/models';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';
import * as organizationActions from '../../Store/Organizations/organizations.actions';

const API_URL = environment.apiUrl;

@Component({
  selector: 'app-employer',
  templateUrl: './employer.component.html',
  styleUrls: ['./employer.component.css'],
})
export class EmployerComponent {
  // private jobSubscription: Subscription;
  jobCollection: any = [];

  contentLoaded: boolean = false;

  private combinedSubscription: Subscription;
  combinedObservable = combineLatest([
    this._authService.idTokenClaims$,
    this._route.params,
  ]);
  claims: any = null;
  currentOrganization: Organization | null = null;

  // private modalSubscription: Subscription;
  // modalStatus: boolean = false;

  modalRef: any = null;

  p = 1;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalService: ModalService,
    private _dataService: DataService,
    private _httpClient: HttpClient,
    private _matSnackBar: MatSnackBar,
    private _authService: AuthService,
    private _restService: RestService,
    private _store: Store<AppState>
  ) {
    // TODO: Structure
    // 1. Verify that the current user is able to access the organization (if not, redirect to error page)
    // 2. Get the organization from the api
    // 2. Get the jobs for the organization from the api

    this.combinedSubscription = this.combinedObservable
      .pipe(
        switchMap(([idTokenClaims, parameters]) => {
          const claims = idTokenClaims;
          const { headers, params } = getAuthHeaderParams(claims);
          return this._restService
            .getOrganization(headers, params, parameters!['id'])
            .pipe(
              catchError((error) => {
                return of(error);
              })
            );
        })
      )
      .subscribe((response) => {
        const { status, error } = response;

        if (status != 200) return this.handleError(error.message);

        const { body } = response;
        const { data } = body;

        // TODO (1): Fix model for organization
        const organization: Organization = {
          id: data.id,
          name: data.name,
          owner: data.owner,
          address: data.address,
          country: data.country,
          city: data.city,
          totalMembers: 1, // TODO (2): Get the total number of members for the organization
          totalListings: 1, // TODO (3): Get the total number of listings for the organization
          dateCreated: data.created_at,
        };

        this.currentOrganization = organization;
        this._store.dispatch(
          organizationActions.setOrganization({ organization })
        );

        return (this.contentLoaded = true);
      });

    // this.jobSubscription = this._dataService.sharedJobList.subscribe((data) => {
    //   this.jobCollection = data;
    // });
    // this.contentLoadedSubscription =
    //   this._dataService.sharedContentLoaded.subscribe((data) => {
    //     this.contentLoaded = data;
    //   });

    // if (!this.isAuthenticated) {
    //   this._router.navigate(['/']);
    //   return;
    // }

    // this.getJobs();
    // this.modalSubscription = this._dataService.sharedJobModalStatus.subscribe(
    //   (data) => {
    //     if (data) {
    //       this.modalRef.close();
    //       this._matSnackBar.open('Job created successfully!', 'Close', {
    //         duration: 5000,
    //         horizontalPosition: 'right',
    //         verticalPosition: 'top',
    //         // We can't add an attribute to the snackbar element, so we have to use the panelClass property to add a class to the snackbar element
    //         panelClass: ['cy-success-snackbar'],
    //       });
    //       this._dataService.modalIsCompleted(false);
    //     }
    //   }
    // );
  }

  private handleError(message: string): void {
    console.error(`An error occurred: ${message}`);
    this._router.navigate(['/error']);
  }

  ngOnDestroy(): void {
    // this.jobSubscription.unsubscribe();
    // this.contentLoadedSubscription.unsubscribe();
    // this.modalSubscription.unsubscribe();
    // this.authSubscription.unsubscribe();
    this.combinedSubscription.unsubscribe();
  }

  openModal() {
    this.modalRef = this._modalService.openModal(JobModalComponent);
  }

  getJobs() {
    const accessToken = this.claims.__raw;
    const userAuthId = this.claims.sub;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });

    const params = { userAuthId };

    this._httpClient.get(`${API_URL}/api/job`, { headers, params }).subscribe({
      next: (data: any) => {
        this.jobCollection = data?.data;
        // Make every job have a checked property of false
        this.jobCollection = this.jobCollection.map((job: any) => {
          job.checked = false;
          return job;
        });
        this._dataService.updateJobList(this.jobCollection);
      },
      error: async (exception: any) => console.log(exception.error.message),
    });
  }
}
