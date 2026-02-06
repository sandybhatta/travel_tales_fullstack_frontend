import React from 'react'
import ScrollableFeed from 'react-scrollable-feed'
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../utils/chatLogics'
import { useSelector } from 'react-redux'

const ScrollableChat = ({ messages }) => {
  const user = useSelector((state) => state.user)
  // Need to parse userInfo because user state might be minimal or structured differently
  const userInfo = user._id ? user : JSON.parse(localStorage.getItem("userInfo"));

  return (
    <ScrollableFeed className="flex flex-col gap-1 pb-2">
      {messages &&
        messages.map((m, i) => (
          <div className="flex" key={m._id}>
            {(isSameSender(messages, m, i, userInfo._id) ||
              isLastMessage(messages, i, userInfo._id)) && (
              <div className="w-8 h-8 mr-1 mt-[7px] flex-shrink-0 cursor-pointer" title={m.sender.name}>
                 <img 
                    src={m.sender.avatar?.url || m.sender.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} 
                    alt={m.sender.name}
                    className="w-full h-full rounded-full object-cover"
                 />
              </div>
            )}
            
            <span
              className={`
                px-4 py-2 rounded-2xl max-w-[75%] break-words text-sm shadow-sm
                ${m.sender._id === userInfo._id ? "bg-[#EF233C] text-white ml-auto rounded-br-none" : "bg-white text-[#2B2D42] rounded-bl-none"}
              `}
              style={{
                marginLeft: isSameSenderMargin(messages, m, i, userInfo._id),
                marginTop: isSameUser(messages, m, i, userInfo._id) ? 3 : 10,
              }}
            >
              {m.content}
              {/* Optional: Read Receipts / Time */}
              <div className={`text-[10px] text-right mt-1 ${m.sender._id === userInfo._id ? "text-red-100" : "text-gray-400"}`}>
                 {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 {m.sender._id === userInfo._id && (
                     <span className="ml-1">
                        {/* Logic for single/double tick */}
                        <i className="bx bx-check-double"></i>
                     </span>
                 )}
              </div>
            </span>
          </div>
        ))}
    </ScrollableFeed>
  )
}

export default ScrollableChat
