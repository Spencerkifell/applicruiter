import { createReducer, on } from '@ngrx/store';
import * as resumeActions from './resumes.actions';
import { ResumeRanking } from 'src/app/models';

export interface ResumesState {
  resumes: ResumeRanking[];
  currentResume: ResumeRanking | null;
}

export const initialResumesState: ResumesState = {
  resumes: [],
  currentResume: null,
};

export const resumesReducer = createReducer(
  initialResumesState,
  on(resumeActions.setCurrentResumes, (state, { resumes }) => ({
    ...state,
    resumes,
  })),
  on(resumeActions.updateCurrentResumes, (state, { resumes }) => ({
    ...state,
    resumes: [...state.resumes, ...resumes],
  })),
  on(resumeActions.clearResumes, (state) => ({
    ...state,
    resumes: [],
  }))
);
