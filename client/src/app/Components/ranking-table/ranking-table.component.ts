import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ResumeRanking } from '../utils';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'src/app/Services/data/data.service';
import { RestService } from 'src/app/Services/rest/rest.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ranking-table',
  templateUrl: './ranking-table.component.html',
  styleUrls: ['./ranking-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RankingTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private resumeRankingSubscripton: Subscription;
  resumeRankingCollection: ResumeRanking[] = [];

  private signedUrlSubscription!: Subscription;
  signedUrl: string | undefined = undefined;

  displayedColumns: string[] = ['id', 'pdf_data', 'similarity_score'];
  dataSource = new MatTableDataSource<ResumeRanking>(this.resumeRankingCollection);

  constructor(private _dataService: DataService, private _restService: RestService) { 
    this.resumeRankingSubscripton = this._dataService.sharedResumeList.subscribe(data => {
      this.resumeRankingCollection = data;
      this.dataSource.data = this.resumeRankingCollection;
      let size = this.dataSource.paginator?.pageSize;
      if (this.dataSource.paginator)
        this.dataSource.paginator.pageSize = size;
    }); 
  }

  ngOnInit(): void {
  
  }

  ngAfterViewInit() {
    this.dataSource = new MatTableDataSource<ResumeRanking>(this.resumeRankingCollection);
    this.dataSource.paginator = this.paginator;
    
  }

  ngOnDestroy(): void {
    this.resumeRankingSubscripton.unsubscribe();
  }

  // TODO - We also have to make sure that the url is only stored max for its expiration time
  openResume(element: ResumeRanking): void {
    // If we have already retrieved the signed url in session, it will be stored in the signed_url property to avoid subsequent requests
    if (element.signed_url) {
      window.open(element.signed_url, '_blank');
      return;
    }

    // TODO - Loading indidcator in case the request takes a while
    this.signedUrlSubscription = this._restService.getSignedResumeURL(element.pdf_data).subscribe({
      next: (body: any) => {
        if (this.signedUrlSubscription.closed) return;
        this.signedUrl = body.url;
        window.open(this.signedUrl, '_blank');
      },
      error: (error: any) => {
        console.error('Error:', error);
        // Handle error
      },
      complete: () => {
        element.signed_url = this.signedUrl;
        this.signedUrlSubscription.unsubscribe();
      }
    });
  }
}
