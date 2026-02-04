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
                  src={notif.sender.profilePic?.url || notif.sender.profilePic || "/default-avatar.png"} 
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
                </p>
                <span className="notif-time">{new Date(notif.createdAt).toLocaleDateString()}</span>
              </div>
              
              {notif.relatedPost && (
                <Link to={`/post/${notif.relatedPost._id}`} className="notif-preview">
                  <img src={notif.relatedPost.images?.[0]?.url || notif.relatedPost.images?.[0]} alt="Post" />
                </Link>
              )}
               {notif.relatedTrip && (
                <Link to={`/trip/${notif.relatedTrip._id}`} className="notif-preview">
                  <img src={notif.relatedTrip.coverImage || notif.relatedTrip.coverPhoto} alt="Trip" />
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
