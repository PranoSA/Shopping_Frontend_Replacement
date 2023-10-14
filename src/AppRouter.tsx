import React from 'react'
import './index.css'

import {
  BrowserRouter,
} from "react-router-dom";

import App from './App.tsx'


import Keycloak from './Keycloak.tsx'
import { ReactKeycloakProvider } from "@react-keycloak/web";


const AppWrapper :React.FC = () => {

    
    return (
        <ReactKeycloakProvider authClient={Keycloak()} initOptions={{ checkLoginIframe: false }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
  </ReactKeycloakProvider>
    );
}


export default AppWrapper