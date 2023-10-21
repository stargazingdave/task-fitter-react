import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../src/store'
import { Firestore } from 'firebase/firestore';

// Define a type for the slice state
interface DatabaseState {
  db: Firestore,
}

// Define the initial state using that type
const initialState: DatabaseState = {
    db: {} as Firestore,
}

export const databaseSlice = createSlice({
  name: 'database',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    databaseInit: (state, action: PayloadAction<Firestore>) => {
        state.db = action.payload;
    },
    databaseDestroy: (state) => {
        state.db = {} as Firestore;
    },
  },
})

export const { databaseInit, databaseDestroy } = databaseSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectDb = (state: RootState) => state.database.db;

export default databaseSlice.reducer;