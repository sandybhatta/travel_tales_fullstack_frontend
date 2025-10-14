import mainApi from "./axios";

// global search
export const globalSearch =(query)=>mainApi.get(`/api/search`, {
    params:{
        q:query
}}) 

// user search 
export const userSearch =(query, page=1, limit=10)=>mainApi.get('/api/search/users',{
    params:{
        q:query,
        limit,
        page
    }
})

// post Search 
export const postSearch = (query, page=1, limit=10)=>mainApi.get('/api/search/posts',{
    params:{
        q:query,
        page,
        limit
    }
})
// trip Search 
export const tripSearch = (query, page=1, limit=10)=>mainApi.get('/api/search/trips',{
    params:{
        q:query,
        page,
        limit
    }
})

//user history (20 history)
export const history = ()=>mainApi.get('/api/search/history')


// delete one seach history
export const deleteOneHistory = (id)=>mainApi.delete(`/api/search/history/${id}`)


// delete all seach history
export const deleteAllHistory = ()=>mainApi.delete('/api/search/history/')