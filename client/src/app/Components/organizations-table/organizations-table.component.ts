import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Organization } from 'src/app/utils';

@Component({
  selector: 'app-organizations-table',
  templateUrl: './organizations-table.component.html',
  styleUrls: ['./organizations-table.component.css'],
})
export class OrganizationsTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  columns: string[] = [
    'Organization Name',
    'Owner',
    'Total Members',
    'Total Listings',
    'Date Created',
  ];
  // test rows until data is available from backend
  rows: Organization[] = [
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
    {
      id: 1,
      name: 'Organization 1',
      owner: 'Owner 1',
      totalMembers: 1,
      totalListings: 1,
      dateCreated: '1/1/2021',
    },
  ];
  displayedRows: Organization[] = [];

  pageSize: number = 10;
  pageIndex = 0;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    // Set labels for paginator
    this.paginator._intl.itemsPerPageLabel = 'Items per page:';
    this.paginator._intl.nextPageLabel = 'Next page';
    this.paginator._intl.previousPageLabel = 'Previous page';

    // Set attributes for paginator
    this.paginator.length = this.rows.length;
    this.paginator.pageSize = this.pageSize;

    this.updateDisplayedRows();
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.updateDisplayedRows();
  }

  updateDisplayedRows(): void {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    this.displayedRows = this.rows.slice(startIndex, endIndex);
  }
}
