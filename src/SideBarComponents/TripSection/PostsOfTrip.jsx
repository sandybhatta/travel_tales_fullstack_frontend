import React, { useEffect, useMemo, useState } from "react";
import mainApi from "../../Apis/axios";

const PostsOfTrip = ({ trip, setTrip }) => {
  const [addPostModal, setAddPostModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPostsOfMine() {
      setError("");
      try {
        const result = await mainApi.get("/api/posts/me");
        setPosts(result.data.message ? [] : result.data.post);
      } catch (error) {
        setError(error?.response?.data?.message || "Something went wrong");
      }
    }

    if (addPostModal) {
      fetchPostsOfMine();
    }
  }, [addPostModal]);

  const curatedPosts = useMemo(() => {
    const postsThatAreNotPartOfAnyTrip = posts.filter((post) => {
      if (post?.tripId) {
        return false;
      } else {
        return true;
      }
    });
    return postsThatAreNotPartOfAnyTrip;
  }, [posts]);
  console.log(curatedPosts);
  console.log(posts);
  return (
    <div className="w-full bg-white px-4 py-3 rounded-xl shadow-2xl flex flex-col items-center justify-center gap-5">
      {/* add post in the trip  */}

      {addPostModal && (
        <div
          className="w-screen fixed bg-black/50  inset-0 h-screen  flex items-center justify-center "
          onClick={(e) => {
            e.stopPropagation();
            setAddPostModal(false);
          }}
        >
          <div className="w-2/3 h-full pt-5 px-3 pb-3 rounded-xl bg-white flex flex-col items-center gap-3">
            {/* header */}
            <div className="flex items-center justify-start gap-2 w-full">
              <i className="bx bx-image-plus text-3xl text-red-500"></i>
              <h3 className="leckerli text-2xl text-red-500">
                {" "}
                Add posts to the Trip
              </h3>
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-3">
              {curatedPosts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center gap-5 text-3xl text-gray-500 p-4 h-full">
                  <p> No Posts available. </p>
                  <p>Create posts first to add them in your Trip</p>
                </div>
              )}
              {curatedPosts.length > 0 &&
                curatedPosts.map((post) => {
                  return (
                    <div
                      className="w-full rounded-lg overflow-hidden"
                      key={post._id}
                    >
                      {post.media && post.media.length > 0 ? (
                        <div>
                          {post.media.map((file) => {
                            return file.resource_type === "image" ? (
                              <img src={file.url} alt="images" key={file._id} />
                            ) : (
                              <video src={file.url} key={file._id} controls />
                            );
                          })}
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex items-center justify-between">
        {/* heading */}
        <div className="flex items-center justify-center gap-3 px-3 py-2 rounded-lg">
          <i className="bx  bx-image-landscape text-3xl text-black"></i>
          <h3 className="text-xl leckerli text-black "> Trip Posts </h3>
        </div>

        {/* view itenary */}
        <div className="flex items-center justify-center gap-3 px-3 py-2 cursor-pointer bg-red-500 rounded-xl">
          <i className=" bx bx-eye-alt text-3xl text-white"></i>
          <h3 className="text-xl leckerli text-white font-semibold">
            {" "}
            View itenary{" "}
          </h3>
        </div>
      </div>

      {/* posts */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
        {trip.posts.map((post) => {
          return <div className="w-full rounded-lg " key={post._id}></div>;
        })}
      </div>

      <div
        className="w-full bg-red-500 cursor-pointer rounded-lg px-3 py-3 flex items-center justify-center gap-3"
        onClick={(e) => {
          e.stopPropagation();
          setAddPostModal(true);
        }}
      >
        <i className="bx bx-image-plus text-3xl text-white"></i>
        <h3 className="text-xl leckerli text-white font-semibold">
          Add Posts{" "}
        </h3>
      </div>
    </div>
  );
};

export default PostsOfTrip;
