import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RestService } from 'src/app/Services/rest/rest.service';
import { DataService } from 'src/app/Services/data/data.service';

@Component({
  selector: 'app-job-modal',
  templateUrl: './job-modal.component.html',
  styleUrls: ['./job-modal.component.css']
})
export class JobModalComponent implements OnInit {
  firstFormGroup = this._formBuilder.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    country: ['', Validators.required],
    city: ['', Validators.required],
  });

  secondFormGroup = this._formBuilder.group({
    level: ['', Validators.required],
    skills: ['', [Validators.required, this.skillValidator]],
  });

  constructor(
    private _formBuilder: FormBuilder, 
    private _restService: RestService,
    private _dataService: DataService
  ) { }

  ngOnInit(): void {
  }

  onClick(): void {
    if (this.firstFormGroup.invalid || this.secondFormGroup.invalid)  return;
    
    let jobData = {
      title: this.firstFormGroup.get('title')?.value, 
      description: this.firstFormGroup.get('description')?.value, 
      country: this.firstFormGroup.get('country')?.value, 
      city: this.firstFormGroup.get('city')?.value, 
      level: this.secondFormGroup.get('level')?.value,
      skills: this.secondFormGroup.get('skills')?.value
    };

    this._restService.createJob(jobData);
    this._dataService.modalIsCompleted(true);
  }

  skillValidator(control: any): any {
    const value: string = control.value;
    const result = value.trim().split(/(,)/)
    const totalWords = result.filter((word) => word !== ',' && word.trim() !== '').length;
    const totalCommas = result.filter((comma) => comma == ',').length;
    return totalCommas === totalWords - 1 ? null : { 'invalidSkills': true };
  }
}
