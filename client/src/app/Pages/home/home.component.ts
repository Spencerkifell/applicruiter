import { Component, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { JobModalComponent } from 'src/app/Components/job-modal/job-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  posting:any;
  constructor() { 
    this.posting = {
      "position-title" : "Software Engineer", 
      "city":"San Francisco",
      "state":"CA",
      "level":"Entry",
    };
  }

  ngOnInit(): void {
  }

}
