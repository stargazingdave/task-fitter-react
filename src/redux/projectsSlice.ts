import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../src/store'
import { DocumentData } from 'firebase/firestore';

// Define a type for the slice state
interface projectsState {
    projects: DocumentData[],
    projectStack: DocumentData[],
    companies: DocumentData[],
}

// Define the initial state using that type
const initialState: projectsState = {
    projects: [],
    projectStack: [],
    companies: [],
}

export const projectsSlice = createSlice({
  name: 'projects',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    initProjects: (state, action: PayloadAction<DocumentData[]>) => {
        state.projects = action.payload;
    },
    initCompanies: (state, action: PayloadAction<DocumentData[]>) => {
        state.companies = action.payload;
    },
    pushProject: (state, action: PayloadAction<DocumentData>) => {
        state.projectStack.push(action.payload);
    },
    projectsDestroy: (state) => {
        state.projectStack = [] as DocumentData[];
    },
    setProjectStack: (state, action: PayloadAction<DocumentData[]>) => {
        state.projectStack = action.payload;
    },
  },
})

export const { 
    initProjects, 
    initCompanies,
    pushProject, 
    projectsDestroy,
    setProjectStack,
} = projectsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectProjectStack = (state: RootState) => state.projects.projectStack;
export const selectProjects = (state: RootState) => state.projects.projects;
export const selectCompanies = (state: RootState) => state.projects.companies;

export default projectsSlice.reducer;