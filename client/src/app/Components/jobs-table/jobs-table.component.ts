import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription, skip } from 'rxjs';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { JobPosting, Organization } from 'src/app/models';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';
import { selectCurrentJobs } from 'src/app/Store/Jobs/jobs.selectors';
import { selectCurrentOrganization } from 'src/app/Store/Organizations/organizations.selectors';
import { JobModalComponent } from '../job-modal/job-modal.component';
import { Router } from '@angular/router';
import { setCurrentJob } from 'src/app/Store/Jobs/jobs.actions';

@Component({
  selector: 'app-jobs-table',
  templateUrl: './jobs-table.component.html',
  styleUrls: ['./jobs-table.component.css'],
})
export class JobsTableComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private jobSubscription: Subscription;
  jobCollection: JobPosting[] = [];

  private organizationSubscription: Subscription;
  currentOrganization: Organization | null = null;

  private modalStatusSubscription: Subscription | undefined;
  jobModalRef: any = null;

  styles = {
    head: 'tw-text-sm tw-uppercase tw-bg-[#303947]',
    headCell: 'tw-px-6 tw-py-3 tw-text-white tw-font-sans',
    cell: 'tw-px-6 tw-py-4 tw-font-medium tw-whitespace-nowrap tw-text-[#717886] tw-font-sans',
    name: 'tw-px-6 tw-py-4 tw-font-medium tw-whitespace-nowrap tw-text-white tw-font-sans',
  };

  displayedColumns: string[] = [
    'id',
    'title',
    'level',
    'country',
    'city',
    'createdAt',
  ];

  dataSource = new MatTableDataSource<JobPosting>(this.jobCollection);

  displayedRows: JobPosting[] = [];

  pageSize: number = 10;
  pageIndex = 0;

  constructor(
    private _store: Store<AppState>,
    private _modalService: ModalService,
    private _matSnackBar: MatSnackBar,
    private _router: Router
  ) {
    this.jobSubscription = this._store
      .select(selectCurrentJobs)
      .subscribe((jobs) => {
        this.jobCollection = jobs;
        if (this.jobCollection.length == 0) return;
        this.dataSource.data = this.jobCollection;
        let size = this.dataSource.paginator?.pageSize;
        if (this.dataSource.paginator)
          this.dataSource.paginator.pageSize = size;
      });
    this.organizationSubscription = this._store
      .select(selectCurrentOrganization)
      .subscribe((organization) => {
        this.currentOrganization = organization;
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.jobSubscription.unsubscribe();
    this.organizationSubscription.unsubscribe();
    this.modalStatusSubscription?.unsubscribe();
  }

  addJobClicked(): void {
    this.jobModalRef = this._modalService.openModal(JobModalComponent);

    this.modalStatusSubscription = this._modalService.sharedSubmissionSuccess
      .pipe(skip(1))
      .subscribe((data: boolean) => {
        this.jobModalRef.close();
        this.createSnackBar(
          data
            ? 'Job listing created successfully!'
            : 'Failure adding job listing'
        );
      });
  }

  jobClicked(job: JobPosting) {
    // TODO - Finish this method
    // if (organization.id == null) return;
    this._store.dispatch(setCurrentJob({ job: job }));
    this._router.navigate([
      `/employer/${this.currentOrganization!.id}/post/${job.id}`,
    ]);
  }

  createSnackBar(message: string): void {
    this._matSnackBar.open(`${message}`, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
