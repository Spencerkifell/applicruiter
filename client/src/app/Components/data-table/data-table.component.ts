import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { JobPosting } from '../utils';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/Services/data/data.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { JobInfoComponent } from '../job-info/job-info.component';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private jobSubscripton: Subscription;
  jobCollection: JobPosting[] = [];

  private jobInfoModalSubscription: Subscription;
  jobInfoModalStatus: boolean = false;

  displayedColumns: string[] = ['job_id', 'title', 'level', 'country', 'city'];
  dataSource = new MatTableDataSource<JobPosting>(this.jobCollection);
  selection = new SelectionModel<JobPosting>(false, []);

  detailModalRef: any = null;

  constructor(
    private _dataService: DataService,
    private _matSnackBar: MatSnackBar,
    private _modalService: ModalService
  ) {
    this.jobSubscripton = this._dataService.sharedJobList.subscribe(data => {
      this.jobCollection = data;
      this.dataSource.data = this.jobCollection;
      let size = this.dataSource.paginator?.pageSize;
      this.dataSource.paginator?.firstPage();
      if (this.dataSource.paginator)
        this.dataSource.paginator.pageSize = size;
    });
    this.jobInfoModalSubscription = this._dataService.sharedResumeModalStatus.subscribe(data => {
      if (data) {
        this.detailModalRef.close();
        this._matSnackBar.open('Resume sent successfully!', 'Close', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this._dataService.resumeModalIsCompleted(false);
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource<JobPosting>(this.jobCollection);
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.jobSubscripton.unsubscribe();
    this.jobInfoModalSubscription.unsubscribe();
  }

  openJobDetails(row: JobPosting) {
    this.detailModalRef = this._modalService.openModal(JobInfoComponent, row);
  }
}
