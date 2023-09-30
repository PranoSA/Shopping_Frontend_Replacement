import Keycloak from 'keycloak-js'

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'

console.log("Why Am I being Imported")



const keycloak = new Keycloak({
    url: "https://auth.compressibleflowcalculator.com",
    realm: "shoppinglist",
    clientId: "users",

   });

   keycloak.onAuthRefreshSuccess = () => {
    localStorage.setItem("id_token", keycloak.idToken||"")
   }

export function initKeycloak() {
    keycloak.init({
        redirectUri: "http://localhost:3000",
        pkceMethod: "S256",
        onLoad: 'check-sso',
    }).then(() => console.log(keycloak));
}



if(localStorage.getItem("id_token") || "" != ""){
    keycloak.authenticated = true
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