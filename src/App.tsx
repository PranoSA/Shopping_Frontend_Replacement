import React from 'react';
import logo from './logo.svg';
import './App.css';

import Home from './pages/home'
import Chat from './pages/chat'
import {  Routes , Route} from 'react-router-dom';

import AuthContext from './components/Keycloak'
import Call from './pages/call';

const client_id="shopping"
const redirect_uri = "http://localhost:3000"



function App() {



  

  return (
    <AuthContext>
    <Routes>
      
      <Route path="group" >

        <Route path=":groupid">
          <Route path="chat" element={<Chat starter={6} />} />
          <Route path="group" element={<Chat starter={7} />} />
          <Route path="call" element ={<Call />} />
          <Route path="" element={<Chat starter={5} />} />
        </Route>
        <Route path="" element={<Home />} />
      </Route>
      <Route path = "" element={<Call />}/>
    </Routes>
    </AuthContext>
  );
}

export default App;
