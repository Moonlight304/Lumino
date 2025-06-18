import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import { userIDState } from "@/configs/atoms"
import { Link } from "react-router-dom"
import { toast } from 'react-hot-toast'
import toastConfig from "@/configs/toastConfig"
import { Bell, Check, ExternalLink, Trash2 } from "lucide-react"
import Loading from "@/components/Loading"
import { API } from "@/configs/api"

export default function Notifications() {
    const [isLoading, setIsLoading] = useState(true)
    const [globalUserID] = useRecoilState(userIDState)
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        async function fetchNotifications() {
            setIsLoading(true)

            try {
                const response = await API(`/users/getUser/${globalUserID}`, 'GET');
                const data = response.data

                if (data.status === "success") {
                    console.log(data.user.notifications)
                    setNotifications(data.user.notifications)
                } else {
                    toast.error(data.message, toastConfig)
                }
            }
            catch (e) {
                toast.error("Oops.. an error occurred", toastConfig)
            }
            finally {
                setIsLoading(false)
            }
        }

        fetchNotifications();
    }, []);

    async function handleRead(notificationID) {
        try {
            const response = await API(`/users/mark_notification/${notificationID}`, 'GET');
            const data = response.data

            if (data.status === "success") {
                console.log(data.message)
                // Update the local state to reflect the change
                setNotifications((prev) => prev.map((n) => (n._id === notificationID ? { ...n, read: true } : n)))
                toast.success("Marked as read", toastConfig)
            }
            else {
                toast.error(data.message, toastConfig)
            }
        }
        catch (e) {
            toast.error("Oops.. an error occurred", toastConfig)
            console.log(e.message)
        }
    }

    async function handleDelete(notificationID) {
        try {
            const response = await API(`/users/delete_notification/${notificationID}`, 'GET');
            const data = response.data

            if (data.status === "success") {
                console.log(data.message)
                setNotifications((prev) => prev.filter((n) => n._id !== notificationID))
                toast.success("Notification deleted", toastConfig)
            }
            else {
                toast.error(data.message, toastConfig)
            }
        }
        catch (e) {
            toast.error("Oops.. an error occurred", toastConfig)
            console.log(e.message)
        }
    }

    return (
        <>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center gap-2 mb-6">
                    <Bell className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">Notifications</h1>
                </div>

                {isLoading ? (
                    <Loading message={'Getting your notifications...'} />
                ) : notifications?.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((notification, index) => (
                            <div
                                key={index}
                                className={`rounded-lg border p-4 shadow-sm transition-all ${notification?.read ? "bg-background" : "bg-primary/5 border-primary/20"
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-2">
                                            {!notification?.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                                            <p className="text-sm sm:text-base">{notification?.message}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 ml-auto">
                                        <Link
                                            target="_blank"
                                            to={notification?.action_url}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white transition duration-300 ease-in-out h-9 px-4 py-2"
                                        >
                                            <ExternalLink className="mr-1 h-4 w-4" />
                                            View
                                        </Link>
                                        {!notification?.read && (
                                            <button
                                                onClick={() => handleRead(notification._id)}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                                            >
                                                <Check className="mr-1 h-4 w-4" />
                                                Mark read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(notification._id)}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2 text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/5">
                        <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-lg font-medium mb-1">No notifications</h3>
                        <p className="text-muted-foreground max-w-md">
                            You don't have any notifications at the moment. When you receive notifications, they will appear here.
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}

