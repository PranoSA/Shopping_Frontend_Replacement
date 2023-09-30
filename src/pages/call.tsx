import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../components/video/video.css'
import { Socket } from 'socket.io-client';
import Video from '../components/video/video'

//Start Call By Default For Now ...

const io = require('socket.io-client')
const mediasoupClient = require('mediasoup-client')


//const roomName = window.location.pathname.split('/')[2]

//const socket = io("/mediasoup")





let device:any
let rtpCapabilities:any
let producerTransport:any
let consumerTransports:any = []
let audioProducer:any
let videoProducer:any
let consumer:any 
let isProducer = false

// https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerOptions
// https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
let params = {
  // mediasoup params
  encodings: [
    {
      rid: 'r0',
      maxBitrate: 100000,
      scalabilityMode: 'S1T3',
    },
    {
      rid: 'r1',
      maxBitrate: 300000,
      scalabilityMode: 'S1T3',
    },
    {
      rid: 'r2',
      maxBitrate: 900000,
      scalabilityMode: 'S1T3',
    },
  ],
  // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
  codecOptions: {
    videoGoogleStartBitrate: 1000
  }
}

let audioParams:any;
let videoParams:any = { params };
let consumingTransports:any = [];

type ConnectionSuccess = {
    socketId : string
}

type joinRoom = {
    roomName : string 
}

interface ServerToClientEvents {
    /*
        1. Connected To the Server Successfully 

        2. New Producer -> Start Signaling For New Conusmer Tranport TO Build One

        3. Producer Closed -> Get the Consumer Transport To CLose 
    */
    connectionsuccess: (a:ConnectionSuccess) => void; 
    newproducer:(a:any, calllback:(e:any)=>void)=>void; 
    producerclosed:any 
  }
  
 
  
  interface ClientToServerEvents {

    /*
        1. Join Room -> 

        2. Create WebRTC Transport (Do This once for Producer When Load Page), 
        and one for every "newproducer" event

        3. Transport Produce ->
        After Calling createWebRTCTransport on page load if you are a producer, 
        Then Generating a WebRTC Producer Transport on The Client,
        Call transport produce to send over parameters for RTP

        Then a producer ID will be generated on the server that identifies the Producer ID transport in the room,
        Servers Will Then Use this to connect to 

        4. Transport Recv Connect -> 
        
        For each producer, a consumer transport is created, which is identified by the consumer ID and a corresponding producer ID


        This is called for all of the producers upon load and new signalled producers
        


        5. Consume ->

        Create Consumer Based on RTP Capabilities and producer and consumer id 
        for mapping


        6. consumerresume -> 




        7. Get Producers -> 

        Upon Joining A Room, Get all the Producers Currently In The Room 

    */
    joinRoom: (a:joinRoom, callback:(e:any) => void) => void;
    createWebRtcTransport:(a:createWebRtcClient, callback:(e:createWebRtcCallbackArgument) => void)=>void;
    transportconnect:(a:transportconnect) => void; 
    transportproduce:(a:any, b:any) => void;
    transportrecvconnect:(a:any) => void;
    consume:(a:any, callback:(e:any)=>void ) => void;
    consumerresume:(a:any)=>void;
    getProducers:any
}   
  

type transportconnect = {
    dtlsParameters: any 
}



type createWebRtcClient = {
    consumer: boolean 
}

type createWebRtcCallbackArgument = {
    params:any 
}


export type WebRTCUser = {
  id: string;
  stream: MediaStream;
};

