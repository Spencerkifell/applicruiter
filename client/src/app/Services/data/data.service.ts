import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private jobList = new BehaviorSubject([]);
  sharedJobList = this.jobList.asObservable();

  constructor() { }

  updateJobList(data: any) {
    this.jobList.next(data);
  }
}
