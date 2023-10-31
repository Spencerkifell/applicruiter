import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private jobList = new BehaviorSubject([]);
  sharedJobList = this.jobList.asObservable();

  private jobModalStatus = new BehaviorSubject<boolean>(false);
  sharedJobModalStatus = this.jobModalStatus.asObservable();

  private resumeModalStatus = new BehaviorSubject<boolean>(false);
  sharedResumeModalStatus = this.resumeModalStatus.asObservable();

  private resumeList = new BehaviorSubject<any>([]);
  sharedResumeList = this.resumeList.asObservable();

  private selectedJobId = new BehaviorSubject<string | null>(null);
  sharedSelectedJobId = this.selectedJobId;

  constructor() { }

  updateJobList(data: any) {
    this.jobList.next(data);
  }

  updateResumeList(data: any) {
    this.resumeList.next([...this.resumeList.getValue(), ...data]);
  }

  clearResumeList() {
    this.resumeList.next([]);
  }

  updateSelectedJobId(data: string | null) {
    this.selectedJobId.next(data);
  }

  modalIsCompleted(data: boolean) {
    this.jobModalStatus.next(data);
  }

  resumeModalIsCompleted(data: boolean) {
    this.resumeModalStatus.next(data);
  }
}
