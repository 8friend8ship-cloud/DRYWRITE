import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CommonServiceShell } from './components/CommonServiceShell';
import { hydrateDryWriterLocalCache } from './services/contentApiService';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

async function bootstrap() {
  await hydrateDryWriterLocalCache();
  root.render(
    <React.StrictMode>
      <App />
      <CommonServiceShell />
    </React.StrictMode>
  );
}

void bootstrap();
