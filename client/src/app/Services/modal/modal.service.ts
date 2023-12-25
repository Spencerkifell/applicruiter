import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private submissionSuccess = new BehaviorSubject<boolean>(false);
  sharedSubmissionSuccess = this.submissionSuccess.asObservable();

  constructor(private dialog: MatDialog) {}

  openModal(component: any, data: any = null) {
    this.submissionSuccess.next(false);
    return this.dialog.open(component, {
      width: '750px',
      data: data ? data : null,
    });
  }

  updateSubmission(data: boolean) {
    this.submissionSuccess.next(data);
  }
}
