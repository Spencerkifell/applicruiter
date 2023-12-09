import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import { RestService } from 'src/app/Services/rest/rest.service';
import { DataService } from 'src/app/Services/data/data.service';

@Component({
  selector: 'app-job-modal',
  templateUrl: './job-modal.component.html',
  styleUrls: ['./job-modal.component.css']
})
export class JobModalComponent implements OnInit{
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

  private profile: any;

  constructor(
    private _formBuilder: FormBuilder, 
    private _restService: RestService,
    private _dataService: DataService,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this._authService.user$.subscribe((profile) => { 
      this.profile = profile;
    });
  }

  onClick(): void {
    if (this.firstFormGroup.invalid || this.secondFormGroup.invalid || this.thirdFormGroup.invalid || !this.profile)  return;
    
    const { title, description, country, city } = this.firstFormGroup.value;
    const { level, skills } = this.secondFormGroup.value;
    const { emails } = this.thirdFormGroup.value;

    let jobData = {
      title: title, 
      description: description, 
      country: country, 
      city: city, 
      level: level,
      skills: skills
    };

    let validEmails = this.filter(emails);

    let currentUserEmail: string = this.profile.email;
    let emailData: string[] = [currentUserEmail];

    if (validEmails && emails.trim() !== '')
      emailData = [...emails.split(','), ...emailData];

    this._restService.createJob(jobData, emailData);
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
