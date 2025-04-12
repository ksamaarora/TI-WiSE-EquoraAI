import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get the root element
const rootElement = document.getElementById("root")!;

// Set up accessibility attributes
rootElement.setAttribute('lang', 'en');
rootElement.setAttribute('role', 'application');

// Render the application
createRoot(rootElement).render(<App />);
