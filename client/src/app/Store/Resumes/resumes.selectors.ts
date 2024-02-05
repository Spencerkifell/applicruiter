import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ResumesState } from './resumes.reducer';

const getResumesState = createFeatureSelector<ResumesState>('resumes');

export const selectCurrentResumes = createSelector(
  getResumesState,
  (state: ResumesState) => state.resumes
);
