

type Group_User = {
    groupid: String, 
    creator : String,
    pfp: String, 

}


type Group = {
    groupid : String, 
    name :  String, 
    owner : String 
    description : string
}


export type {
    Group,
    Group_User,
    
}