import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ResumeRanking } from '../utils';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'src/app/Services/data/data.service';
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

  displayedColumns: string[] = ['id', 'pdf_data', 'similarity_score'];
  dataSource = new MatTableDataSource<ResumeRanking>(this.resumeRankingCollection);

  constructor(private _dataService: DataService) { 
    this.resumeRankingSubscripton = this._dataService.sharedResumeList.subscribe(data => {
      this.resumeRankingCollection = data;
      this.dataSource.data = this.resumeRankingCollection;
      let size = this.dataSource.paginator?.pageSize;
      this.dataSource.paginator?.firstPage();
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
}
