import React from 'react';
import ReactDOM from 'react-dom/client'; 
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PhaseProvider } from '../contexts/PhaseContext.jsx'; 
import App from './App.jsx'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const router = createBrowserRouter([{path: "/*", element: <App/>}]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PhaseProvider>
      <RouterProvider router={router} />
    </PhaseProvider>
  </React.StrictMode>,
);

  

