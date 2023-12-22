import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { skip } from 'rxjs';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { AppState } from 'src/app/app.state';
import { Organization } from 'src/app/models';
import { OrganizationModalComponent } from '../organization-modal/organization-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-organizations-table',
  templateUrl: './organizations-table.component.html',
  styleUrls: ['./organizations-table.component.css'],
})
export class OrganizationsTableComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private organizationSubscription: Subscription;
  organizationCollection: Organization[] = [];

  private modalStatusSubscription: Subscription | undefined;
  orgModalRef: any = null;

  styles = {
    head: 'tw-text-sm tw-uppercase tw-bg-[#303947]',
    headCell: 'tw-px-6 tw-py-3 tw-text-white tw-font-sans',
    cell: 'tw-px-6 tw-py-4 tw-font-medium tw-whitespace-nowrap tw-text-[#717886] tw-font-sans',
    name: 'tw-px-6 tw-py-4 tw-font-medium tw-whitespace-nowrap tw-text-white tw-font-sans',
  };

  displayedColumns: string[] = [
    'name',
    'owner',
    'totalMembers',
    'totalListings',
    'dateCreated',
  ];

  dataSource = new MatTableDataSource<Organization>(
    this.organizationCollection
  );

  displayedRows: Organization[] = [];

  pageSize: number = 10;
  pageIndex = 0;

  constructor(
    private _store: Store<AppState>,
    private _modalService: ModalService,
    private _matSnackBar: MatSnackBar
  ) {
    this.organizationSubscription = this._store
      .select('organizations')
      .subscribe((organizations) => {
        this.organizationCollection = organizations.organizations;
        if (this.organizationCollection.length == 0) return;
        this.dataSource.data = this.organizationCollection;
        let size = this.dataSource.paginator?.pageSize;
        if (this.dataSource.paginator)
          this.dataSource.paginator.pageSize = size;
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.organizationSubscription.unsubscribe();
    this.modalStatusSubscription?.unsubscribe();
  }

  addOrganizationClicked(): void {
    this.orgModalRef = this._modalService.openModal(OrganizationModalComponent);

    this.modalStatusSubscription = this._modalService.sharedSubmissionSuccess
      .pipe(skip(1))
      .subscribe((data: boolean) => {
        this.orgModalRef.close();
        this.createSnackBar(
          data
            ? 'Organization created successfully!'
            : 'Failure adding organization'
        );
      });
  }

  createSnackBar(message: string): void {
    this._matSnackBar.open(`${message}`, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
