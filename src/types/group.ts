

type Group_User = {
    groupid: string, 
    creator : string,
    pfp: string, 

}


type Group = {
    id : string, 
    name :  string, 
    owner : string 
    description : string
}


export type {
    Group,
    Group_User,
    
}