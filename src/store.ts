import { configureStore } from '@reduxjs/toolkit'
import userReducer from './redux/userSlice'
import contactsReducer from './redux/contactsSlice'
import databaseReducer from './redux/databaseSlice'

export const store = configureStore({
    reducer: {
        user: userReducer,
        contacts: contactsReducer,
        database: databaseReducer,
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch