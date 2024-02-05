import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, combineLatest, switchMap } from 'rxjs';
import { getAuthHeaderParams } from 'src/app/utils';
import { RestService } from 'src/app/Services/rest/rest.service';
import { selectCurrentJob } from 'src/app/Store/Jobs/jobs.selectors';
import { AppState } from 'src/app/app.state';
import { AuthService } from '@auth0/auth0-angular';
import {
  ColumnData,
  JobPosting,
  ResumeRanking,
  TableData,
} from 'src/app/models';

@Component({
  selector: 'app-posting',
  templateUrl: './posting.component.html',
  styleUrls: ['./posting.component.css'],
})
export class PostingComponent implements OnDestroy {
  private combinedSubscription: Subscription;
  combinedObservable = combineLatest([
    this._authService.idTokenClaims$,
    this._store.select(selectCurrentJob),
  ]);

  currentJob!: JobPosting | null;

  resumes: ResumeRanking[] = [];

  columnData: ColumnData[] = [
    { key: 'name', name: 'Name' },
    { key: 'owner', name: 'Owner' },
    { key: 'totalMembers', name: 'Total Members' },
    { key: 'totalListings', name: 'Total Listings' },
    { key: 'dateCreated', name: 'Date Created' },
  ];

  tableData: TableData = {
    name: 'Organizations',
    store: 'organizations',
    columns: this.columnData,
  };

  constructor(
    private _store: Store<AppState>,
    private _restService: RestService,
    private _authService: AuthService
  ) {
    this.combinedSubscription = this.combinedObservable
      .pipe(
        switchMap(([idTokenClaims, job]) => {
          const { headers, params } = getAuthHeaderParams(idTokenClaims);
          this.currentJob = job;
          return this._restService.getResumes(headers, params, job!.id);
        })
      )
      .subscribe((resumes) => {
        this.resumes = resumes.body.data;
      });
  }

  ngOnDestroy() {
    this.combinedSubscription.unsubscribe();
  }
}
