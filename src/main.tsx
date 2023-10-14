import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

import {
  BrowserRouter,
} from "react-router-dom";

import App from './App.tsx'


import Keycloak from './Keycloak.tsx'
import { ReactKeycloakProvider } from "@react-keycloak/web";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ReactKeycloakProvider authClient={Keycloak()} initOptions={{ checkLoginIframe: false }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
  </ReactKeycloakProvider>
)
