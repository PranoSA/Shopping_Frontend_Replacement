import base64 from 'base-64';

/*const createCodeVerifier = ( size:number ) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~';
    const charsetIndexBuffer = new Uint8Array( size );
  
    for ( let i = 0; i < size; i += 1 ) {
      charsetIndexBuffer[i] = ( Math.random() * charset.length ) | 0;
    }
  
    let randomChars = [];
    for ( let i = 0; i < charsetIndexBuffer.byteLength; i += 1 ) {
      let index = charsetIndexBuffer[i] % charset.length;
      randomChars.push( charset[index] );
    }
  
    return randomChars.join( '' );
  }


  const createCodeChallenge = ( codeVerifier:string ) => {
    if ( typeof window !== 'undefined' && !!( window.crypto ) && !!( window.crypto.subtle ) ) {
      return new Promise( ( resolve, reject ) => {
        let codeVerifierCharCodes = textEncodeLite( codeVerifier );
        crypto.subtle
          .digest( 'SHA-256', codeVerifierCharCodes )
          .then(
            hashedCharCodes => resolve( urlSafe( new Uint8Array(hashedCharCodes) ) ),
            error => reject( error )
          );
      });
    }
  }

  const textEncodeLite = ( str:string ) => {
    const charCodeBuffer = new Uint8Array( str.length );
    for ( let i = 0; i < str.length; i++ ) {
     charCodeBuffer[i] = str.charCodeAt( i );
    }
    return charCodeBuffer;
  }
  
  const urlSafe = ( buffer ) => {
    const encoded = base64.fromByteArray( new Uint8Array( buffer ) );
  
    return encoded.replace( /\+/g, '-' ).replace( /\//g, '_' ).replace( /=/g, '' );
  }


  export {
    createCodeVerifier
  }
  */