import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JobsState } from './jobs.reducer';

const getJobsState = createFeatureSelector<JobsState>('jobs');

export const selectCurrentJobs = createSelector(
  getJobsState,
  (state: JobsState) => state.jobs
);

export const selectCurrentJob = createSelector(
  getJobsState,
  (state: JobsState) => state.currentJob
);
