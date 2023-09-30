type NewProducer = {producerId:string, userid:string, username:string, email:string}

type ProducerClosed = {producerId:string}

type ConnectionSuccess = {
    socketId : string
}


interface ServerToClientEvents {
    /*
        1. Connected To the Server Successfully 
  
        2. New Producer -> Start Signaling For New Conusmer Tranport TO Build Onee 
  
        3. Producer Closed -> Get the Consumer Transport To CLose 

        4. Signify To Clients that a producer has left
    */

    
    connectionsuccess: (a:ConnectionSuccess) => void; 
    newproducer:(a:NewProducer)=>void; 
    producerclosed:(a:ProducerClosed)=>void;
    producerLeaves:(a:{producerId:string}) => void;
  }

export type {
    ConnectionSuccess,
    NewProducer,
    ProducerClosed,
    ServerToClientEvents
}