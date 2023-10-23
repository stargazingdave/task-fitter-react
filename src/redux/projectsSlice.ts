import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../src/store'
import { DocumentData } from 'firebase/firestore';

// Define a type for the slice state
interface projectsState {
    projectStack: DocumentData[],
}

// Define the initial state using that type
const initialState: projectsState = {
    projectStack: [],
}

export const projectsSlice = createSlice({
  name: 'projects',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    pushProject: (state, action: PayloadAction<DocumentData>) => {
        state.projectStack.push(action.payload);
    },
    projectsDestroy: (state) => {
        state.projectStack = [] as DocumentData[];
    },
  },
})

export const { 
    pushProject, 
    projectsDestroy,
} = projectsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectProjectStack = (state: RootState) => state.projects.projectStack;

export default projectsSlice.reducer;