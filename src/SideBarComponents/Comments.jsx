import React from 'react'
import { Link } from 'react-router-dom'
import { useGetMentionedCommentsQuery } from '../slices/commentApiSlice'

const Comments = () => {
  const { data, isLoading: loading } = useGetMentionedCommentsQuery()
  const comments = data?.comments || []

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-900 text-white font-sans p-8">
        <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Comments You're Mentioned In</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-800 rounded-xl overflow-hidden h-48 animate-pulse">
               <div className="h-full w-full bg-gray-700/50 p-4 flex flex-col gap-4">
                  <div className="flex gap-3">
                     <div className="w-10 h-10 rounded-full bg-gray-600"></div>
                     <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 bg-gray-600 rounded"></div>
                        <div className="h-3 w-1/4 bg-gray-600 rounded"></div>
                     </div>
                  </div>
                  <div className="h-16 bg-gray-600 rounded w-full"></div>
               </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white font-sans p-8">
      <h2 className="text-3xl font-bold mb-8 text-center md:text-left flex items-center gap-3">
        <i className='bx bx-message-rounded-dots text-red-500'></i>
        Comments You're Mentioned In
      </h2>
      
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
          <i className='bx bx-message-rounded-x text-6xl mb-4'></i>
          <p className="text-xl">You haven't been mentioned in any comments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-gray-800 rounded-xl border border-gray-700 p-5 shadow-lg hover:border-gray-600 transition-colors flex flex-col h-full">
              {/* Comment Header: Author info */}
              <div className="flex items-center gap-3 mb-4">
                 <img 
                    src={comment.author.avatar?.url || comment.author.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt={comment.author.username} 
                    className="w-10 h-10 rounded-full object-cover border border-gray-600"
                 />
                 <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{comment.author.name}</p>
                    <p className="text-xs text-gray-400">@{comment.author.username}</p>
                 </div>
                 <span className="ml-auto text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Comment Content */}
              <div className="flex-1 bg-gray-900/50 p-3 rounded-lg border border-gray-700 mb-4">
                  {comment.parentComment && (
                     <div className="text-xs text-gray-400 mb-1 pb-1 border-b border-gray-700 flex items-center gap-1">
                        <i className='bx bx-reply transform rotate-180'></i>
                        Replying to @{comment.parentComment.author?.username || 'user'}
                     </div>
                  )}
                  <p className="text-gray-200 text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>

              {/* Context: The Post it belongs to */}
              <Link to={`/post/${comment.post._id}`} className="mt-auto group flex items-center gap-3 p-2 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                  {comment.post.media && comment.post.media.length > 0 ? (
                      comment.post.media[0].resource_type === 'video' ? (
                        <video src={comment.post.media[0].url} className="w-12 h-12 rounded object-cover bg-gray-900" />
                      ) : (
                        <img src={comment.post.media[0].url} alt="post thumb" className="w-12 h-12 rounded object-cover bg-gray-900" />
                      )
                  ) : (
                     <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center text-gray-500">
                        <i className='bx bx-text'></i>
                     </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">Commented on post:</p>
                      <p className="text-xs text-gray-300 font-medium truncate group-hover:text-red-400 transition-colors">
                        {comment.post.caption || "Untitled Post"}
                      </p>
                  </div>
                  <i className='bx bx-chevron-right text-gray-500'></i>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Comments