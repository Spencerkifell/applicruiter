import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ResumeRanking } from '../../models';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'src/app/Services/data/data.service';
import { RestService } from 'src/app/Services/rest/rest.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ranking-table',
  templateUrl: './ranking-table.component.html',
  styleUrls: ['./ranking-table.component.css'],
})
export class RankingTableComponent implements OnDestroy {
  @Input() selectedId!: string | null;
  @ViewChild(MatPaginator) set matPaginator(paginator: MatPaginator) {
    this.paginator = paginator;
    this.dataSource.paginator = this.paginator;
  }
  paginator!: MatPaginator;

  private resumeRankingSubscripton: Subscription;
  resumeRankingCollection: ResumeRanking[] = [];

  private signedUrlSubscription!: Subscription;
  signedUrl: string | undefined = undefined;

  displayedColumns: string[] = ['id', 'pdf_data', 'similarity_score'];
  dataSource = new MatTableDataSource<ResumeRanking>(
    this.resumeRankingCollection
  );

  constructor(
    private _dataService: DataService,
    private _restService: RestService
  ) {
    this.resumeRankingSubscripton =
      this._dataService.sharedResumeList.subscribe((data) => {
        this.resumeRankingCollection = data;
        this.dataSource.data = this.resumeRankingCollection;
        if (this.dataSource.paginator) {
          this.dataSource.paginator = this.paginator;
          let size = this.dataSource.paginator?.pageSize;
          this.dataSource.paginator.pageSize = size;
        }
      });
  }

  ngOnDestroy(): void {
    this.resumeRankingSubscripton.unsubscribe();
    this.signedUrlSubscription?.unsubscribe();
  }

  // TODO - We also have to make sure that the url is only stored max for its expiration time
  openResume(element: ResumeRanking): void {
    // If we have already retrieved the signed url in session, it will be stored in the signed_url property to avoid subsequent requests
    if (element.signed_url) {
      window.open(element.signed_url, '_blank');
      return;
    }

    this.signedUrlSubscription = this._restService
      .getSignedResumeURL(element.pdf_data)
      .subscribe({
        next: (body: any) => {
          if (this.signedUrlSubscription.closed) return;
          this.signedUrl = body.data;
          window.open(this.signedUrl, '_blank');
        },
        error: (error: any) => {
          console.error('Error:', error);
          // TODO Handle Error
        },
        complete: () => {
          element.signed_url = this.signedUrl;
          this.signedUrlSubscription.unsubscribe();
        },
      });
  }
}
