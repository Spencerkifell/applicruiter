import { Component } from '@angular/core';
import { Subscription, catchError, combineLatest, of, switchMap } from 'rxjs';
import { JobModalComponent } from 'src/app/Components/job-modal/job-modal.component';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@auth0/auth0-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { RestService } from 'src/app/Services/rest/rest.service';
import { Organization } from 'src/app/models';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';
import * as organizationActions from '../../Store/Organizations/organizations.actions';
import * as jobActions from '../../Store/Jobs/jobs.actions';
import {
  createJobPostings,
  createOrganization,
  getAuthHeaderParams,
} from 'src/app/utils';

@Component({
  selector: 'app-employer',
  templateUrl: './employer.component.html',
  styleUrls: ['./employer.component.css'],
})
export class EmployerComponent {
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

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalService: ModalService,
    private _matSnackBar: MatSnackBar,
    private _authService: AuthService,
    private _restService: RestService,
    private _store: Store<AppState>
  ) {
    this._store.dispatch(jobActions.clearJobs());
    this.combinedSubscription = this.combinedObservable
      .pipe(
        switchMap(([idTokenClaims, parameters]) => {
          this.claims = idTokenClaims;
          const { headers, params } = getAuthHeaderParams(this.claims);
          return this._restService
            .getOrganization(headers, params, parameters!['id'])
            .pipe(
              catchError((error) => {
                return of(error);
              })
            );
        }),
        switchMap((organizationResponse) => {
          const { status, error } = organizationResponse;

          if (status != 200) return of(error);

          const { body } = organizationResponse;
          const { data } = body;

          // TODO (1): Fix model for organization
          const organization: Organization = createOrganization(data);
          this._store.dispatch(
            organizationActions.setOrganization({ organization })
          );

          const { headers, params } = getAuthHeaderParams(this.claims);
          return this._restService
            .getJobs(headers, params, organization.id)
            .pipe(
              catchError((error) => {
                return of(error);
              })
            );
        })
      )
      .subscribe((response) => {
        debugger;
        const { status, error } = response;

        if (status == 404) return (this.contentLoaded = true);
        else if (status != 200) return this.handleError(error.message);

        const { body } = response;
        const { data } = body;

        this.jobCollection = createJobPostings(data);
        this._store.dispatch(
          jobActions.setCurrentJobs({ jobs: this.jobCollection })
        );

        this.contentLoaded = true;
      });
  }

  private handleError(message: string): void {
    console.error(`An error occurred: ${message}`);
    this._router.navigate(['/error']);
  }

  ngOnDestroy(): void {
    // this.modalSubscription.unsubscribe();
    this.combinedSubscription.unsubscribe();
  }

  openModal() {
    this.modalRef = this._modalService.openModal(JobModalComponent);
  }
}
