import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState={
    name:"",
    username:"",
    email:"",
    avatar:"",
    usernameChangedAt:null,
    bio:"",
    location:{
        city:"",
        state:"",
        country:""
    },
    
    interests:[],

    accessToken:null,
    isAccessToken:false,
    
    followersCount:0,
    followingsCount:0,
    closeFriendsCount:0,
    blockedUsersCount:0,
    

}

const userSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        setAccessToken:(state,action)=>{
            state.accessToken=action.payload
            state.isAccessToken=true
        },
        setUserInformation:(state,action)=>{
            const {name, username,email, avatar,usernameChangedAt,bio,location,followers,followings,closeFriends,blockedUsers, interests }=action.payload

            state.name=name;
            state.username=username;
            state.email=email;
            if(avatar?.url){
                state.avatar=avatar.url
            }
            else{
                state.avatar=avatar
            }
            if(usernameChangedAt){
                state.usernameChangedAt=usernameChangedAt
            }
            state.bio=bio

            state.location={...location}

            state.followersCount=followers?.length>0 ? followers.length:0

            state.followingsCount=followings?.length>0 ? followings.length:0

            state.closeFriendsCount=closeFriends?.length>0 ? closeFriends.length:0

            state.blockedUsersCount=blockedUsers?.length>0 ? blockedUsers.length:0
            
            state.interests=interests?.length>0 ? interests:[]



        }
    }
}) 
export default userSlice.reducer
export const {setAccessToken , setUserInformation} = userSlice.actions