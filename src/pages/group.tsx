/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef } from 'react';

import { Client, CompatClient, Stomp} from '@stomp/stompjs';

import { useParams } from 'react-router-dom';

import sockjs from "sockjs-client/dist/sockjs"
import { useKeycloak } from '@react-keycloak/web';
import axios from 'axios';


const Group:React.FC = () =>{

    const {groupid} = useParams();

    const socketRef = useRef<CompatClient>();

    const keycloak = useKeycloak();

    useEffect(() => {
      console.log(groupid)

      let csrf : string 

      const StartWebSocket = async() => {

        
        try {

          const res = await axios.get("http://localhost:8080/csrf");

          csrf = res.data
          console.log(`csrf is ${csrf}`)

          await keycloak.keycloak.updateToken(100)
  
          
        }
        catch(e){
          if(keycloak.keycloak.isTokenExpired()){
            console.log("Unauthetnicated");
          }
        }

      socketRef.current = Stomp.over(new sockjs(`http://localhost:8080/ws-notice?_csrf=${csrf}`,))
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socketRef.current?.connect({"Authorization" : `Bearer ${keycloak.keycloak.idToken}`}, function (frame:any) {
        const stomp = socketRef.current
        if(!stomp){
          return 
        }
        stomp.subscribe(`/topic/${groupid}`, function (response) {
            console.log("Received Response");
            console.log(response);
        });

        stomp.subscribe(`/topic/list.${groupid}`, function(response) {
          console.log("Received List")
          console.log(response);
        })
        socketRef.current?.publish({ destination: `/app/notifications/${groupid}`, body: 'First Message' });
        console.log("Published")

        socketRef.current?.publish({destination: `/app/notifications/list/${groupid}`, body: 'Second Message' })
    })
      
      /*socketRef.current = new Client({

        brokerURL: `ws://localhost:8080/notifications`,
        onConnect: () => {
          socketRef.current?.subscribe(`/topic/${groupid}`, message =>
            console.log(`Received: ${message.body}`)
          )}
      })*/

      try {
      socketRef.current?.activate()

      socketRef.current?.publish({ destination: `/app/notifications/${groupid}`, body: 'First Message' });
      console.log("Published")
      }
      catch(e){
        console.log("error")
        console.log(e)
      }
      }

      StartWebSocket();

    }, [])


    return (
        <div>
GOUP <p> 123123GROUPPPPPPPPPPPPPPPPP </p>
        </div>
    )
}

export default Group
