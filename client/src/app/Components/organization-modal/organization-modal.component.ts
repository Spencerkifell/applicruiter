import { HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Subscription, combineLatest } from 'rxjs';
import { AuthService } from 'src/app/Services/auth/auth.service';
import { RestService } from 'src/app/Services/rest/rest.service';
import { emailValidator, filterMultiInput } from 'src/app/form-utils';

@Component({
  selector: 'app-organization-modal',
  templateUrl: './organization-modal.component.html',
  styleUrls: ['./organization-modal.component.css'],
})
export class OrganizationModalComponent implements OnInit, OnDestroy {
  firstFormGroup = this._formBuilder.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    country: ['', Validators.required],
  });

  secondFormGroup = this._formBuilder.group({
    emails: ['', emailValidator.bind(this)],
  });

  private claims: any;

  authSubscription: Subscription;

  constructor(
    private _formBuilder: FormBuilder,
    private _auth0Service: Auth0Service,
    private _restService: RestService
  ) {
    this.authSubscription = combineLatest([
      this._auth0Service.idTokenClaims$,
    ]).subscribe(([idTokenClaims]) => {
      this.claims = idTokenClaims;
    });
  }

  ngOnInit(): void {}

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
    const userId = this.claims.sub;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });

    const params = { userId };

    this._restService.createOrganization(headers, params, {
      organization: organizationData,
      emails: emailData,
    });
  }
}
