import { useKeycloak } from "@react-keycloak/web";
import React, { ReactHTMLElement, useEffect, useState } from 'react';
import NavBar from './navbar'

interface ReactNodeArray extends Array<ReactNode> {}
type ReactFragment = {} | ReactNodeArray;
type ReactNode = ReactFragment |  boolean | null | undefined;



type Props = {
  children: JSX.Element
}


const PrivateRoute:React.FC<Props> = ({   children}) => {
 const { keycloak } = useKeycloak();

 const [loggedin, SetLoggedin] = useState<Boolean>(false);


  useEffect(() => {

    const refreshToken = localStorage.getItem("refresh")||""
    const id_token = localStorage.getItem("id_token")||""

    //Try If Authenticated

    if (id_token == null) {
      keycloak.authenticated = false 
      SetLoggedin(false)
      return 
    }

    if(id_token == null || id_token == ""){
      keycloak.authenticated = false 
      SetLoggedin(false)
      return 
    }

    

    keycloak.authenticated = true 
    SetLoggedin(true)
  },[])

 useEffect(() => {

  console.trace();
  console.log("Auth Changed to" + keycloak.authenticated)

    if(keycloak.authenticated && keycloak.refreshToken||"" != "" && keycloak.idToken || "" != ""){
      console.trace();
      console.log("Why THough?????")
      console.log(keycloak.refreshToken)
      console.log(keycloak.idToken)
      localStorage.setItem("refresh", keycloak.refreshToken||"")
      localStorage.setItem("id_token", keycloak.idToken||"")
      SetLoggedin(true)
    }
    
    

 }, [keycloak.authenticated])



 //const isLoggedIn = keycloak.authenticated;


 //return isLoggedIn ? children : <NavBar />;
 return loggedin?children: <NavBar />
};

export default PrivateRoute;