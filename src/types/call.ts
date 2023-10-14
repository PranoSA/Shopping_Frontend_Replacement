import { Consumer, MediaKind, RtpCapabilities, Device, Transport} from 'mediasoup-client/lib/types';

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

  type ConsumerTransportType = {
    consumerTransport : Transport,
    serverConsumerTransportId: string,
    producerId: string,
    consumer : Consumer,
  }
  


  export type {
    Streamer,
    Streamers,
    ConsumerTransportType
}
