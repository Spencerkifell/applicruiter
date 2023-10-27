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

  private resumeList = new BehaviorSubject([]);
  sharedResumeList = this.resumeList.asObservable();

  constructor() { }

  updateJobList(data: any) {
    this.jobList.next(data);
  }

  updateResumeList(data: any) {
    this.resumeList.next(data);
  }

  modalIsCompleted(data: boolean) {
    this.jobModalStatus.next(data);
  }

  resumeModalIsCompleted(data: boolean) {
    this.resumeModalStatus.next(data);
  }
}
