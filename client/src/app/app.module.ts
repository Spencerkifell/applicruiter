import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './Pages/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JobModalComponent } from './Components/job-modal/job-modal.component';
import { MatCardModule } from '@angular/material/card';
import { CardComponent } from './Components/card/card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'; 
import { HttpClientModule } from '@angular/common/http';
import { MatChipsModule } from '@angular/material/chips';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    JobModalComponent,
    CardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatStepperModule,
    FormsModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    HttpClientModule,
    MatCardModule,
    MatChipsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  
}
