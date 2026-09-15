import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { runDryWriteQueensTemplateReadback } from './services/queensTemplateRuntime';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const qtaReadback = new URLSearchParams(window.location.search).get('qta_runtime') === '1';
if (qtaReadback) {
  rootElement.textContent = JSON.stringify(runDryWriteQueensTemplateReadback());
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}