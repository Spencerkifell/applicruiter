import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RestService } from 'src/app/Services/rest/rest.service';
import { DataService } from 'src/app/Services/data/data.service';

@Component({
  selector: 'app-job-modal',
  templateUrl: './job-modal.component.html',
  styleUrls: ['./job-modal.component.css']
})
export class JobModalComponent {
  firstFormGroup = this._formBuilder.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    country: ['', Validators.required],
    city: ['', Validators.required],
  });

  secondFormGroup = this._formBuilder.group({
    level: ['', Validators.required],
    skills: ['', [Validators.required, this.skillValidator.bind(this)]],
  });

  thirdFormGroup = this._formBuilder.group({
    emails: ['', this.emailValidator.bind(this)],
  });

  constructor(
    private _formBuilder: FormBuilder, 
    private _restService: RestService,
    private _dataService: DataService
  ) { }

  onClick(): void {
    if (this.firstFormGroup.invalid || this.secondFormGroup.invalid || this.thirdFormGroup.invalid)  return;
    
    let jobData = {
      title: this.firstFormGroup.get('title')?.value, 
      description: this.firstFormGroup.get('description')?.value, 
      country: this.firstFormGroup.get('country')?.value, 
      city: this.firstFormGroup.get('city')?.value, 
      level: this.secondFormGroup.get('level')?.value,
      skills: this.secondFormGroup.get('skills')?.value
    };

    let emails = this.thirdFormGroup.get('emails')?.value;
    let validEmails = this.filter(emails);

    this._restService.createJob(jobData, validEmails ? emails.trim().split(',') : null);
    this._dataService.modalIsCompleted(true);
  }

  filter(value: string): boolean {
    const result: string[] = value.trim().split(/(,)/)
    const totalWords = result.filter((word) => word !== ',' && word.trim() !== '').length;
    const totalCommas = result.filter((comma) => comma == ',').length;
    return totalCommas === totalWords - 1;
  }

  skillValidator(control: any): any {
    const { value } = control;
    return this.filter(value) ? null : { 'invalidSkills': true };
  }

  emailValidator(control: any): any {
    const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    const { value } = control;
    const trimmedValue = value.trim().replace(/\s+/g, "");
    
    let invalidEmails: boolean = false;

    if (trimmedValue == '') return null;

    const results: string[] = trimmedValue.split(',');
    results.forEach((email: string) => {
      if (!emailPattern.test(email))
        invalidEmails = true;
    });

    return invalidEmails ? { 'invalidEmails': true, 'emails': results } : null;
  }
}
