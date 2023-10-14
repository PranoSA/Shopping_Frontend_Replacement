/* eslint-disable @typescript-eslint/no-unused-vars */
import { useKeycloak } from "@react-keycloak/web";
import React, { ReactHTMLElement, useEffect, useState } from 'react';
import NavBar from './navbar'
import { JsxFlags } from "typescript";

interface ReactNodeArray extends Array<ReactNode> {}
type ReactFragment = null | ReactNodeArray;
type ReactNode = ReactFragment |  boolean | null | undefined;



type Props = {
  children: JSX.Element
}


const PrivateRoute:React.FC<Props> = ({   children}) => {
 const { keycloak } = useKeycloak();

 const [loggedin, SetLoggedin] = useState<boolean>(false);


  useEffect(() => {

    console.log("WHY AM I RERENDERING")

    const tryRefreshToken = async() => {
      //const ref = await keycloak.updateToken(5)

      await keycloak.updateToken(10000)
      .catch(res => {
        console.log("Token Refreshed")
        SetLoggedin(true)
      })
      .catch(e => {
        if(keycloak.authenticated){
          console.log("Refreshed")
          //SetLoggedin(true)
        }
        else {
          console.log(keycloak.isTokenExpired());
        }
      }) 
    }

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


    //tryRefreshToken();
    //keycloak.authenticated = true 
    //SetLoggedin(true)
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
    /*keycloak.authenticated*/
    

 }, [keycloak.authenticated])



 //const isLoggedIn = keycloak.authenticated;


 //return isLoggedIn ? children : <NavBar />;
 return loggedin?children: <NavBar />
};

export default PrivateRoute;