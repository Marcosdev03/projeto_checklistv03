import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Routes from './utils/Router.tsx'
import './index.css'

// Inicializa o tema antes do React renderizar (evita flash)
const savedTheme = localStorage.getItem("theme") ?? "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

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