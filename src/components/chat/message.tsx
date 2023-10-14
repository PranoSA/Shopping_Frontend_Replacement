import React from 'react';


import Avatar from '@mui/material/Avatar';
import { deepOrange } from "@mui/material/colors"
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { Message } from '@mui/icons-material';



type MessageProps = {
    author : string
    content : string 
    pfp : string 
    timestamp : string 
}

export const MessageLeft :React.FC <MessageProps>  = ({author, content, pfp, timestamp}) => {
  const message = content 
  const time =  timestamp  //Add Conversion Here
  const photoURL = pfp
  const displayName = author 
  //const classes = useStyles();
  return ( 
    <Box component="div">
      <div >
        <Avatar
          alt={displayName}
          src={photoURL}
        ></Avatar>
        <div>
          <div> {displayName}</div>
          <div>
            <div>
              <p >{message}</p>
            </div>
            <div >{time}</div>
          </div>
        </div>
      </div>
      </Box>
  );
};


//avatarが右にあるメッセージ（自分）
export const MessageRight:React.FC <MessageProps>  = ({author, content, pfp, timestamp}) => {
    const message = content 
    const time =  timestamp  //Add Conversion Here
    const photoURL = pfp
    const displayName = author 
    //const classes = useStyles();
    return ( 
      <Box component="div">
        <div >
          <Avatar
            alt={displayName}
            src={photoURL}
          ></Avatar>
          <div>
            <div> {displayName}</div>
            <div>
              <div>
                <p >{message}</p>
              </div>
              <div >{time}</div>
            </div>
          </div>
        </div>
        </Box>
    )
}


