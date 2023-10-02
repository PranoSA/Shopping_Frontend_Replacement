import { useEffect, useRef, useState } from "react";

type Props = {
    stream : MediaStream,
    muted?: boolean
    id: string
    email : string 
    username : string 
    userid : string 
}

const Video = ({ stream, muted, id, email, username, userid }: Props) => {
    const ref = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState<boolean>(false);
  
    useEffect(() => {
      if (ref.current) ref.current.srcObject = stream;
      if (muted) setIsMuted(muted);
    }, [stream, muted]);
  
    return (
      <div>
        <p>{id} : {userid} : {username} : {email}</p>
        <video ref={ref} muted={isMuted} id={id} autoPlay />
      </div>
    );
  };
  
  export default Video;