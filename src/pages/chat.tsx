import { useParams } from "react-router-dom";

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import { useEffect, useState } from "react";

import {Group} from '../types/group'
import {Message} from '../types/chat'
import GroupDialog from '../components/home/add_group_form'

import {MessageLeft, MessageRight} from '../components/chat/message'
import { ContentCopy } from "@mui/icons-material";
import { useKeycloak } from "@react-keycloak/web";



const Chat :React.FC<{starter:Number}>  = ({starter}) => {

  let {groupid} = useParams();



   const [messages, setMessages] = useState<Message[]>([]);
   const [open, setOpen] = React.useState(false);


   const { keycloak } = useKeycloak();

  console.log("CHat")

  console.log("Token" +keycloak.idToken||"undefined")


    useEffect(() => {
      setMessages([
        {
          messageid : "3123151-1251090924-1250912051",
          author : "bober",
          content : "We Living Up THere",
          pfp : "",
          sent: "2019-55-04"
        },
        {
          messageid : "3123151-1251090924-1250912052",
          author : "Pcadler",
          content : "No Way Bro ",
          pfp : "",
          sent: "2019-55-04"
        },
        {
          messageid : "3123151-1251090924-1250912053",
          author : "bober",
          content : "Yes, Its Lit",
          pfp : "",
          sent: "2019-55-04"
        },
      ])
    },[])

    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = (value: string) => {
      setOpen(false);
    };


    const MessageList = messages.map((value:Message, index:number) => {

      const messageProps = {

      }

      if (value.author == "Pcadler") {
        return (
          <MessageRight author={value.author} pfp={value.pfp} content={value.content} timestamp={value.sent}/>
        )
      }

      return (
        <MessageLeft author={value.author} pfp={value.pfp} content={value.content} timestamp={value.sent}/>
      )
    })


    return (
        <React.Fragment>

          {MessageList}
        </React.Fragment>
    );
}


export default Chat 