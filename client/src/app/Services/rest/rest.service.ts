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
        let { title, description, country, city, level, skills, job_id } = data.job;
        this.jobCollection.push({
          job_id: job_id,
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

  createResumes(job_id: any, resumes: File[]) {
    let url = `http://127.0.0.1:5000/api/upload_resume/${job_id}`;

    // Create a DataTransfer object
    const dataTransfer = new DataTransfer();

    // Add each File object to the DataTransfer object
    for (const file of resumes) {
      dataTransfer.items.add(file);
    }

    // Create a new FileList from the DataTransfer object
    const selectedFileList = dataTransfer.files;

    const formData = new FormData();

    // Append each resume file to the FormData object
    for (let i = 0; i < resumes.length; i++) {
      const resume = selectedFileList.item(i);
      if (resume) {
        formData.append('resumes', resume, resume.name); // 'resumes' should match the field name expected by your Flask API
      }
    }

    // Make the HTTP POST request with FormData
    this.httpClient.post(url, formData).subscribe({
      next: async (data: any) => {
        console.log(data);
      },
      error: async (exception: any) => alert(exception.error.message)
    });
  }
}
