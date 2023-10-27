import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/Services/data/data.service';
import { JobPosting } from '../utils';
import { FormBuilder, Validators } from '@angular/forms';
import { ResumeRanking } from '../utils';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.component.html',
  styleUrls: ['./rankings.component.css']
})
export class RankingsComponent implements OnInit {
  private jobSubscripton: Subscription;
  jobCollection: JobPosting[] = [];
  valueChangesSubscription: Subscription;

  resumeRankingCollection: ResumeRanking[] = [];

  optionValue: string | null = null;
  selectGroup = this._formBuilder.group({
    job: ['', Validators.required],
  });

  constructor(private _dataService: DataService, private _httpClient: HttpClient, private _formBuilder: FormBuilder) { 
    this.jobSubscripton = this._dataService.sharedJobList.subscribe(data => {
      this.jobCollection = data;
    });
    this.valueChangesSubscription = this.selectGroup.controls['job'].valueChanges.subscribe(value => {
      if (!value) {
        this._dataService.updateResumeList([]);
        return;
      }
      this.optionValue = value;
      // We want to update the rankings view when the user selects a new job based off the job_id
      this.getResumesByJobId(Number(this.optionValue));
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

  getResumesByJobId(job_id: number): void {
    this._httpClient.get(`http://127.0.0.1:5000/api/resume/get/ranking/${job_id}`).subscribe({
      next: (data: any) => {
        this._dataService.updateResumeList(data?.resume_data);
      },
      error: async (exception: any) => console.log(exception.error.message)
    })
  }
}
