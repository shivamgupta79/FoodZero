// client/components/NotificationCenter.jsx

"use client";
import { useState, useEffect } from "react";
import { Bell, X, Check, Trash2, Settings, Filter } from "lucide-react";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const fetchNotifications = async (pageNum = 1, reset = true) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      let url = `/api/notifications?page=${pageNum}&limit=20`;
      if (filter !== "all") {
        url += `&type=${filter}`;
      }

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (reset) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        
        setHasMore(data.pagination.page < data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications/unread-count", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (notificationIds = []) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ notificationIds })
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.length === 0 || notificationIds.includes(notif._id)
              ? { ...notif, read: true }
              : notif
          )
        );
        
        // Update unread count
        if (notificationIds.length === 0) {
          setUnreadCount(0);
        } else {
          setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
        }
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        
        // Update unread count if notification was unread
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchNotifications(page + 1, false);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      "donation-accepted": "🎉",
      "donation-picked_up": "📦",
      "donation-in_transit": "🚚",
      "donation-delivered": "✅",
      "new-donation": "🍽️",
      "geofence-alert": "📍",
      "feedback-received": "💬",
      "verification-approved": "✅",
      "verification-rejected": "❌",
      "system-alert": "⚠️",
      "general": "ℹ️"
    };
    return iconMap[type] || "📢";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical": return "border-l-red-500 bg-red-50";
      case "high": return "border-l-orange-500 bg-orange-50";
      case "normal": return "border-l-blue-500 bg-blue-50";
      case "low": return "border-l-gray-500 bg-gray-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl z-50 max-h-[32rem] overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-800">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => markAsRead([])}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    disabled={unreadCount === 0}
                  >
                    Mark All Read
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 text-sm">
                {["all", "donation-accepted", "new-donation", "geofence-alert"].map(filterType => (
                  <button
                    key={filterType}
                    onClick={() => {
                      setFilter(filterType);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      filter === filterType 
                        ? "bg-orange-500 text-white" 
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {filterType === "all" ? "All" : filterType.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {notifications.map((notification) => (
                    <div 
                      key={notification._id}
                      className={`p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-md ${
                        getPriorityColor(notification.priority)
                      } ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-sm text-gray-800 truncate">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead([notification._id])}
                                  className="text-blue-500 hover:text-blue-700 p-1"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification._id)}
                                className="text-red-500 hover:text-red-700 p-1"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 break-words">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.priority === "critical" && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                Critical
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="text-center py-3">
                      <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                      >
                        {isLoading ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50 flex justify-between">
                <button
                  onClick={clearAllNotifications}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
                <button
                  onClick={() => {/* Navigate to notification settings */}}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}