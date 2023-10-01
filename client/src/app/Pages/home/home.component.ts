import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { JobModalComponent } from 'src/app/Components/job-modal/job-modal.component';
import { ModalService } from 'src/app/Services/modal/modal.service';
import { DataService } from 'src/app/Services/data/data.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private jobSubscripton: Subscription;
  jobCollection: any = [];
  
  constructor(
    private _modalService: ModalService,
    private _dataService: DataService,
    private _httpClient: HttpClient
    ) 
  { 
    this.jobSubscripton = this._dataService.sharedJobList.subscribe(data => {this.jobCollection = data;});
  }

  ngOnInit(): void {
    this.getJobs();
  }

  ngOnDestroy(): void {
    this.jobSubscripton.unsubscribe();
  }

  openModal() {
    const modalRef = this._modalService.openModal(JobModalComponent);
  }

  getJobs() {
    this._httpClient.get('http://127.0.0.1:5000/api/jobs').subscribe({
      next: (data: any) => {
        this.jobCollection = data?.jobs
        this._dataService.updateJobList(this.jobCollection);
      },
      error: async (exception: any) => console.log(exception.error.message)
    });
  }
}
