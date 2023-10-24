import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ResumeRanking } from '../utils';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ranking-table',
  templateUrl: './ranking-table.component.html',
  styleUrls: ['./ranking-table.component.css']
})
export class RankingTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() resumeRankingCollection: ResumeRanking[] = [];

  displayedColumns: string[] = ['id', 'pdf_data', 'singularity_score'];
  dataSource = new MatTableDataSource<ResumeRanking>(this.resumeRankingCollection);

  constructor() { }

  ngOnInit(): void {
  }

}
