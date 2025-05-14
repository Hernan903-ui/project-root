// src/index.js
import React from 'react'
import ReactDOM from 'react-dom/client'

// 1) Redux
import { Provider as ReduxProvider } from 'react-redux'
import store from './store'

// 2) React Query
import {
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'

// 3) Material-UI Theme
import { ThemeProvider } from '@mui/material/styles'
import getTheme from './themes'

// 4) React Router Data-Router
import { RouterProvider } from 'react-router-dom'
import router from './routes'

// crea una sola instancia de QueryClient
const queryClient = new QueryClient()

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={getTheme('light')}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  </React.StrictMode>
)