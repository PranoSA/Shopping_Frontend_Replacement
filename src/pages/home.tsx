/* eslint-disable no-empty */

import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import { useEffect, useState } from "react";

import {Group} from '../types/group'

import {GroupDialog} from '../components/home/add_group_form'
import axios, {AxiosError, } from "axios";

import { useKeycloak } from "@react-keycloak/web";
import {  useNavigate } from 'react-router-dom';




const Home :React.FC  = () => {

  //let {groupid} = useParams();

   const [groups,setGroups] = useState<Group[]>([]);
   //const [open, setOpen] = React.useState(false);
   const { keycloak } = useKeycloak();

   const navigator = useNavigate();

   const [groupName, setGroupName] = useState<string>("");

   const [groupDescription, setGroupDescription] = useState<string>("");

   const SubmitForm:React.MouseEventHandler = async (e:React.MouseEvent) => {
    e.preventDefault();

    try {
      await keycloak.updateToken(10)
    }
    catch(e){

    }

    const res = await axios.post("http://localhost:8080/group", {
      name : groupName,
      description : groupDescription,
    },  
    {
      headers: {
        "Authorization" : "Bearer "+localStorage.getItem("id_token")
      }
    })
    setGroups([...groups, res.data])
  }


    useEffect(() => {

      const fetchGroups = async() => {

        
        try {
           await keycloak.updateToken(5)
        }
        catch(e){
          try {
          if(keycloak.isTokenExpired()){
            
          }
        }
        catch(e){
            console.log("Why Is this thorwing error")
          }
        }

         /* .catch(() => {
            if (keycloak.isTokenExpired()){
              //throw Error();
            }
          })*/


          console.log(localStorage.getItem("id_token"));

          try {
            const res = await axios.get("http://localhost:8080/groups", {
              headers : {
                "Authorization" : "Bearer " + localStorage.getItem("id_token")
              }
            })

          setGroups([...groups,... res.data])
        }

        catch(e) {

          if (e instanceof AxiosError){
            
            if(e.response?.status == 401) {


              localStorage.removeItem("id_token")
              keycloak.authenticated = false
              console.log("Forbidden")
            }
          }

          //const ref2 = await keycloak.updateToken(5)

          //const Groups = await res.data;

        }
      
      }

     fetchGroups()
      


     
    },[])

  
    //<Navigate to={`/groupid/${id}`} replace={true} />

    const VisitGroupPage = (e:React.MouseEvent<HTMLButtonElement>, id:string) => {
      e.preventDefault();
      
      navigator(`/group/${id}`);

    }


    const GroupList = groups.map((value:Group) => {

      return (
        <Card /*sx={{ maxWidth: 345 }}*/ key={value.id}>
        <CardMedia
          sx={{ height: 140 }}
          image= {"rrr"}
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
          <Button size="small" onClick={(e) => VisitGroupPage(e, value.id)}>Learn More</Button>
        </CardActions>
      </Card>
      );
    })

    const onChangeName = (e:React.FormEvent<HTMLInputElement>) => {
      setGroupName(e.currentTarget.value)
    } 

    const onChangeDescription = (e:React.FormEvent<HTMLInputElement>) => {
      setGroupDescription(e.currentTarget.value)
    }


    return (
        <React.Fragment>
          {     
           <GroupDialog clickHandler={SubmitForm} changeHandleName={onChangeName} changeHandleDescription={onChangeDescription} />
      }
      <p>Groups!</p>
          {GroupList}
        </React.Fragment>
    );
}


export default Home