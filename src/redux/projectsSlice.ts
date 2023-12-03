import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../src/store'
import { DocumentData } from 'firebase/firestore';

// Define a type for the slice state
interface projectsState {
    projects: DocumentData[],
    projectStack: DocumentData[],
}

// Define the initial state using that type
const initialState: projectsState = {
    projects: [],
    projectStack: [],
}

export const projectsSlice = createSlice({
  name: 'projects',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    initProjects: (state, action: PayloadAction<DocumentData[]>) => {
        state.projects = action.payload;
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
    pushProject, 
    projectsDestroy,
    setProjectStack,
} = projectsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectProjectStack = (state: RootState) => state.projects.projectStack;
export const selectProjects = (state: RootState) => state.projects.projects;

export default projectsSlice.reducer;