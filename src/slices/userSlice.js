import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState={
    _id:"",
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
    followers:[],

    followingsCount:0,
    following:[],

    closeFriendsCount:0,
    closeFriends:[],

    blockedUsersCount:0,
    blockedUsers:[],

    privacy:{
        profileVisibility:"public",
        allowComments:"everyone"
    }

}

const userSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        setAccessToken:(state,action)=>{
            state.accessToken=action.payload
            state.isAccessToken=true
            localStorage.setItem("accessToken", action.payload)
        },
        setUserInformation:(state,action)=>{
            const {_id,
                name, 
                username,
                email,
                 avatar,
                 usernameChangedAt,
                 bio,
                 location,
                 followers,
                 following,
                 closeFriends,
                 blockedUsers,
                 interests,
                privacy
                }=action.payload;
            state._id=_id;

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

            state.followersCount = followers?.length>0 ? followers.length : 0
            state.followers = followers.length > 0? followers : []

            state.followingsCount = following?.length>0 ? following.length : 0
            state.following = following?.length>0 ? following : []
 
            state.closeFriendsCount = closeFriends?.length>0 ? closeFriends.length:0
            state.closeFriends = closeFriends?.length>0 ? closeFriends : []


            state.blockedUsersCount = blockedUsers?.length>0 ? blockedUsers.length : 0
            state.blockedUsers = blockedUsers?.length>0 ? blockedUsers : []


            state.interests = interests?.length>0 ? interests:[]
            state.privacy = privacy

            localStorage.setItem("userInfo", JSON.stringify(state))
        },
        loadUserFromStorage: (state) => {
            const storedUser = localStorage.getItem("userInfo");
            const storedToken = localStorage.getItem("accessToken");
      
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              Object.assign(state, parsedUser); 
            }
      
            if (storedToken) {
              state.accessToken = storedToken;
              state.isAccessToken = true;
            }
          },
    }
}) 
export default userSlice.reducer
export const {setAccessToken , setUserInformation , loadUserFromStorage} = userSlice.actions