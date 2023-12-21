import { HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Store } from '@ngrx/store';
import { Subscription, combineLatest } from 'rxjs';
import { AuthService } from 'src/app/Services/auth/auth.service';
import { RestService } from 'src/app/Services/rest/rest.service';
import { AppState } from 'src/app/app.state';
import { emailValidator, filterMultiInput } from 'src/app/form-utils';
import { User } from 'src/app/models';
import * as organizationActions from '../../Store/Organizations/organizations.actions';
import { ModalService } from 'src/app/Services/modal/modal.service';

@Component({
  selector: 'app-organization-modal',
  templateUrl: './organization-modal.component.html',
  styleUrls: ['./organization-modal.component.css'],
})
export class OrganizationModalComponent implements OnDestroy {
  firstFormGroup = this._formBuilder.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
  });

  secondFormGroup = this._formBuilder.group({
    emails: ['', emailValidator.bind(this)],
  });

  authSubscription: Subscription;
  claims: any;

  userSubscription: Subscription;
  user: User | null = null;

  constructor(
    private _formBuilder: FormBuilder,
    private _auth0Service: Auth0Service,
    private _authService: AuthService,
    private _restService: RestService,
    private _modalService: ModalService,
    private _store: Store<AppState>
  ) {
    this.authSubscription = combineLatest([
      this._auth0Service.idTokenClaims$,
    ]).subscribe(([idTokenClaims]) => {
      this.claims = idTokenClaims;
    });
    this.userSubscription = this._authService.getUser().subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  onClick(): void {
    if (
      this.firstFormGroup.invalid ||
      this.secondFormGroup.invalid ||
      !this.claims
    )
      return;

    const { name, address, city, country } = this.firstFormGroup.value;
    const { emails } = this.secondFormGroup.value;

    let organizationData = {
      name: name,
      address: address,
      city: city,
      country: country,
    };

    let validEmails = filterMultiInput(emails);

    let currentUserEmail: string = this.claims.email;
    let emailData: string[] = [currentUserEmail];

    if (validEmails && emails.trim() !== '')
      emailData = [...emailData, ...emails.split(',')];

    const accessToken = this.claims.__raw;
    const userAuthId = this.claims.sub;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });

    const params = { userAuthId };

    this._restService
      .postOrganization(headers, params, {
        organization: organizationData,
        emails: emailData,
      })
      .subscribe((response) => {
        const { body } = response;
        const { data, message } = body;

        const organization = this._restService.instantiateOrganization(
          data,
          this.user!.id
        );

        if (!organization) this._modalService.updateSubmission(false);

        this._store.dispatch(
          organizationActions.updateOrganization({ organization })
        );

        this._modalService.updateSubmission(true);
      });
  }
}
