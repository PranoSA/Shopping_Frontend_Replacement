import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../components/video/video.css'
import { Socket } from 'socket.io-client';
import Video from '../components/video/video'
import { ServerToClientEvents, ConnectionSuccess,  NewProducer, ProducerClosed} from '../types/ServerToClientEvents';
import { ClientToServerEvents,   
   joinRoom, 
  createWebRtcCallbackArguments, 
  TransportProduceCallbackParams,
   createWebRtcClient,
    transportconnect, 
     ProducerResponse } from '../types/ClientToServerEvents';
//Start Call By Default For Now ...
import { useKeycloak } from '@react-keycloak/web';
import { Transport } from 'mediasoup-client/lib/Transport';
import { Producer } from 'mediasoup-client/lib/Producer';
//import keycloak from '../Keycloak';
import { Consumer, MediaKind,} from 'mediasoup-client/lib/types';
import { StreamRounded } from '@mui/icons-material';


const io = require('socket.io-client')
const mediasoupClient = require('mediasoup-client')


//const roomName = window.location.pathname.split('/')[2]

//const socket = io("/mediasoup")

type ConsumerTransportType = {
  consumerTransport : Transport,
  serverConsumerTransportId: string,
  producerId: string,
  consumer : Consumer,
}

let device:any
let rtpCapabilities:any
let producerTransport:Transport
let consumerTransports:ConsumerTransportType[] = []
let audioProducer:Producer
let videoProducer:Producer


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



 

export type WebRTCUser = {
  id: string;
  stream: MediaStream;
};

let testgroup= "96851c45-aaf1-4960-a49a-48e9fcb24a1c"



// Because A Transport Even if Know Stream
type Streamer = { //Used To Uniquely Identify 
  userid : string 
  username : string 
  email : string 
  videoStream? : MediaStream
  audioStream? : MediaStream
}

type Streamers = {
  [key:string]:Streamer
}


