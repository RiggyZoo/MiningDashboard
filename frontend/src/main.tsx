import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import '@carbon/react/index.scss';
import './index.css';
import App from './App.tsx';
import { queryClient } from './queries/queryClient.ts';
import { startBlocksStream } from './services/blocksStream.ts';
import { startMempoolWS } from './services/mempoolWS.ts';

// Запускаем стримы один раз при старте приложения — вне React
startBlocksStream();
startMempoolWS();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
