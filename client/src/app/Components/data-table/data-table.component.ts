import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { JobPosting } from '../../models';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/Services/data/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { JobInfoComponent } from '../job-info/job-info.component';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/app.state';
import { selectCurrentJobs } from 'src/app/Store/Jobs/jobs.selectors';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
})
export class DataTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private jobSubscripton: Subscription;
  jobCollection: JobPosting[] = [];

  private jobInfoModalSubscription: Subscription;
  jobInfoModalStatus: boolean = false;

  private selectedJobIdSubscription: Subscription;
  selectedJobId: string | null = null;

  displayedColumns: string[] = [
    'id',
    'title',
    'level',
    'country',
    'city',
    'checked',
  ];
  dataSource = new MatTableDataSource<JobPosting>(this.jobCollection);

  detailModalRef: any = null;

  constructor(
    private _dataService: DataService,
    private _matSnackBar: MatSnackBar,
    private _modalService: ModalService,
    private _store: Store<AppState>
  ) {
    this.jobSubscripton = this._store
      .select(selectCurrentJobs)
      .subscribe((jobs) => {
        this.jobCollection = jobs;
        if (this.jobCollection.length == 0) return;
        this.dataSource.data = this.jobCollection;
        let size = this.dataSource.paginator?.pageSize;
        if (this.dataSource.paginator)
          this.dataSource.paginator.pageSize = size;
      });
    this.jobInfoModalSubscription =
      this._dataService.sharedResumeModalStatus.subscribe((data) => {
        if (data) {
          this.detailModalRef.close();
          this._matSnackBar.open('Resume sent successfully!', 'Close', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
          this._dataService.resumeModalIsCompleted(false);
        }
      });
    this.selectedJobIdSubscription =
      this._dataService.sharedSelectedJobId.subscribe((data) => {
        this.selectedJobId = data;
      });
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource<JobPosting>(this.jobCollection);
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.jobSubscripton.unsubscribe();
    this.jobInfoModalSubscription.unsubscribe();
    this.selectedJobIdSubscription.unsubscribe();
  }

  openJobDetails(row: JobPosting) {
    this.detailModalRef = this._modalService.openModal(JobInfoComponent, row);
  }

  selectJob(event: any, element: any) {
    if (!this.dataSource.paginator) return;

    // Stops the event from propagating to the parent element
    event.stopPropagation();

    const currentPage = this.dataSource.paginator.pageIndex;
    const currentJobId = this.selectedJobId;
    const currentJob = currentJobId
      ? this.jobCollection.find((j) => j.id === Number(currentJobId))
      : null;

    // Unchecks the current job if the user clicks on the same job
    // if (currentJob) currentJob.checked = false;

    if (currentJobId != element.id) element.checked = !element.checked;

    this._dataService.updateSelectedJobId(
      element.checked ? String(element.id) : null
    );
    this._dataService.updateJobList(this.jobCollection);

    this.maintainCurrentPage(currentPage);
  }

  maintainCurrentPage(desiredPageIndex: number) {
    const currentPageIndex = this.dataSource.paginator?.pageIndex;
    if (currentPageIndex !== desiredPageIndex) {
      // Trigger a page change event to navigate to the desired page
      this.dataSource.paginator?.page.emit({
        pageIndex: desiredPageIndex,
        pageSize: this.dataSource.paginator?.pageSize,
        length: this.dataSource.paginator?.length,
      });
    }
  }
}
