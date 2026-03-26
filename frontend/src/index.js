import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import './styles/global.css';
import './styles/variables.css';
import './App.css';

// ============================================================================
// RENDER APP
// ============================================================================

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>
);

// ============================================================================
// REGISTER SERVICE WORKER (Optional - for PWA)
// ============================================================================

// Uncomment this if you want to enable service workers for offline support
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/service-worker.js')
//             .then(registration => {
//                 console.log('SW registered: ', registration);
//             })
//             .catch(error => {
//                 console.log('SW registration failed: ', error);
//             });
//     });
// }

// ============================================================================
// LOG APP VERSION
// ============================================================================

console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏥 HOSPITAL ACTIVITY DASHBOARD v2.0.0                   ║
║                                                           ║
║   Status: Running                                         ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                   ║
║                                                           ║
║   Features:                                               ║
║   • Real-time WebSocket updates                           ║
║   • Activity tracking                                     ║
║   • Employee & patient management                         ║
║   • Room occupancy monitoring                             ║
║   • Shift scheduling                                      ║
║   • Badge access control                                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);