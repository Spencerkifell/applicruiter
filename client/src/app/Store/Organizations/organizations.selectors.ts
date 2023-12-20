import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrganizationsState } from './organizations.reducer';

const getOrganizationsState =
  createFeatureSelector<OrganizationsState>('organizations');

export const selectOrganizations = createSelector(
  getOrganizationsState,
  (state: OrganizationsState) => state.organizations
);
