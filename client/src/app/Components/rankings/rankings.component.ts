import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/Services/data/data.service';
import { JobPosting } from '../utils';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.component.html',
  styleUrls: ['./rankings.component.css']
})
export class RankingsComponent implements OnInit {
  private jobSubscripton: Subscription;
  jobCollection: JobPosting[] = [];
  valueChangesSubscription: Subscription;

  optionValue: string | null = null;
  selectGroup = this._formBuilder.group({
    job: ['', Validators.required],
  });

  constructor(private _dataService: DataService, private _formBuilder: FormBuilder) { 
    this.jobSubscripton = this._dataService.sharedJobList.subscribe(data => {
      this.jobCollection = data;
    });
    this.valueChangesSubscription = this.selectGroup.controls['job'].valueChanges.subscribe(value => {
      this.optionValue = value;
    });
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.jobSubscripton.unsubscribe();
    this.valueChangesSubscription.unsubscribe();
  }

  updateRankingsView(): void {
    // We are going to retrieve the resumes from the database with the job_id of optionValue
    // 1. Update routes to include a new route for retrieving resumes by job_id where singularity is not null
  }
}
