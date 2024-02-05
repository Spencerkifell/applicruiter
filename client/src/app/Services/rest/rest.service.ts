import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { DataService } from '../data/data.service';
import { environment } from 'src/environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class RestService {
  private dataSubscription: Subscription;
  jobCollection: any = [];

  constructor(
    private httpClient: HttpClient,
    private dataProvider: DataService
  ) {
    this.dataSubscription = this.dataProvider.sharedJobList.subscribe(
      (data) => {
        this.jobCollection = data;
      }
    );
  }

  ngOnDestroy() {
    this.dataSubscription.unsubscribe();
  }

  postOrganization(
    headers: any,
    params: any,
    data: { organization: any; emails: string[] }
  ) {
    const url = `${API_URL}/api/organization/`;
    return this.httpClient.post<any>(url, data, {
      observe: 'response',
      headers,
      params,
    });
  }

  getOrganizations(headers: any, params: any, userId: number) {
    const url = `${API_URL}/api/organization/user/${userId}`;
    return this.httpClient.get<any>(url, {
      observe: 'response',
      headers,
      params,
    });
  }

  getOrganization(headers: any, params: any, orgId: number) {
    const url = `${API_URL}/api/organization/${orgId}`;
    return this.httpClient.get<any>(url, {
      observe: 'response',
      headers,
      params,
    });
  }

  postJob(headers: any, params: any, data: { job: any }) {
    const url = `${API_URL}/api/job/`;
    return this.httpClient.post<any>(url, data, {
      observe: 'response',
      headers,
      params,
    });
  }

  getJobs(headers: any, params: any, orgId: number) {
    const url = `${API_URL}/api/job/organization/${orgId}`;
    return this.httpClient.get<any>(url, {
      observe: 'response',
      headers,
      params,
    });
  }

  getResumes(headers: any, params: any, job_id: any): Observable<any> {
    const url = `${API_URL}/api/resume/job/${job_id}`;
    return this.httpClient.get<any>(url, {
      observe: 'response',
      headers,
      params,
    });
  }

  createResumes(job_id: any, resumes: File[]) {
    // Create a DataTransfer object
    const dataTransfer = new DataTransfer();
    resumes.forEach((resume) => dataTransfer.items.add(resume));

    // Create a new FileList from the DataTransfer object
    const selectedFileList = dataTransfer.files;
    const formData = new FormData();

    for (let i = 0; i < resumes.length; i++) {
      const resume = selectedFileList.item(i);
      if (resume) {
        formData.append('resumes', resume, resume.name);
      }
    }
    return this.postResumes(job_id, formData);
  }

  postResumes(job_id: number, formDataList: FormData) {
    const url = `${API_URL}/api/resume/upload/${job_id}`;
    return this.httpClient.post<any>(url, formDataList);
  }

  rankResumes(jobId: number, jobDesc: string): Observable<any[]> {
    const url = `${API_URL}/api/resume/rank/${jobId}`;
    return this.httpClient.post<any>(url, { job_description: jobDesc });
  }

  getSignedResumeURL(filePath: string): Observable<any> {
    const url = `${API_URL}/api/aws/resume/url`;
    return this.httpClient.post<any>(url, { path: filePath });
  }

  getUser(authId: string): Observable<any> {
    const url = `${API_URL}/api/user/${authId}`;
    return this.httpClient.get<any>(url, { observe: 'response' });
  }

  postUser(user: any): Observable<any> {
    const url = `${API_URL}/api/user/`;
    return this.httpClient.post<any>(url, user, { observe: 'response' });
  }
}
