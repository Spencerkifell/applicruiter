import { createReducer, on } from '@ngrx/store';
import * as organizationsActions from './organizations.actions';
import { Organization } from 'src/app/models';

export interface OrganizationsState {
  organizations: Organization[];
}

export const initialOrganizationsState: OrganizationsState = {
  organizations: [],
};

export const organizationsReducer = createReducer(
  initialOrganizationsState,
  on(organizationsActions.setOrganizations, (state, { organizations }) => ({
    ...state,
    organizations,
  })),
  on(organizationsActions.updateOrganization, (state, { organization }) => ({
    ...state,
    organizations: [...state.organizations, organization],
  })),
  on(organizationsActions.clearOrganizations, (state) => ({
    ...state,
    organizations: [],
  }))
);
