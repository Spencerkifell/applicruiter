import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/app.state';
import { Organization } from 'src/app/models';

@Component({
  selector: 'app-organizations-table',
  templateUrl: './organizations-table.component.html',
  styleUrls: ['./organizations-table.component.css'],
})
export class OrganizationsTableComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Output() openOrgModal: EventEmitter<boolean> = new EventEmitter<boolean>();

  private organizationSubscription: Subscription;
  organizationCollection: Organization[] = [];

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

  pageSize: number = 15;
  pageIndex = 0;

  constructor(private _store: Store<AppState>) {
    this.organizationSubscription = this._store
      .select('organizations')
      .subscribe((organizations) => {
        this.organizationCollection = organizations.organizations;
        this.dataSource.data = this.organizationCollection;
        let size = this.dataSource.paginator?.pageSize;
        if (this.dataSource.paginator)
          this.dataSource.paginator.pageSize = size;
      });
  }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource<Organization>(
      this.organizationCollection
    );
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.organizationSubscription.unsubscribe();
  }

  addOrganizationClicked(): void {
    this.openOrgModal.emit(true);
  }
}
