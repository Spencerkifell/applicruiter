import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { DataService } from '../data/data.service';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  private dataSubscription: Subscription; 
  jobCollection: any = [];

  constructor(
    private httpClient: HttpClient,
    private dataProvider: DataService
  ) { 
    this.dataSubscription = this.dataProvider.sharedJobList.subscribe(data => {
      this.jobCollection = data;
    });
  }

  createJob(job: any) {
    this.httpClient.post('http://127.0.0.1:5000/api/jobs', job).subscribe({
      next: async (data: any) => {
        let { title, description, country, city, level, skills } = data.job;
        this.jobCollection.push({
          title: title, 
          description: description, 
          country: country, 
          city: city, 
          level: level, 
          skills: skills
        });
        this.dataProvider.updateJobList(this.jobCollection);
      },
      error: async (exception: any) => alert(exception.error.message)
    });  
  }
}
