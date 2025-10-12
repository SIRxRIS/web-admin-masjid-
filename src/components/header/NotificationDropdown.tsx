"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Dropdown } from "../ui/dropdown/Dropdown";

// Hindari impor tipe dari @prisma/client di klien.
// Definisikan union types lokal agar cocok dengan enum di schema Prisma.
type NotificationType =
  | "TARGET_PEMASUKAN"
  | "DONASI_BARU"
  | "KONTEN_BARU"
  | "INVENTARIS_BARU"
  | "SYSTEM_HEALTH"
  | "EMAIL_WHITELIST"
  | "GENERAL";

type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

type Role =
  | "ADMIN"
  | "KETUA"
  | "SEKRETARIS"
  | "BENDAHARA"
  | "PENGURUS"
  | "HUMAS_MEDIA"
  | "REMAS_ADMIN"
  | "MAJLIS_TALIM_ADMIN";

// Interface untuk tipe notifikasi yang diperluas
interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetRoles: Role[];
  actionUrl?: string | null;
  relatedId?: string | null;
  relatedTable?: string | null;
  isRead: boolean;
  readBy: string[];
  createdBy?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isReadByUser?: boolean;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { userProfile, loading: authLoading } = useAuth();

  // Load notifications saat komponen mount atau userProfile berubah
  useEffect(() => {
    if (userProfile?.role && !authLoading) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [userProfile, authLoading]);

  // Load notifications berdasarkan role user
  const loadNotifications = async () => {
    if (!userProfile?.role || !userProfile?.id) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/notifications?role=${encodeURIComponent(
          userProfile.role as Role
        )}&userId=${encodeURIComponent(userProfile.id)}`
      );
      const result = await res.json();
      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load jumlah notifikasi yang belum dibaca
  const loadUnreadCount = async () => {
    if (!userProfile?.role || !userProfile?.id) return;

    try {
      const res = await fetch(
        `/api/notifications/unread-count?role=${encodeURIComponent(
          userProfile.role as Role
        )}&userId=${encodeURIComponent(userProfile.id)}`
      );
      const result = await res.json();
      if (result.success) {
        setUnreadCount(result.data || 0);
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  // Handle klik notifikasi
  const handleNotificationClick = async (notification: Notification) => {
    if (!userProfile?.id) return;

    // Tandai sebagai dibaca jika belum dibaca
    if (!notification.isReadByUser) {
      try {
        const res = await fetch(`/api/notifications/mark-read`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notification.id, userId: userProfile.id }),
        });
        const result = await res.json();
        if (result.success) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, isReadByUser: true } : n))
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Redirect ke action URL jika ada
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    closeDropdown();
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
  };

  // Fungsi untuk mendapatkan icon berdasarkan tipe notifikasi
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "TARGET_PEMASUKAN":
        return "🎯";
      case "DONASI_BARU":
        return "💰";
      case "KONTEN_BARU":
        return "📝";
      case "INVENTARIS_BARU":
        return "📦";
      case "SYSTEM_HEALTH":
        return "⚠️";
      case "EMAIL_WHITELIST":
        return "✉️";
      default:
        return "🔔";
    }
  };

  // Fungsi untuk mendapatkan warna prioritas
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case "URGENT":
        return "text-red-600 dark:text-red-400";
      case "HIGH":
        return "text-orange-600 dark:text-orange-400";
      case "MEDIUM":
        return "text-blue-600 dark:text-blue-400";
      case "LOW":
        return "text-gray-600 dark:text-gray-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  // Fungsi untuk format waktu relatif
  const formatRelativeTime = (date: string | Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days < 7) return `${days} hari yang lalu`;
    return new Date(date).toLocaleDateString("id-ID");
  };

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        {/* Indikator notifikasi dengan counter */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 z-10 flex items-center justify-center min-w-[18px] h-[18px] text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifikasi
          </h5>
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dropdown-toggle dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length > 0 ? (
            <ul className="flex flex-col space-y-1">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left p-3 rounded-lg border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5 transition-colors ${
                      !notification.isReadByUser ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon notifikasi */}
                      <div className="flex-shrink-0 text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Konten notifikasi */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium truncate ${getPriorityColor(notification.priority)}`}>
                            {notification.title}
                          </h4>
                          {!notification.isReadByUser && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                          
                          {/* Badge prioritas untuk urgent/high */}
                          {(notification.priority === "URGENT" || 
                            notification.priority === "HIGH") && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              notification.priority === "URGENT" 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                              {notification.priority === "URGENT" ? 'Urgent' : 'Penting'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            // Tampilan ketika tidak ada notifikasi
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM12 3v12M8.5 8.5L12 12l3.5-3.5"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-gray-200">
                Tidak Ada Notifikasi
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Anda belum memiliki notifikasi baru saat ini.
              </p>
            </div>
          )}
        </div>

        {/* Tombol "Lihat Semua" hanya ditampilkan jika ada notifikasi */}
        {notifications.length > 0 && (
          <Link
            href="/"
            className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Lihat Semua Notifikasi
          </Link>
        )}
      </Dropdown>
    </div>
  );
}