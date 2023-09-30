


import { IceParameters, IceCandidate, DtlsParameters, RtpParameters, MediaKind, AppData, RtpCapabilities} from "mediasoup-client/lib/types";

interface ClientToServerEvents {


    /**
     *  
            After Connecting to Our Websocket Server, The entrypoint to our application utilities (making a group audio or video call),
            is by joining a room.

            In this application, the Room corresponds to a group, which has certain userids in it, and we must authenticates users
            into groups.

            The WebRTC / SFU functionality related to a successful call to join a room is by either creating a new router if the room is currently empty 
            (doesn't exist in memory), or if it does, by simply joining a room by adding the client to the dictionary that tells room belonging.

            In Response, you get a list of supported codec and headers for the WebRTC session between the user and the server, this replaces the need
            for SDP with hard-coded values on the server.

            The logic behind this is effeciency and the fact that the supported codecs will be hard-coded on one end for all WebRTC sessions with SFU.

     */

    joinRoom: (a:joinRoom, callback:(e:any) => void) => void;

    
    /*
            Upon Joining a Room, A Client Will Find Out About THe Given Producers In The Room 
    */

    createWebRtcTransport:(a:createWebRtcClient, callback:(e:createWebRtcCallbackArguments) => void)=>void;

    /**
     *  The Next Step is to create request to create a WebRTCTransport, at this point its not technically 
     *  assigned to be either a consumer or producer transport, but an argument to specify is given to 
     * 
     *  But A Parameter to specify whether the transport intends to be a consumer or client is passed as the arguments,
        and for book keeping measures producer and consumer transports are stored in a seperate dictionaries in memory 

        In response, ICe Candidates (Such as Anounced Ips), Preferential Transport Protocol, and DTLS parameters 
        are passed back to the client. 
     */

    transportconnect:(a:transportconnect) => void; 


                        /*========+
                        |PRODUCERS|
                        +========*/
    /**
     * Transport Connect Event is to Start A DTLS Session with the Server

        Begin Connection to the Transport, Which Will Now Be a DTLS Session, Actually Producing is the next step

        The User Will Try To Create A Send  Device That Will Connnect To The Server, and upon "connect" the server will 
        connect back with the same DTLS parameters, Upon Producing the traffic will be encrypted

        The Client will first call produce on a device, and then for each kind of media use the "produce transport"
        to create new producers of either type audio or video

        The Callback indicates the producer ID back to the client which is needed to produce (callback to start producing)
        and whether there's other members in the room (so you can start requesting media from them)

     */

    transportproduce:(a:TransportProduceParams, callback:(e:TransportProduceCallbackParams) => void) => void;

    /*

    */


    transportrecvconnect:(a:any) => void;
    consume:(a:any, callback:(e:any)=>void ) => void;
    consumerresume:(a:ConsumeResumeParams)=>void;
    getProducers:(a:any, callback:(e:ProducerResponse[]) => void) => void;
  }   



  type ConsumeResumeParams = {
      serverConsumerId : string 
  }
  
  type ProducerResponse = {
    producerId : string
    userid : string 
    username : string 
    email : string 
  }
  
  type createWebRtcClient = {
      consumer: boolean 
  }
  
  type createWebRtcCallbackArguments = {
      params : {
          id: string
          iceParameters: IceParameters
          iceCandidates: IceCandidate[]
          dtlsParameters: DtlsParameters 
      }
    }
  
  type TransportProduceParams = {
      kind: MediaKind,
      rtpParameters: RtpParameters,
      appData: AppData,
    }
    
  
  type transportconnect = {
      dtlsParameters: DtlsParameters
  }
  
  
  type ConsumeParameters = {
      rtpCapabilities: RtpCapabilities
      remoteProducerId : string 
      serverConsumerTransportId : string 
  }
  
  type ConsumeRequestCallbackParams = {
      params : {
          id:string,
          producerId:string,
          kind:MediaKind,
          rtpParameters: RtpParameters,
          serverConsumerId : string,
      }
  }
  
  type TransportProduceCallbackParams = {
      id: string,
      producersExist: boolean,
  }

  type joinRoom = {
    roomName : string 
    }
  
  

  export type {
    joinRoom, 
    createWebRtcCallbackArguments, 
    TransportProduceCallbackParams,
     createWebRtcClient,
      transportconnect, 
      ClientToServerEvents,
       ProducerResponse
  }