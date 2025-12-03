import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Routes from './utils/Router.tsx'
import './index.css'

// Cria o cliente do React Query
const queryClient = new QueryClient()

// O vite cria isso aqui automaticamente.
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <Routes />
        </QueryClientProvider>
    </StrictMode >,
)