import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectCurrentOrganization } from 'src/app/Store/Organizations/organizations.selectors';
import { AppState } from 'src/app/app.state';
import { Organization } from 'src/app/models';

@Component({
  selector: 'app-new-user-buttons',
  templateUrl: './new-user-buttons.component.html',
  styleUrls: ['./new-user-buttons.component.css'],
})
export class NewUserButtonsComponent implements OnInit, OnDestroy {
  buttonStyle = `
    tw-flex-1 
    tw-m-4 
    tw-bg-gray-800 
    tw-text-white 
    tw-font-sans 
    tw-text-base 
    tw-text-center 
    hover:tw-bg-gray-700 
    tw-shadow-gray-950 
    tw-shadow-2xl';
  `;

  currentOrganizationSubscription: Subscription;
  private currentOrganization: Organization | null = null;

  constructor(private _router: Router, private _store: Store<AppState>) {
    this.currentOrganizationSubscription = this._store
      .pipe(select(selectCurrentOrganization))
      .subscribe((currentOrganization) => {
        this.currentOrganization = currentOrganization;
      });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.currentOrganizationSubscription.unsubscribe();
  }

  employersClick() {}

  employeesClick() {
    /*
      Flow:
      1. Redirect to /organizations
      2. If no organization exists, prompt user to create one
      3. If organization exists, user must select one
      4. Once organization is selected, redirect to /employee with the organization id
      5. Route will be dynamically generated based on the organization id (ie. /employer/id)
    */
    return this._router.navigate(['/organizations']);
  }
}
