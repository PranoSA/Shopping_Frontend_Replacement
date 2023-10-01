import Keycloak, {KeycloakConfig} from 'keycloak-js'

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'

console.log("Why Am I being Imported")


const Config:KeycloakConfig = {
    url: "https://auth.compressibleflowcalculator.com",
    realm: "shoppinglist",
    clientId: "users"
    
}

const keycloak = new Keycloak({
    url: "https://auth.compressibleflowcalculator.com",
    realm: "shoppinglist",
    clientId: "users",
    
 })

   keycloak.onAuthRefreshSuccess = () => {
    console.log("Refresh Request")
    localStorage.setItem("id_token", keycloak.idToken||"")
   }

export function initKeycloak() {
    
    keycloak.init({
        redirectUri: "http://localhost:3000",
        pkceMethod: "S256",
        onLoad: 'check-sso',
        idToken: localStorage.getItem("id_token")||undefined
    }).then(() => console.log(keycloak));


}

//keycloak.idToken = localStorage.getItem("id_token")||""


//initKeycloak()



if(localStorage.getItem("id_token") || "" != ""){
   // keycloak.idToken = localStorage.getItem("id_token")||""
   // keycloak.authenticated = true
}

export default keycloak

/*const keycloakInitOptions = {
    onLoad: 'check-sso',
    // enableLogging: true,
    token: token,
    refreshToken: refreshToken,
    idToken: idToken,
    checkLoginIframe: false,
    // promiseType: legacy
  };
  */