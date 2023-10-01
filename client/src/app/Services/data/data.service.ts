import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private jobList = new BehaviorSubject([]);
  sharedJobList = this.jobList.asObservable();

  constructor() { }

  updateCategoryList(data: any) {
    this.jobList.next(data);
  }
}
