import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/Services/data/data.service';
import { JobPosting } from '../utils';

@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.component.html',
  styleUrls: ['./rankings.component.css']
})
export class RankingsComponent implements OnInit {
  private jobSubscripton: Subscription;
  jobCollection: JobPosting[] = [];

  constructor(private _dataService: DataService) { 
    this.jobSubscripton = this._dataService.sharedJobList.subscribe(data => {
      this.jobCollection = data;
    });
  }

  ngOnInit(): void {
  }

}
