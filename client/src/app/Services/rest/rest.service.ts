import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { DataService } from '../data/data.service';
import { environment } from 'src/environments/environment';
import { Organization } from 'src/app/models';

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

  instantiateOrganization(data: any, owner: number): Organization | null {
    const { org_id: id, name, country, city, address } = data;

    if (!id || !name || !country || !city || !address || !owner) return null;

    const dateCreated = new Date().toISOString().slice(0, 10);

    return {
      id: id,
      name: name,
      owner: owner,
      address: address,
      country: country,
      city: city,
      totalMembers: 1,
      totalListings: 0,
      dateCreated: dateCreated,
    };
  }

  createJob(job: any, emails: string[] | null = null) {
    this.httpClient
      .post(`${API_URL}/api/job`, { job: job, emails: emails })
      .subscribe({
        next: async (data: any) => {
          let { title, description, country, city, level, skills, job_id } =
            data.data;
          this.jobCollection.push({
            job_id: job_id,
            title: title,
            description: description,
            country: country,
            city: city,
            level: level,
            skills: skills,
            checked: false,
          });
          this.dataProvider.updateJobList(this.jobCollection);
        },
        error: async (exception: any) => alert(exception.error.message),
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
