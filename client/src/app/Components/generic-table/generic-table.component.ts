import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { AppState } from 'src/app/app.state';
import { ColumnData, TableData } from 'src/app/models';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.css'],
})
export class GenericTableComponent implements AfterViewInit, OnDestroy, OnInit {
  @Input() modelObject!: any;
  @Input() hasActions: boolean = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private dataSubscription: Subscription;
  dataCollection: any[] = [];

  private modalStatusSubscription: Subscription | undefined;
  modalRef: any = null;

  dataSource = new MatTableDataSource<any>(this.dataCollection);

  displayedRows: any[] = [];

  pageSize: number = 10;
  pageIndex = 0;

  name: string | null = null;
  store: string | null = null;
  columns: ColumnData[] | null = null;
  displayedColumns: string[] | null = null;

  styles = {
    head: 'tw-text-sm tw-uppercase tw-bg-[#303947]',
    headCell: 'tw-px-6 tw-py-3 tw-text-white tw-font-sans',
    cell: 'tw-px-6 tw-py-4 tw-font-medium tw-whitespace-nowrap tw-text-[#717886] tw-font-sans',
    name: 'tw-px-6 tw-py-4 tw-font-medium tw-whitespace-nowrap tw-text-white tw-font-sans',
  };

  constructor(
    private _store: Store<AppState>,
    private _router: Router,
    private _modalService: ModalService,
    private _matSnackBar: MatSnackBar
  ) {
    this.dataSubscription = new Subscription();
  }

  ngOnInit(): void {
    this.name = this.modelObject.name;
    this.store = this.modelObject.store;
    this.columns = this.modelObject.columns;
    this.displayedColumns = this.columns!.map((column) => column.key);

    this.dataSubscription = this._store
      .select(this.modelObject.store)
      .subscribe((data) => {
        this.dataCollection = data[this.modelObject.store];
        if (this.dataCollection.length == 0) return;
        this.dataSource.data = this.dataCollection;
        let size = this.dataSource.paginator?.pageSize;
        if (this.dataSource.paginator)
          this.dataSource.paginator.pageIndex = size;
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
  }
}
