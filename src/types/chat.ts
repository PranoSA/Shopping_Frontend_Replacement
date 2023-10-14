
type Message = {
    messageid : string, 
    author : string,
    content: string,
    pfp : string, 
    sent : string, 
}


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


  export type {
    Message,
    Streamer,
    Streamers
}
