import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './Pages/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JobModalComponent } from './Components/job-modal/job-modal.component';
import { MatCardModule } from '@angular/material/card';
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
import { NgxPaginationModule } from 'ngx-pagination';
import { JobInfoComponent } from './Components/job-info/job-info.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DataTableComponent } from './Components/data-table/data-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RankingsComponent } from './Components/rankings/rankings.component';
import { RankingTableComponent } from './Components/ranking-table/ranking-table.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorComponent } from './Pages/error/error.component';
import { AuthModule } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';
import { NewUserButtonsComponent } from './Components/new-user-buttons/new-user-buttons.component';
import { EmployerComponent } from './Pages/employer/employer.component';
import { SideNavComponent } from './Components/side-nav/side-nav.component';
import { SideNavButtonComponent } from './Components/side-nav-button/side-nav-button.component';
import { StoreModule } from '@ngrx/store';
import { authReducer } from './Store/Auth/auth.reducer';
import { AuthService } from './Services/auth/auth.service';
import { AppState } from './app.state';
import { OrganizationsComponent } from './Pages/organizations/organizations.component';
import { OrganizationsTableComponent } from './Components/organizations-table/organizations-table.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { OrganizationModalComponent } from './Components/organization-modal/organization-modal.component';
import { organizationsReducer } from './Store/Organizations/organizations.reducer';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    JobModalComponent,
    JobInfoComponent,
    DataTableComponent,
    RankingsComponent,
    RankingTableComponent,
    ErrorComponent,
    NewUserButtonsComponent,
    EmployerComponent,
    SideNavComponent,
    SideNavButtonComponent,
    OrganizationsComponent,
    OrganizationsTableComponent,
    DashboardComponent,
    OrganizationModalComponent,
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
    MatChipsModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatToolbarModule,
    NgxDatatableModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    AuthModule.forRoot({
      domain: environment.authDomain,
      clientId: environment.authClientId,
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    }),
    StoreModule.forRoot<AppState>({
      auth: authReducer,
      organizations: organizationsReducer,
    }),
  ],
  providers: [AuthService],
  bootstrap: [AppComponent],
})
export class AppModule {}
