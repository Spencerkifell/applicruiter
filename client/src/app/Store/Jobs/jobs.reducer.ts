import { createReducer, on } from '@ngrx/store';
import { JobPosting } from 'src/app/models';
import * as jobActions from './jobs.actions';

export interface JobsState {
  jobs: JobPosting[];
  currentJob: JobPosting | null;
}

export const initialOrganizationsState: JobsState = {
  jobs: [],
  currentJob: null,
};

export const jobsReducer = createReducer(
  initialOrganizationsState,
  on(jobActions.setCurrentJobs, (state, { jobs }) => ({
    ...state,
    jobs,
  })),
  on(jobActions.updateCurrentJobs, (state, { jobs }) => ({
    ...state,
    jobs: [...state.jobs, ...jobs],
  })),
  on(jobActions.clearJobs, (state) => ({
    ...state,
    jobs: [],
  })),
  on(jobActions.setCurrentJob, (state, { job }) => ({
    ...state,
    currentJob: job,
  })),
  on(jobActions.clearCurrentJob, (state) => ({
    ...state,
    currentJob: null,
  }))
);
