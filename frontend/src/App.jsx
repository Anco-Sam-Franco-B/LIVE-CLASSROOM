import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from './routes'
import { ToastProvider } from './components/Toast'
import useAuthStore from './store/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000, gcTime: 600000 },
  },
})

export default function App() {
  const { isAuthenticated, loadPermissions, permissions } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated && permissions.length === 0) {
      loadPermissions()
    }
  }, [isAuthenticated, permissions.length, loadPermissions])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryClientProvider>
  )
}
