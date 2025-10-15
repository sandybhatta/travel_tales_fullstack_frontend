import React from "react";

import CreatePost from "./CreatePost";

const HomeFeed = ({createModal,setCreateModal}) => {
  

  return (
  <div className="w-full lg:w-[70%] relative flex justify-center bg-[#fff]">
  <CreatePost createModal={createModal} setCreateModal={setCreateModal}/>
  </div>
  );
};

export default HomeFeed;
