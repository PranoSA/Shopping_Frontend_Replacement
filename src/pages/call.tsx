/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../components/video/video.css'
import { Socket } from 'socket.io-client';
import Video from '../components/video/video'
import { ServerToClientEvents} from '../types/ServerToClientEvents';
import { ClientToServerEvents,   ProducerResponse } from '../types/ClientToServerEvents';
//Start Call By Default For Now ...
import { useKeycloak } from '@react-keycloak/web';
import { Transport } from 'mediasoup-client/lib/Transport';
import { Producer } from 'mediasoup-client/lib/Producer';
//import keycloak from '../Keycloak';
import {RtpCapabilities, Device} from 'mediasoup-client/lib/types';

import {Streamer, Streamers, ConsumerTransportType} from '../types/call'
import params from '../components/video/webrtc_params';



//const io = require('socket.io-client')
//import io from 'socket.io-client'
import {io} from 'socket.io-client'


//const mediasoupClient = require('mediasoup-client')

import mediasoupClient from 'mediasoup-client'


//const roomName = window.location.pathname.split('/')[2]

//const socket = io("/mediasoup")



let device:Device
let rtpCapabilities:RtpCapabilities
let producerTransport:Transport
let consumerTransports:ConsumerTransportType[] = []
let audioProducer:Producer
let videoProducer:Producer




let audioParams:any;
let videoParams:any = { params };
const consumingTransports:any = [];



 
const testgroup= "96851c45-aaf1-4960-a49a-48e9fcb24a1c"




const Call:React.FC = () => {
    //let {groupid} = useParams();

    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();
    const roomName = testgroup

    const localVideoRef = useRef<HTMLVideoElement>(null);
    //const receivePCsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});

   const { keycloak } = useKeycloak();

   const [producers, setProducers] = useState<Streamers>({});


   type TransportInfo = {
    userid : string 
    email : string 
    username : string 
   }

   type TransportInfos = {
    [key:string]:TransportInfo
   }

   //Not Used For Any Render State

   const transport_info : TransportInfos = {}


  useEffect(() => {


    if(socketRef.current){
      socketRef.current.close();
      
    }

    async function InitializeSocket() {
      try {
        console.log(keycloak.isTokenExpired())
        const ref = await keycloak.updateToken(5)
        .catch(() => {
          if (keycloak.isTokenExpired()){
            throw Error();
          }
        })
      }
      catch(e){
        if(!keycloak.authenticated){
          keycloak.login();
        }
        return 
      }

      socketRef.current = io("http://localhost:3001/sfu", {
        autoConnect: false,  
        auth: (cb: (arg0: { token: string; }) => void) => {
          cb({
            token: localStorage.getItem("id_token")||"",
          });
        }
      });

      socketRef.current.connect();

        /*socketRef.current = io("http://localhost:3001/sfu", {
          auth: (cb: (arg0: { token: string; }) => void) => {
            cb({
              token: localStorage.getItem("id_token")||"",
            });
          }
        });
*/
        if(!socketRef.current){
          return 
        }
        

          socketRef.current.on('producerclosed', ({ producerId, transportId }) => {

            const remoteProducerId = producerId
            // server notification is received when a producer is closed
            // we need to close the client-side consumer and associated transport
            const producerToClose = consumerTransports.find((transportData:any) => transportData.producerId === remoteProducerId)

            delete producers[transportId]

            setProducers({...producers})

            if(producerToClose){

              producerToClose.consumerTransport.close()
              producerToClose.consumer.close()
            }
          
            // remove the consumer transport from the list
            consumerTransports = consumerTransports.filter((transportData:any) => transportData.producerId !== remoteProducerId)
          
            // remove the video div element
            //videoContainer.removeChild(document.getElementById(`td-${remoteProducerId}`))
          })

      // server informs the client of a new producer just joined
          socketRef.current.on('newproducer', ({ producerId, transportid, email, username, userid }) =>{
            console.log("New Producer")
            
            transport_info[transportid] = {
              email,
              username,
              userid,

            }

            signalNewConsumerTransport(producerId,transportid)
          })


     
        socketRef.current.on('connectionsuccess', ({ socketId }:any) => {
          getLocalStream()
       })
      
    }
    InitializeSocket()

    return () => {
      if(socketRef.current){
        socketRef.current.disconnect()
        socketRef.current.close()
      }
    }

      },[])



    const streamSuccess = (stream:any) => {
      console.log("Getting Local Stream")
        if(localVideoRef.current) localVideoRef.current.srcObject = stream 

      
        audioParams = { track: stream.getAudioTracks()[0], ...audioParams };

        videoParams = { track: stream.getVideoTracks()[0], ...videoParams };
      
        joinRoom()
    }

    const joinRoom = () => {
      if(socketRef.current){
        socketRef.current.emit('joinRoom', { roomName }, (data) => {
          // we assign to local variable and will be used when
          // loading the client Device (see createDevice above)
          rtpCapabilities = data.rtpCapabilities
      
          // once we have rtpCapabilities from the Router, create Device
          createDevice()
        })
        }
        else {
          console.log("Not Emitting Join Room")
        }
      }

      const getLocalStream = () => {
        navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: {
              min: 80,
              max: 1920,
            },
            height: {
              min: 50,
              max: 1080,
            }
          }
        })
        .then(streamSuccess)
        .catch(error => {
          console.log(error.message)
        })
      }

      // A device is an endpoint connecting to a Router on the
