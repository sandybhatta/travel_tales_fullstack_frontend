import React from 'react'
import { Link } from 'react-router-dom'
import { useGetMentionedPostsQuery } from '../slices/postApiSlice'

const MentionedPosts = () => {
  const { data, isLoading: loading } = useGetMentionedPostsQuery()
  const posts = data?.post || []

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-900 text-white font-sans p-8">
        <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Mentioned In Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-gray-800 rounded-xl overflow-hidden aspect-square animate-pulse">
              <div className="h-full w-full bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white font-sans p-8">
      <h2 className="text-3xl font-bold mb-8 text-center md:text-left flex items-center gap-3">
        <i className='bx bx-at text-red-500'></i>
        Mentioned In Posts
      </h2>
      
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
          <i className='bx bx-at text-6xl mb-4'></i>
          <p className="text-xl">You haven't been mentioned in any posts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <Link to={`/post/${post._id}`} key={post._id} className="group relative block bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-red-500/50">
              <div className="aspect-square w-full overflow-hidden bg-gray-700 flex items-center justify-center">
                {post.media && post.media.length > 0 ? (
                   post.media[0].resource_type === 'video' ? (
                    <video src={post.media[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <img src={post.media[0].url} alt="post content" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )
                ) : (
                  <div className="p-6 text-center w-full h-full flex flex-col items-center justify-center">
                    <i className='bx bx-text text-4xl text-gray-500 mb-2'></i>
                    <p className="text-sm text-gray-300 line-clamp-4 font-medium">{post.caption}</p>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6 text-white font-bold backdrop-blur-[2px]">
                   <div className="flex items-center gap-2">
                      <i className='bx bxs-heart text-red-500 text-xl'></i>
                      <span>{post.likes.length}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <i className='bx bxs-comment text-blue-400 text-xl'></i>
                      <span>{post.comments.length}</span>
                   </div>
                </div>
              </div>

              {/* Author info snippet */}
              <div className="p-3 flex items-center gap-2 bg-gray-800 border-t border-gray-700">
                  <img src={post.author.avatar?.url || post.author.avatar} alt={post.author.username} className="w-6 h-6 rounded-full object-cover" />
                  <p className="text-xs text-gray-400 truncate">@{post.author.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MentionedPosts