const Call:React.FC = () => {
    let {groupid} = useParams();

    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(io.connect("http://localhost:3001/sfu"));
    //const socktRef = useRef<SocketIOC

    const roomName = groupid||"Default"

    const localVideoRef = useRef<HTMLVideoElement>(null);

    const receivePCsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});

    const [users, setUsers] = useState<Array<WebRTCUser>>([]);

    //const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io.connect("http://localhost:3001/mediasoup");

    /*socket.on('connectionsuccess', ({ socketId }) => {
        console.log(socketId)
        getLocalStream()
      })*/

  useEffect(() => {

        socketRef.current.close();
        socketRef.current = io.connect("http://localhost:3001/sfu");

      //@ts-ignore
        socketRef.current.on('connectionsuccess', ({ socketId }:any) => {
          console.log(socketId)
          getLocalStream()
       })
      },[])
        //getLocalStream();
    
        /*socketRef.current.on("userEnter", (data: { id: string }) => {
          createReceivePC(data.id);
    });*/



    const streamSuccess = (stream:any) => {
      console.timeLog("Getting Local Stream")
        if(localVideoRef.current) localVideoRef.current.srcObject = stream 

        //localVideo.srcObject = stream
      
        audioParams = { track: stream.getAudioTracks()[0], ...audioParams };

        videoParams = { track: stream.getVideoTracks()[0], ...videoParams };
      
        joinRoom()
    }

    const joinRoom = () => {
        socketRef.current.emit('joinRoom', { roomName }, (data) => {
          console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`)
          // we assign to local variable and will be used when
          // loading the client Device (see createDevice above)
          rtpCapabilities = data.rtpCapabilities
      
          // once we have rtpCapabilities from the Router, create Device
          createDevice()
        })
      }

      const getLocalStream = () => {
        console.log("Getting Local Stream")
        navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: {
              min: 640,
              max: 1920,
            },
            height: {
              min: 400,
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
  console.log("Creating Device")
    try {
      device = new mediasoupClient.Device()
  
      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
      // Loads the device with RTP capabilities of the Router (server side)
      await device.load({
        // see getRtpCapabilities() below
        routerRtpCapabilities: rtpCapabilities
      })
  
      console.log('Device RTP Capabilities', device.rtpCapabilities)
  
      // once the device loads, create transport
      createSendTransport()
  
    } catch (error:any) {
      console.log(error)
      if (error.name === 'UnsupportedError')
        console.warn('browser not supported')
    }
  }

  const createSendTransport = () => {
    console.log("Creating Send Transport")
    const socket = socketRef.current; 
    // see server's socket.on('createWebRtcTransport', sender?, ...)
    // this is a call from Producer, so sender = true
    socket.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
      // The server sends back params needed 
      // to create Send Transport on the client side
      if (params.error) {
        console.log(params.error)
        return
      }
  
      console.log(params)
  
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
        console.log(parameters)
        console.log("producing")
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

  const signalNewConsumerTransport = async (remoteProducerId:any) => {

    console.log(`Signaling to Producer ${remoteProducerId}`)
    //check if we are already consuming the remoteProducerId
    const socket = socketRef.current 

    if (consumingTransports.includes(remoteProducerId)) return;
    consumingTransports.push(remoteProducerId);
  
    await socket.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
      // The server sends back params needed 
      // to create Send Transport on the client side
      if (params.error) {
        console.log(params.error)
        return
      }
      console.log(`Creating WebRTC Transport PARAMS... ${params}`)
  
      let consumerTransport
      try {
        consumerTransport = device.createRecvTransport(params)
      } catch (error) {
        // exceptions: 
        // {InvalidStateError} if not loaded
        // {TypeError} if wrong arguments.
        console.log(error)
        return
      }
  
      consumerTransport.on('connect', async ({ dtlsParameters }:any, callback:any, errback:any) => {
        console.log("Consuming ")
        try {
          // Signal local DTLS parameters to the server side transport
          // see server's socket.on('transport-recv-connect', ...)
          await socket.emit('transportrecvconnect', {
            dtlsParameters,
            serverConsumerTransportId: params.id,
          })
  
          // Tell the transport that parameters were transmitted.
          callback()
        } catch (error) {
          console.log("Failed To Connect")
          console.log(error);
          // Tell the transport that something was wrong
          errback(error)
        }
      })
  
      connectRecvTransport(consumerTransport, remoteProducerId, params.id)
    })
  }

  const connectRecvTransport = async (consumerTransport:any, remoteProducerId:any, serverConsumerTransportId:any) => {
    // for consumer, we need to tell the server first
    // to create a consumer based on the rtpCapabilities and consume
    // if the router can consume, it will send back a set of params as below

    const socket = socketRef.current 

    await socket.emit('consume', {
      rtpCapabilities: device.rtpCapabilities,
      remoteProducerId,
      serverConsumerTransportId,
    }, async ({ params }) => {
      if (params.error) {
        console.log('Cannot Consume')
        return
      }
  
      console.log(`Consumer Params ${params}`)
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
  

      console.log(`Creating New User, Remote Producer Id ${remoteProducerId}`)
      if (params.kind === 'audio') {
        //append to the audio container
        newElem.innerHTML = '<audio id="' + remoteProducerId + '" autoplay></audio>'
      } else {
        //append to the video container
        newElem.setAttribute('class', 'remoteVideo')
        newElem.innerHTML = '<video id="' + remoteProducerId + '" autoplay class="video" ></video>'
      }


  
      
  
      // destructure and retrieve the video track from the producer
      const { track } = consumer
      
      setUsers([...users, {id:remoteProducerId, stream : new MediaStream([track])}])
      //@ts-ignore
      if(document.getElementById(remoteProducerId)?.srcObject){
        //@ts-ignore
      document.getElementById(remoteProducerId).srcObject = new MediaStream([track])
      }

            //videoContainer.appendChild(newElem)
            if(receivePCsRef.current){
                //receivePCsRef.current[remoteProducerId] = track 
                receivePCsRef.current = { ...receivePCsRef.current, [remoteProducerId]: track };
              }
  
      // the server consumer started with media paused
      // so we need to inform the server to resume
      socket.emit('consumerresume', { serverConsumerId: params.serverConsumerId })
    })
  }

  socketRef.current.on('producerclosed', ({ remoteProducerId }:any) => {
    // server notification is received when a producer is closed
    // we need to close the client-side consumer and associated transport
    const producerToClose = consumerTransports.find((transportData:any) => transportData.producerId === remoteProducerId)
    producerToClose.consumerTransport.close()
    producerToClose.consumer.close()
  
    // remove the consumer transport from the list
    consumerTransports = consumerTransports.filter((transportData:any) => transportData.producerId !== remoteProducerId)
  
    // remove the video div element
    //videoContainer.removeChild(document.getElementById(`td-${remoteProducerId}`))
    if (!receivePCsRef.current[remoteProducerId]) return;
    receivePCsRef.current[remoteProducerId].close();
    delete receivePCsRef.current[remoteProducerId];
  })

  // server informs the client of a new producer just joined
socketRef.current.on('newproducer', ({ producerId }) =>{
  console.log("New Producer")

  console.log(producerId);
  signalNewConsumerTransport(producerId)
})


const getProducers = () => {
  const socket = socketRef.current 
  socket.emit('getProducers', (producerIds:any) => {
    console.log(producerIds)
    // for each of the producer create a consumer
    // producerIds.forEach(id => signalNewConsumerTransport(id))
    producerIds.forEach(signalNewConsumerTransport)
    
  })
}

      


    return(
        <div id="video">
        <table className="mainTable">
            <tbody>
                <tr>
                    <td className="localColumn">
                        <video ref={localVideoRef} id="localVideo" autoPlay className="video" muted ></video>
                    </td>
                    <td className="remoteColumn">
                        <div id="videoContainer"></div>
                    </td>
                </tr>
            </tbody>
        </table>
        <h1> CHAT !!!!!!!!!!!!!!!!!!!!!!!! </h1>
        <table>
            <tbody>
                <tr>
                    <td>
                        
                    </td>
                </tr>
            </tbody>
        </table>
        {users.map((user, index) => (
        <Video key={index} stream={user.stream} />
      ))}
    </div>
    )
}


export default Call 