// server side to send/recive media
const createDevice = async () => {
    try {
      device = new mediasoupClient.Device()
  
      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
      // Loads the device with RTP capabilities of the Router (server side)
      await device.load({
        // see getRtpCapabilities() below
        routerRtpCapabilities: rtpCapabilities
      })
  
      // once the device loads, create transport
      createSendTransport()
  
    } catch (error:any) {
      if (error.name === 'UnsupportedError')
        console.warn('browser not supported')
    }
  }

  const createSendTransport = () => {
    console.log("Creating Send Transport")

    const socket = socketRef.current; 

    if(!socketRef.current || !socket){
      return 
    }
    // see server's socket.on('createWebRtcTransport', sender?, ...)
    // this is a call from Producer, so sender = true
    socket.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
      // The server sends back params needed 
      // to create Send Transport on the client side
      if (params.error) {
        return
      }
  
  
      // creates a new WebRTC Transport to send media
      // based on the server's producer transport params
      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
      producerTransport = device.createSendTransport(params)
  
      // https://mediasoup.org/documentation/v3/communication-between-client-and-server/#producing-media
      // this event is raised when a first call to transport.produce() is made
      // see connectSendTransport() below
      producerTransport.on('connect', async ({ dtlsParameters}:any, callback:any, errback:any) => {
        try {
          // Signal local DTLS parameters to the server side transport
          // see server's socket.on('transport-connect', ...)
          await socket.emit('transportconnect', {
            dtlsParameters,
          })
  
          // Tell the transport that parameters were transmitted.
          callback()
  
        } catch (error) {
          errback(error)
        }
      })
  
      producerTransport.on('produce', async (parameters:any, callback:any, errback:any) => {
        try {
          // tell the server to create a Producer
          // with the following parameters and produce
          // and expect back a server side producer id
          // see server's socket.on('transport-produce', ...)
          await socket.emit('transportproduce', {
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
            appData: parameters.appData,
          }, ({ id, producersExist }:any) => {
            // Tell the transport that parameters were transmitted and provide it with the
            // server side producer's id.
            callback({ id })
  
            // if producers exist, then join room
            if (producersExist) getProducers()
          })
        } catch (error) {
          errback(error)
        }
      })
  
      connectSendTransport()
    })
  }
  
  const connectSendTransport = async () => {
    // we now call produce() to instruct the producer transport
    // to send media to the Router
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
    // this action will trigger the 'connect' and 'produce' events above
    
    audioProducer = await producerTransport.produce(audioParams);
    videoProducer = await producerTransport.produce(videoParams);

  
    audioProducer.on('trackended', () => {
      console.log('audio track ended')
  
      // close audio track
    })
  
    audioProducer.on('transportclose', () => {
      console.log('audio transport ended')
  
      // close audio track
    })
    
    videoProducer.on('trackended', () => {
      console.log('video track ended')
  
      // close video track
    })
  
    videoProducer.on('transportclose', () => {
      console.log('video transport ended')
  
      // close video track
    })
  }

  const signalNewConsumerTransport = async (remoteProducerId:string, remoteTransportId:string) => {

    console.log(`Signaling to Producer ${remoteProducerId}`)
    //check if we are already consuming the remoteProducerId
    const socket = socketRef.current 

    if(!socket){
      return 
    }

    if (consumingTransports.includes(remoteProducerId)) return;
    consumingTransports.push(remoteProducerId);
  
    await socket.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
      // The server sends back params needed 
      // to create Send Transport on the client side
      if (params.error) {
        return
      }
  
      let consumerTransport
      try {
        consumerTransport = device.createRecvTransport(params)
      } catch (error) {
        // exceptions: 
        // {InvalidStateError} if not loaded
        // {TypeError} if wrong arguments.
        return
      }
  
      consumerTransport.on('connect', async ({ dtlsParameters }:any, callback:any, errback:any) => {
        try {

          if(!socket || !socketRef.current){
            return 
          }
          // Signal local DTLS parameters to the server side transport
          // see server's socket.on('transport-recv-connect', ...)
          await socket.emit('transportrecvconnect', {
            dtlsParameters,
            serverConsumerTransportId: params.id,
          })

  
          // Tell the transport that parameters were transmitted.
          callback()
        } catch (error) {
          // Tell the transport that something was wrong
          errback(error)
        }
      })
      try {
        connectRecvTransport(consumerTransport, remoteProducerId, params.id, remoteTransportId)
        
      }
      catch(e){
        console.log("Connect Recv Transport Failed")
      }
    })
  }

  const connectRecvTransport = async (consumerTransport:Transport, remoteProducerId:string, serverConsumerTransportId:string, remoteTransportId:string) => {
    // for consumer, we need to tell the server first
    // to create a consumer based on the rtpCapabilities and consume
    // if the router can consume, it will send back a set of params as below

    const socket = socketRef.current 

    if(!socket){
      return 
    }

    await socket.emit('consume', {
      rtpCapabilities: device.rtpCapabilities,
      remoteProducerId,
      serverConsumerTransportId,
    }, async ({ params }) => {
      if (params.error) {
        return
      }
      // then consume with the local consumer transport
      // which creates a consumer
      const consumer = await consumerTransport.consume({
        id: params.id,
        producerId: params.producerId,
        kind: params.kind,
        rtpParameters: params.rtpParameters
      })

      
  
      consumerTransports = [
        ...consumerTransports,
        {
          consumerTransport,
          serverConsumerTransportId: params.id,
          producerId: remoteProducerId,
          consumer,
        },
      ]
  
      // create a new div element for the new consumer media
      const newElem = document.createElement('div')
      newElem.setAttribute('id', `td-${remoteProducerId}`)

      const elem =document.getElementById("video-container")
      

      if (params.kind === 'audio') {
        //append to the audio container
        newElem.innerHTML = '<audio id="' + remoteProducerId + '" autoplay></audio>'
      } else {
        //append to the video container
        newElem.setAttribute('class', 'remoteVideo')
        newElem.innerHTML = '<video id="' + remoteProducerId + '" autoplay class="video" ></video>'
      }


      setProducers({...producers})
      
      const newVideo = document.createElement("video")
      elem?.appendChild(newVideo)



  
      elem?.appendChild(newElem)
  
      // destructure and retrieve the video track from the producer
      const { track } = consumer

      newVideo.srcObject = new MediaStream([track])

      
      //@eslie
      // eslint-disable-next-line no-empty
      if(producers[remoteTransportId]){}

      else {
        
        producers[remoteTransportId] = {
          userid : transport_info[remoteTransportId].userid ,
          username :  transport_info[remoteTransportId].username,
          email :  transport_info[remoteTransportId].email,
          videoStream: new MediaStream()
        }
      }

      producers[remoteTransportId].videoStream?.addTrack(track)



      
      //ignore this for now... just add to the video stream 

  
      // the server consumer started with media paused
      // so we need to inform the server to resume
      socket.emit('consumerresume', { serverConsumerId: params.serverConsumerId })
    })
  }




const getProducers = () => {
  const socket = socketRef.current 

  if(!socket){
    return 
  }


  socket.emit('getProducers', (producerIds:ProducerResponse[]) => {


    // for each of the producer create a consumer
    // producerIds.forEach(id => signalNewConsumerTransport(id))
    producerIds.forEach(v => {

      //console.log(v)
      transport_info[v.transportId] = {
        email : v.email, 
        username : v.username,
        userid : v.userid
      }

      signalNewConsumerTransport(v.producerId, v.transportId)
    })    
  })
}

const videoElements  = ():React.ReactNode => {

  type RenderList = {
    streamer : Streamer,
    id : string,
  }

  const RenderStreamerList:RenderList[] = []


  console.log("Render Stream List")
  for (const key in producers){
      RenderStreamerList.push({
        streamer : producers[key],
        id : key,
      })
  }

  return RenderStreamerList.map((v) => {
    return <Video id={v.id} stream={v.streamer.videoStream||new MediaStream()} email={v.streamer.email} userid={v.streamer.userid} username={v.streamer.username}></Video>
  })

}


//Maybe Add Back Local Video Ref

    return(
        <div id="video">

    {videoElements()}
    </div>
    )
}


export default Call 