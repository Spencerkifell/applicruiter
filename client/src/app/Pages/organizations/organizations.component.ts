import { HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { Subscription, catchError, combineLatest, of, switchMap } from 'rxjs';
import { AuthService } from 'src/app/Services/auth/auth.service';
import { RestService } from 'src/app/Services/rest/rest.service';
import { AppState } from 'src/app/app.state';
import { Organization, User } from 'src/app/models';
import * as organizationActions from 'src/app/Store/Organizations/organizations.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css'],
})
export class OrganizationsComponent implements OnDestroy {
  combinedSubscription: Subscription;
  user: User | null = null;
  contentLoaded: boolean = false;

  combinedObservable = combineLatest([
    this._auth0Service.idTokenClaims$,
    this._authService.getUser(),
  ]);

  constructor(
    private _restService: RestService,
    private _router: Router,
    private _auth0Service: Auth0Service,
    private _authService: AuthService,
    private _store: Store<AppState>
  ) {
    this.combinedSubscription = this.combinedObservable
      .pipe(
        switchMap(([idTokenClaims, user]) => {
          const claims = idTokenClaims;
          this.user = user;
          const { headers, params } = this.getHeadersParams(claims);
          return this._restService
            .getOrganizations(headers, params, user!.id)
            .pipe(
              catchError((error) => {
                return of(error);
              })
            );
        })
      )
      .subscribe((response) => {
        const { status, error } = response;

        if (status == 404) return (this.contentLoaded = true);
        else if (status != 200) return this.handleError(error.message);

        const { body } = response;
        const { data } = body;

        const organizations: Organization[] = this.mapOrganizations(data);

        this._store.dispatch(
          organizationActions.setOrganizations({ organizations })
        );

        return (this.contentLoaded = true);
      });
  }

  ngOnDestroy(): void {
    this.combinedSubscription.unsubscribe();
  }

  getHeadersParams(claims: any) {
    const accessToken = claims.__raw;
    const userAuthId = claims.sub;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });

    return { headers, params: { userAuthId } };
  }

  mapOrganizations(organizations: any): Organization[] {
    return organizations.map((organization: any) => ({
      id: organization.id,
      name: organization.name,
      owner: organization.owner,
      address: organization.address,
      country: organization.country,
      city: organization.city,
      totalMembers: 1,
      totalListings: 0,
      dateCreated: organization.created_at,
    }));
  }

  private handleError(message: string): void {
    console.error(`An error occurred: ${message}`);
    this._router.navigate(['/error']);
  }
}
