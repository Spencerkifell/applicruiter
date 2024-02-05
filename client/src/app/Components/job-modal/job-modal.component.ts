import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { RestService } from 'src/app/Services/rest/rest.service';
import { filterMultiInput } from 'src/app/form-utils';
import { getAuthHeaderParams, instantiateNewJob } from 'src/app/utils';
import { Subscription, combineLatest } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { selectCurrentOrganization } from 'src/app/Store/Organizations/organizations.selectors';
import { Organization } from 'src/app/models';
import * as jobActions from '../../Store/Jobs/jobs.actions';
import { ModalService } from 'src/app/Services/modal/modal.service';

@Component({
  selector: 'app-job-modal',
  templateUrl: './job-modal.component.html',
  styleUrls: ['./job-modal.component.css'],
})
export class JobModalComponent implements OnDestroy {
  firstFormGroup = this._formBuilder.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    country: ['', Validators.required],
    city: ['', Validators.required],
  });

  secondFormGroup = this._formBuilder.group({
    level: ['', Validators.required],
    skills: ['', [Validators.required, this.skillValidator.bind(this)]],
  });

  private currentOrganizationSubscription: Subscription;
  private currentOrganization: Organization | null = null;

  private authSubscription: Subscription;
  private claims: any;

  constructor(
    private _formBuilder: FormBuilder,
    private _restService: RestService,
    private _auth0Service: Auth0Service,
    private _store: Store<any>,
    private _modalService: ModalService
  ) {
    this.currentOrganizationSubscription = this._store
      .pipe(select(selectCurrentOrganization))
      .subscribe((currentOrganization) => {
        this.currentOrganization = currentOrganization;
      });

    this.authSubscription = combineLatest([
      this._auth0Service.idTokenClaims$,
    ]).subscribe(([idTokenClaims]) => {
      this.claims = idTokenClaims;
    });
  }

  ngOnDestroy(): void {
    this.currentOrganizationSubscription.unsubscribe();
    this.authSubscription.unsubscribe();
  }

  onClick(): void {
    if (
      this.firstFormGroup.invalid ||
      this.secondFormGroup.invalid ||
      !this.claims ||
      !this.currentOrganization
    )
      return;

    const { title, description, country, city } = this.firstFormGroup.value;
    const { level, skills } = this.secondFormGroup.value;

    let jobData = {
      org: this.currentOrganization.id,
      title: title,
      description: description,
      country: country,
      city: city,
      level: level,
      skills: skills,
    };

    const { headers, params } = getAuthHeaderParams(this.claims);

    this._restService
      .postJob(headers, params, { job: jobData })
      .subscribe((response) => {
        const { body } = response;
        const { data, message } = body;

        const job = instantiateNewJob(data);

        if (!job) return this._modalService.updateSubmission(false);

        this._store.dispatch(jobActions.updateCurrentJobs({ jobs: [job] }));

        this._modalService.updateSubmission(true);
      });
  }

  skillValidator(control: any): any {
    const { value } = control;
    return filterMultiInput(value) ? null : { invalidSkills: true };
  }
}
