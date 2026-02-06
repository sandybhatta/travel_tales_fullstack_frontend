import React, { useEffect, useState } from "react";
import "./Notifications.css";
import { useGetNotificationsQuery, useMarkNotificationsAsReadMutation } from "../Apis/notificationApi";
import { useSocketContext } from "../context/SocketContext";
import { Link } from "react-router-dom";

const Notifications = () => {
  const { data: notifications, isLoading, refetch } = useGetNotificationsQuery();
  const [markAsRead] = useMarkNotificationsAsReadMutation();
  const { socket } = useSocketContext();
  const [localNotifications, setLocalNotifications] = useState([]);

  useEffect(() => {
    if (notifications) {
      setLocalNotifications(notifications);
      // Mark as read immediately when viewed
      markAsRead();
    }
  }, [notifications]);

  useEffect(() => {
    socket?.on("newNotification", (newNotification) => {
      setLocalNotifications((prev) => [newNotification, ...prev]);
      // Refetch to ensure sync and update badge
      refetch();
    });

    return () => {
      socket?.off("newNotification");
    };
  }, [socket, refetch]);

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2>Notifications</h2>
      </div>
      
      {isLoading ? (
        <div className="loading-state">
           <div className="spinner"></div>
        </div>
      ) : localNotifications.length === 0 ? (
        <div className="empty-state">
           <i className='bx bx-bell-off text-6xl text-gray-300 mb-3'></i>
           <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notification-list">
          {localNotifications.map((notif) => (
            <div key={notif._id} className={`notification-item ${!notif.isRead ? "unread" : ""}`}>
              <Link to={`/profile/${notif.sender._id}`} className="avatar-link">
                <img 
                  src={notif.sender.avatar?.url || notif.sender.avatar || "/default-avatar.png"} 
                  alt={notif.sender.username} 
                  className="notif-avatar" 
                />
              </Link>
              <div className="notif-content">
                <p>
                  <Link to={`/profile/${notif.sender._id}`} className="username-link">
                    {notif.sender.username}
                  </Link>{" "}
                  {notif.type === "like_post" && "liked your post."}
                  {notif.type === "like_trip" && "liked your trip."}
                  {notif.type === "follow" && "started following you."}
                  {notif.type === "comment_post" && "commented on your post."}
                  {notif.type === "trip_invite" && "invited you to a trip."}
                  {notif.type === "reply_comment" && "replied to your comment."}
                  {notif.type === "like_comment" && "liked your comment."}
                  {notif.type === "tagged_in_post" && "tagged you in a post."}
                  {notif.type === "mention_in_caption" && "mentioned you in a caption."}
                  {notif.type === "mention_in_comment" && "mentioned you in a comment."}
                  {notif.type === "new_post_from_following" && "created a new post."}
                  {notif.type === "new_trip_from_following" && "created a new trip."}
                </p>
                <span className="notif-time">{new Date(notif.createdAt).toLocaleDateString()}</span>
              </div>
              
              {notif.relatedPost && (
                <Link to={`/post/${notif.relatedPost._id}`} className="notif-preview">
                  {notif.relatedPost.media && notif.relatedPost.media.length > 0 ? (
                    notif.relatedPost.media[0].resource_type === 'video' ? (
                       <video src={notif.relatedPost.media[0].url} className="w-full h-full object-cover" />
                    ) : (
                       <img src={notif.relatedPost.media[0].url} alt="Post" />
                    )
                  ) : (
                    <div className="text-xs p-1 text-gray-500 overflow-hidden h-full flex items-center justify-center bg-gray-100">
                        {notif.relatedPost.caption ? (notif.relatedPost.caption.substring(0, 15) + (notif.relatedPost.caption.length > 15 ? "..." : "")) : <i className='bx bx-text'></i>}
                    </div>
                  )}
                </Link>
              )}
               {notif.relatedTrip && (
                <Link to={`/trip/${notif.relatedTrip._id}`} className="notif-preview">
                  <img src={notif.relatedTrip.coverPhoto?.url || notif.relatedTrip.coverPhoto || notif.relatedTrip.coverImage} alt="Trip" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