const Call:React.FC = () => {
    let {groupid} = useParams();

    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();


    const roomName = testgroup

    const localVideoRef = useRef<HTMLVideoElement>(null);

    const receivePCsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});

    const [users, setUsers] = useState<Array<WebRTCUser>>([]);

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

   const transport_info : TransportInfos = {}




    //const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io.connect("http://localhost:3001/mediasoup");

    /*socket.on('connectionsuccess', ({ socketId }) => {
        console.log(socketId)
        getLocalStream()
      })*/

  useEffect(() => {

    console.log("LoadingCHat")

    if(socketRef.current){
      socketRef.current.close();
      console.log("Refresh Caused Reload")
    }

    async function InitializeSocket() {
      try {
        console.log(keycloak.isTokenExpired())
        const ref = await keycloak.updateToken(5)
        .catch(() => {
          if (keycloak.isTokenExpired()){
            console.log("Not Authenticated")
            throw Error();
          }
        })
      }
      catch(e){
        if(!keycloak.authenticated){
          console.log(keycloak.idToken)
          console.log(localStorage.getItem("id_token"))
          keycloak.login();
        }
        console.log("ArleadyAUthenticated")
        return 
      }

      console.log(localStorage.getItem("id_token"));

    

       console.log(keycloak.isTokenExpired())

        socketRef.current = io.connect("http://localhost:3001/sfu", {
          auth: (cb: (arg0: { token: string; }) => void) => {
            cb({
              token: localStorage.getItem("id_token")||"",
            });
          }
        });

        if(!socketRef.current){
          console.log("Failed to Connect")
          return 
        }
        

          socketRef.current.on('producerclosed', ({ producerId, transportId }) => {

            const remoteProducerId = producerId
            // server notification is received when a producer is closed
            // we need to close the client-side consumer and associated transport
            const producerToClose = consumerTransports.find((transportData:any) => transportData.producerId === remoteProducerId)

            console.log("Producer Closed");

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
            if (!receivePCsRef.current[remoteProducerId]) return;
            receivePCsRef.current[remoteProducerId].close();
            delete receivePCsRef.current[remoteProducerId];
          })

      // server informs the client of a new producer just joined
          socketRef.current.on('newproducer', ({ producerId, transportid, email, username, userid }) =>{
            console.log("New Producer")
            
            transport_info[transportid] = {
              email,
              username,
              userid,

            }

            console.log(producerId);
            signalNewConsumerTransport(producerId,transportid)
          })


      //@ts-ignore
        socketRef.current.on('connectionsuccess', ({ socketId }:any) => {
          console.log("COnnectionSuccess")
          console.log(socketId)
          getLocalStream()
       })
      
    }
    InitializeSocket()

      },[])
        //getLocalStream();
    
        /*socketRef.current.on("userEnter", (data: { id: string }) => {
          createReceivePC(data.id);
    });*/



    const streamSuccess = (stream:any) => {
      console.log("Getting Local Stream")
        if(localVideoRef.current) localVideoRef.current.srcObject = stream 

        //localVideo.srcObject = stream
      
        audioParams = { track: stream.getAudioTracks()[0], ...audioParams };

        videoParams = { track: stream.getVideoTracks()[0], ...videoParams };
      
        joinRoom()
    }

    const joinRoom = () => {
      if(socketRef.current){
        socketRef.current.emit('joinRoom', { roomName }, (data) => {
          console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`)
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
        console.log("Getting Local Stream")
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

    if(!socketRef.current || !socket){
      console.log("Made Send Transport")
      return 
    }
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
          console.log("Why ERror")
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

    audioProducer.on('@getstats', (stats) => {console.log("stats" + stats)})

    
  
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
        console.log(params.error)
        return
      }
      console.log(`Creating WebRTC Transport PARAMS... ${params}`)
  
      let consumerTransport
      try {
        consumerTransport = device.createRecvTransport(params)
      } catch (error) {
        console.log(typeof(error))
        console.log("Failed To Create Recv Device")
        // exceptions: 
        // {InvalidStateError} if not loaded
        // {TypeError} if wrong arguments.
        console.log(error)
        return
      }
  
      consumerTransport.on('connect', async ({ dtlsParameters }:any, callback:any, errback:any) => {
        console.log("Consuming ")
        try {

          if(!socket || !socketRef.current){
            console.log("Not Socket Or Not Socket Ref")
            return 
          }
          // Signal local DTLS parameters to the server side transport
          // see server's socket.on('transport-recv-connect', ...)
          await socket.emit('transportrecvconnect', {
            dtlsParameters,
            serverConsumerTransportId: params.id,
          })

          console.log("TransportRecvConnect")
  
          // Tell the transport that parameters were transmitted.
          callback()
        } catch (error) {
          console.log("Failed To Connect")
          console.log(error);
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
        console.log('Cannot Consume')
        return
      }
  
      console.log(`Consumer Params ${params}`)
      console.log(params);
      // then consume with the local consumer transport
      // which creates a consumer
      const consumer = await consumerTransport.consume({
        id: params.id,
        producerId: params.producerId,
        kind: params.kind,
        rtpParameters: params.rtpParameters
      })
      
      console.log(consumer.producerId)
      console.log(consumer.id)
      console.log(params.kind)
      
  
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
      
  
      console.log("Creating Element For")
      console.log(remoteProducerId)

      console.log(`Creating New User, Remote Producer Id ${remoteProducerId}`)
      if (params.kind === 'audio') {
        //append to the audio container
        newElem.innerHTML = '<audio id="' + remoteProducerId + '" autoplay></audio>'
      } else {
        //append to the video container
        newElem.setAttribute('class', 'remoteVideo')
        newElem.innerHTML = '<video id="' + remoteProducerId + '" autoplay class="video" ></video>'
      }


      
      const newVideo = document.createElement("video")
      elem?.appendChild(newVideo)



  
      elem?.appendChild(newElem)
  
      // destructure and retrieve the video track from the producer
      const { track } = consumer

      newVideo.srcObject = new MediaStream([track])
      
      console.log(track);

      if(producers[remoteTransportId]){

      }

      else {
        console.log("New Transport")
        
        producers[remoteTransportId] = {
          userid : transport_info[remoteTransportId].userid ,
          username :  transport_info[remoteTransportId].username,
          email :  transport_info[remoteTransportId].email,
          videoStream: new MediaStream()
        }
      }


      console.log(transport_info)
      producers[remoteTransportId].videoStream?.addTrack(track)



      
      //ignore this for now... just add to the video stream 
      
      /*if(params.MediaKind === "audio"){

      }
      if(params.MediaKind === "video"){
        producers[remoteProducerId].videoStream = new MediaStream([track]) 
        
        console.log(producers)
        setProducers({...producers})
      }*/

      console.log(producers)
      
      setUsers([...users, {id:remoteProducerId, stream : new MediaStream([track])}])

      console.log([...users, {id:remoteProducerId, stream : new MediaStream([track])}])

      console.log(users)
      //@ts-ignore
      if(document.getElementById(remoteProducerId)){


        console.log("Found SourceObject")

        //@ts-ignore
      document.getElementById(remoteProducerId).srcObject = new MediaStream([track])
      }
      else {
        console.log("Did Not Find Source Object")
      }
  

          //videoContainer.appendChild(newElem)
          /*if(receivePCsRef.current){
              //receivePCsRef.current[remoteProducerId] = track 
              receivePCsRef.current = { ...receivePCsRef.current, [remoteProducerId]: track };
            }
            */
      console.log("consumeresume")
      console.log(track.kind)
      //track.removeEventListener()
  
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
    console.log(producerIds)
    
    
    


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

  var RenderStreamerList:RenderList[] = []


  console.log("Render Stream List")
  for (var key in producers){
    console.log(key)
      RenderStreamerList.push({
        streamer : producers[key],
        id : key,
      })
  }

  return RenderStreamerList.map((v) => {
    return <Video id={v.id} stream={v.streamer.videoStream||new MediaStream()} email={v.streamer.email} userid={v.streamer.userid} username={v.streamer.username}></Video>
  })

}
      
/*
          <div id="video-container"></div>

        <table className="mainTable">
            <tbody>
                <tr>
                    <td className="localColumn">
                        
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
        <Video key={index} stream={user.stream} id={user.id} />
      ))}
      */


    return(
        <div id="video">

       <p> REAALLL SHIT </p>
    {videoElements()}
    </div>
    )
}


export default Call 