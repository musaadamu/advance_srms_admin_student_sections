import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import authSlice from './slices/authSlice'
import userSlice from './slices/userSlice'
import studentSlice from './slices/studentSlice'
import courseSlice from './slices/courseSlice'
import staffSlice from './slices/staffSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: userSlice,
    students: studentSlice,
    courses: courseSlice,
    staff: staffSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
