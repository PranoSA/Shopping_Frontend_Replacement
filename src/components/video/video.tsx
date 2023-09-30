import { useEffect, useRef, useState } from "react";

type Props = {
    stream : MediaStream,
    muted?: boolean
}

const Video = ({ stream, muted }: Props) => {
    const ref = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState<boolean>(false);
  
    useEffect(() => {
      if (ref.current) ref.current.srcObject = stream;
      if (muted) setIsMuted(muted);
    }, [stream, muted]);
  
    return (
      <div>
        <video ref={ref} muted={isMuted} autoPlay />
      </div>
    );
  };
  
  export default Video;