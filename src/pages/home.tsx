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
import { group } from "console";

import GroupDialog from '../components/home/add_group_form'
import axios, { Axios, AxiosError, AxiosResponse } from "axios";

import { useKeycloak } from "@react-keycloak/web";
import { json } from "stream/consumers";
import { LocalTaxi } from "@mui/icons-material";



const Home :React.FC  = () => {

  //let {groupid} = useParams();

   const [groups,setGroups] = useState<Group[]>([]);
   const [open, setOpen] = React.useState(false);
   const { keycloak } = useKeycloak();

   const [groupName, setGroupName] = useState<string>("");

   const [description, setDescription] = useState<string>("");

   const SubmitForm:React.MouseEventHandler = async (e:React.MouseEvent) => {
    e.preventDefault();

    try {

      const ref = await keycloak.updateToken(10)
      .catch(() => {
        if (keycloak.isTokenExpired()){
          throw Error();
        }
      })

    const res = await axios.post("http://localhost:8080/group", {
       name : groupName,
    },  {
      headers: {
        "Authorization" : "Bearer "+localStorage.getItem("id_token")
      }
    }
    )
    .then((res:AxiosResponse) => {

      setGroups([...groups, {...res.data, description:"IDK"} ])
    }).catch((e:AxiosError) => {

    })
    }catch(e){

    }
  }


    useEffect(() => {
      setGroups([
        {
          groupid : "231251-251251-12515",
          name : "First Group",
          owner : "DSDSDS",  
          description : "Cool Group For THe SQuad"
        },
        {
          groupid : "231251-251251-12515",
          name : "Second Group",
          owner : "DSDSDS",  
          description : "A cool group for the fam"
        }
      ])

      const fetchGroups = async() => {

        
        try {
          console.log(keycloak.isTokenExpired)
          const ref = await keycloak.updateToken(5)
          .catch(() => {
            if (keycloak.isTokenExpired()){
              throw Error();
            }
          })
          console.log(ref)
          console.log("Fetching Groups")

          console.log(localStorage.getItem("id_token"));

          const res = await axios.get("http://localhost:8080/groups", {
            headers : {
              "Authorization" : "Bearer " + localStorage.getItem("id_token")
            }
          })
          .then((res:AxiosResponse) => {
            const Groups = res.data; 

            setGroups([...groups, Groups])
            console.log(Groups);
          })
          .catch((e:AxiosError) => {
            
            console.log(e.response)
            console.log(e.response?.status)
            if(e.response?.status == 401) {


              localStorage.removeItem("id_token")
              keycloak.authenticated = false
              console.log("Forbidden")
            }
            else throw e 
          })

          const ref2 = await keycloak.updateToken(5)
          console.log(ref2)
          console.log("Fetching Groups")

          //const Groups = await res.data;

        }
      

        catch(e){
          console.log("REresh Error??")
          console.log(e)  
          //keycloak.logout();
          localStorage.removeItem("id_token")
          //keycloak.logout();
        }
      }

      fetchGroups()
      


      
    },[])

    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = (value: string) => {
      setOpen(false);
    };


    const GroupList = groups.map((value:Group, index:number) => {

      return (
        <Card /*sx={{ maxWidth: 345 }}*/>
        <CardMedia
          sx={{ height: 140 }}
          image= {value.groupid?.trim()}
          title='${messageid}'
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {value.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {value.description}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small">Share</Button>
          <Button size="small">Learn More</Button>
        </CardActions>
      </Card>
      );
    })


    return (
        <React.Fragment>
          {     
           <GroupDialog clickHandler={SubmitForm} changeHandleName={(e:any) => {
            e.preventDefault()
            setGroupName(e.target.value)
           }} />
      }
          {GroupList}
        </React.Fragment>
    );
}


export default Home