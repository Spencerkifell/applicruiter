import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RestService } from 'src/app/Services/rest/rest.service';
import { DataService } from 'src/app/Services/data/data.service';

@Component({
  selector: 'app-job-info',
  templateUrl: './job-info.component.html',
  styleUrls: ['./job-info.component.css']
})
export class JobInfoComponent implements OnInit {
  fileForm: FormGroup;
  skills: string[] = [];
  selectedFiles: File[] = [];
  selectedFilesCount: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private _formBuilder: FormBuilder, 
    private _restService: RestService,
    private _dataService: DataService
  ) {
    this.fileForm = this._formBuilder.group({
      files: this._formBuilder.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    this.skills = this.data.skills.split(',').map((skill: string) => skill.trim().charAt(0).toUpperCase() + skill.slice(1));
  }


  onFileSelect(event: any): void {
    const files = event.target.files;
    const filesFormArray = this.fileForm.get('files') as FormArray;

    filesFormArray.clear();

    for (const file of files) {
      const fileControl = this._formBuilder.control(file);
      filesFormArray.push(fileControl);
    }

    this.selectedFilesCount = filesFormArray.length;      
  }

  clear(): void {
    const filesFormArray = this.fileForm.get('files') as FormArray;
    filesFormArray.clear();
    this.selectedFilesCount = filesFormArray.length;
  }

  onSubmit() {
      if (!this.fileForm.valid)
        return;
      const filesFormArray = this.fileForm.get('files') as FormArray;
      const selectedFiles: File[] = filesFormArray.value;

      this._restService.createResumes(this.data.job_id, selectedFiles);
      this._dataService.resumeModalIsCompleted(true);
  }
}
