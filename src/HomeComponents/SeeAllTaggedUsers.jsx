import React from 'react'

const SeeAllTaggedUsers = ({taggedUsers,setTaggedUsers,users}) => {
    const usersWithInfo = users.filter(user=>taggedUsers.includes(user._id))
  return (
    <div className="w-full flex flex-col justify-center items-center gap-5 mt-10">
            {usersWithInfo.map((u) => {
              const avatar = u.avatar?.url || u.avatar;

              return (
                <div
                  key={u._id}
                  className="w-[75%] bg-[#2B2D42] rounded-lg flex items-center justify-around gap-1 px-5 py-2 text-white "
                >
                  <div className="w-[10%] h-full">
                    <img
                      src={avatar}
                      alt="user"
                      className="object-contain h-1/2 w-full"
                    />
                  </div>
                  <div className="h-full w-[80%] flex flex-col items-center justify-center gap-1">
                    <p>{u.name}</p>
                    <p>@{u.username}</p>
                  </div>
                  <button
                    className='px-3 py-2 text-xl cursor-pointer text-white bg-red-500 rounded-lg'
                    onClick={() => setTaggedUsers(prev=>prev.filter(taggedId=>taggedId !== u._id))
                    }
                  >
                    UnTag
                  </button>
                </div>
              );
            })}
          </div>
  )
}

export default SeeAllTaggedUsers