import { Component, OnInit } from '@angular/core';
import { JobModalComponent } from 'src/app/Components/job-modal/job-modal.component';
import { ModalService } from 'src/app/Services/modal/modal.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // posting:any;
  constructor(private _modalService: ModalService) { 
    // this.posting = {
    //   "position-title" : "Software Engineer", 
    //   "city":"San Francisco",
    //   "state":"CA",
    //   "level":"Entry",
    // };
  }

  ngOnInit(): void {

  }

  openModal() {
    const modalRef = this._modalService.openModal(JobModalComponent);
  }
}
