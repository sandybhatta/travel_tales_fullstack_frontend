import React from "react";

import CreatePost from "./CreatePost";

const HomeFeed = ({createModal,setCreateModal}) => {
  

  return (
  <div className="w-[60%]   relative  flex items-center justify-center  ">
  <CreatePost createModal={createModal} setCreateModal={setCreateModal}/>
  </div>
  );
};

export default HomeFeed;
