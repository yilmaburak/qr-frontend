import { createSlice } from '@reduxjs/toolkit'

export const generalSlice = createSlice({
    name: 'general',
    initialState: {
        isSidebarOpen: false,
        title: 'Dashboard',
        subTitle: '',
        isLoading: false,
        error: null as string | null,
    },
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen
        },
        setTitle: (state, action) => {
            state.title = action.payload
        },
        setSubTitle: (state, action) => {
            state.subTitle = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    }
})

export const {
    toggleSidebar,
    setTitle,
    setSubTitle,
    setLoading,
    setError
} = generalSlice.actions

export default generalSlice.reducer