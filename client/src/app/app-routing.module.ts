import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { ErrorComponent } from './Pages/error/error.component';
import { EmployerComponent } from './Pages/employer/employer.component';
import { OrganizationsComponent } from './Pages/organizations/organizations.component';
import { DashboardComponent } from './Pages/dashboard/dashboard.component';
import { AuthGuard } from './Guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'employer',
    component: EmployerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'organizations',
    component: OrganizationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'error',
    component: ErrorComponent,
  },
  { path: '**', redirectTo: 'error' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
