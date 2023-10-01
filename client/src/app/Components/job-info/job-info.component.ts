import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-job-info',
  templateUrl: './job-info.component.html',
  styleUrls: ['./job-info.component.css']
})
export class JobInfoComponent implements OnInit {
  skills: string[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.skills = this.data.skills.split(',')
  }
}
