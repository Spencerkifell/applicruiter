import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { DataService } from 'src/app/Services/data/data.service';
import { RestService } from 'src/app/Services/rest/rest.service';
import { JobPosting } from '../utils';
import { FormBuilder, Validators } from '@angular/forms';
import { ResumeRanking } from '../utils';
import { HttpClient } from '@angular/common/http';
import { RankingTableComponent } from '../ranking-table/ranking-table.component';
import { environment } from 'src/environments/environment';
import { AuthService } from '@auth0/auth0-angular';

const API_URL = environment.apiUrl;

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

  private authSubscription: Subscription;
  isAuthenticated: boolean = false;

  jobCollection: JobPosting[] = [];
  resumeRankingCollection: ResumeRanking[] = [];

  selectedJobId: string | null = null;
  selectedJob: JobPosting | undefined = undefined;

  optionValue: string | null = null;
  selectGroup = this._formBuilder.group({
    job: ['', Validators.required],
  });

  constructor(
    private _dataService: DataService, 
    private _httpClient: HttpClient, 
    private _formBuilder: FormBuilder, 
    private _restService: RestService,
    private _authService: AuthService
  ) { 
    this.combinedSubscription = combineLatest([
      this._dataService.sharedJobList,
      this._dataService.sharedResumeList,
      this._dataService.sharedSelectedJobId
    ]).subscribe(([jobData, resumeData, selectedJobId]) => {
      this.jobCollection = jobData;
      this.resumeRankingCollection = resumeData;
      this.selectedJobId = selectedJobId;
    });
    this.valueChangesSubscription = this._dataService.sharedSelectedJobId.subscribe(value => {
      if (!value) {
        this._dataService.clearResumeList();
        return;
      }
      this._dataService.clearResumeList();

      this.selectedJob = this.getCurrentJob();
      this.getResumesByJobId(Number(value));
    });
    this.authSubscription = this._authService.isAuthenticated$.subscribe(data => {
      this.isAuthenticated = data;
    });
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.combinedSubscription.unsubscribe();
    this.valueChangesSubscription.unsubscribe();
    this.authSubscription.unsubscribe();
  }

  setResumeRankings(): void {
    // var selectedJob = this.getCurrentJob();
    if (!this.selectedJobId || !this.selectedJob || !this.selectedJob.description) return;
    this.updatedRankedResumes = this._restService.rankResumes(Number(this.selectedJobId), this.selectedJob.description).subscribe({
      next: (data: any) => {
        if (!this.rankingTable) return;

        const dataToUpdate: [] = data?.data;
        if (!dataToUpdate || dataToUpdate.length == 0) return;
        
        dataToUpdate.forEach(data => {
          const foundResume = this.resumeRankingCollection.find(resume => resume.id == data[1]);
          if (foundResume)
            foundResume.similarity_score = parseFloat(parseFloat(data[0]).toFixed(6));
        });

        const currentPage = this.rankingTable.paginator.pageIndex;
        this.rankingTable.paginator.pageIndex = currentPage;
      },
      error: async (exception: any) => console.log(exception.error.message),
      complete: () => {
        this.updatedRankedResumes.unsubscribe();
      }
    });
  }

  getCurrentJob(): JobPosting | undefined {
    return this.jobCollection.find(job => job.job_id === Number(this.selectedJobId));
  }

  getResumesByJobId(job_id: number): void {
    this._httpClient.get(`${API_URL}/api/resume/get/ranking/${job_id}`).subscribe({
      next: (data: any) => {
        this._dataService.updateResumeList(data?.data);
      },
      error: async (exception: any) => console.log(exception.error.message)
    })
  }
}
