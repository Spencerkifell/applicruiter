import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { DataService } from 'src/app/Services/data/data.service';
import { RestService } from 'src/app/Services/rest/rest.service';
import { JobPosting } from '../utils';
import { FormBuilder, Validators } from '@angular/forms';
import { ResumeRanking } from '../utils';
import { HttpClient } from '@angular/common/http';
import { RankingTableComponent } from '../ranking-table/ranking-table.component';

@Component({
  selector: 'app-rankings',
  templateUrl: './rankings.component.html',
  styleUrls: ['./rankings.component.css']
})
export class RankingsComponent implements OnInit {
  @ViewChild('rankingTable') rankingTable?: RankingTableComponent;

  private combinedSubscription: Subscription;
  valueChangesSubscription: Subscription;

  private updatedRankedResumes!: Subscription;
  updatedResumeRankings: [] | undefined = undefined;

  jobCollection: JobPosting[] = [];
  resumeRankingCollection: ResumeRanking[] = [];

  optionValue: string | null = null;
  selectGroup = this._formBuilder.group({
    job: ['', Validators.required],
  });

  constructor(private _dataService: DataService, private _httpClient: HttpClient, private _formBuilder: FormBuilder, private _restService: RestService) { 
    this.combinedSubscription = combineLatest([
      this._dataService.sharedJobList,
      this._dataService.sharedResumeList
    ]).subscribe(([jobData, resumeData]) => {
      this.jobCollection = jobData;
      this.resumeRankingCollection = resumeData;
    });
    this.valueChangesSubscription = this.selectGroup.controls['job'].valueChanges.subscribe(value => {
      if (!value) {
        this._dataService.clearResumeList();
        this._dataService.updateSelectedJobId(null);
        return;
      }
      this.optionValue = value;
      this._dataService.updateSelectedJobId(this.optionValue);
      // We want to update the rankings view when the user selects a new job based off the job_id
      this._dataService.clearResumeList();
      this.getResumesByJobId(Number(this.optionValue));
    });
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.combinedSubscription.unsubscribe();
    this.valueChangesSubscription.unsubscribe();
  }

  // TODO FIX ERROR HANDLING ACROSS PROJECT
  setResumeRankings(): void {
    var selectedJob = this.getCurrentJob();
    if (!this.optionValue || !selectedJob || !selectedJob.description) return;
    this.updatedRankedResumes = this._restService.rankResumes(Number(this.optionValue), selectedJob.description).subscribe({
      next: (data: any) => {
        if (!this.rankingTable) return;

        const dataToUpdate: [] = data?.updated_resumes;
        if (!dataToUpdate || dataToUpdate.length == 0) return;
        
        dataToUpdate.forEach(data => {
          const foundResume = this.resumeRankingCollection.find(resume => resume.id == data[1]);
          if (foundResume)
            foundResume.similarity_score = parseFloat(parseFloat(data[0]).toFixed(6));
        });

        const currentPage = this.rankingTable.paginator.pageIndex;
        this._dataService.updateResumeList(this.resumeRankingCollection);
        this.rankingTable.paginator.pageIndex = currentPage;
      },
      error: async (exception: any) => console.log(exception.error.message),
      complete: () => {
        this.updatedRankedResumes.unsubscribe();
      }
    });
  }

  getCurrentJob(): JobPosting | undefined {
    return this.jobCollection.find(job => job.job_id === Number(this.optionValue));
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
