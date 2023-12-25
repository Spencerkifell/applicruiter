import { AuthState } from './Store/Auth/auth.reducer';
import { JobsState } from './Store/Jobs/jobs.reducer';
import { OrganizationsState } from './Store/Organizations/organizations.reducer';

export interface AppState {
  auth: AuthState;
  organizations: OrganizationsState;
  jobs: JobsState;
}
