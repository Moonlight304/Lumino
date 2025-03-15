import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useRecoilState } from "recoil";
import { userIDState } from "@/configs/atoms";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import toastConfig from "@/configs/toastConfig";

const server_url = import.meta.env.VITE_server_url;

export default function Notifications() {
    const [isLoading, setIsLoading] = useState(true)
    const [globalUserID] = useRecoilState(userIDState);
    const [notifications, setNotifications] = useState([]);

    async function fetchNotifications() {
        setIsLoading(true)
        try {
            const response = await axios.get(`${server_url}/users/getUser/${globalUserID}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwt_token")}`,
                },
            })
            const data = response.data

            if (data.status === "success") {
                console.log(data.user.notifications);

                setNotifications(data.user.notifications);
            }
            else {
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

    async function handleRead(notificationID) {
        try {
            const response = await axios.get(`${server_url}/users/mark_notification/${notificationID}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwt_token")}`,
                },
            })
            const data = response.data;

            if (data.status === "success") {
                console.log(data.message);
            }
            else {
                toast.error(data.message, toastConfig);
            }
        }
        catch (e) {
            toast.error("Oops.. an error occurred", toastConfig)
            console.log(e.message);
        }
    }

    async function handleDelete(notificationID) {
        try {
            const response = await axios.get(`${server_url}/users/delete_notification/${notificationID}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwt_token")}`,
                },
            })
            const data = response.data;

            if (data.status === "success") {
                console.log(data.message);
                setNotifications((prev) => prev.filter(n => n._id !== notificationID));
            }
            else {
                toast.error(data.message, toastConfig);
            }
        }
        catch (e) {
            toast.error("Oops.. an error occurred", toastConfig)
            console.log(e.message);
        }
    }

    const navigate = useNavigate();
    useEffect(() => {
        if (!globalUserID) {
            navigate("/")
        }

        fetchNotifications();
    }, [globalUserID, navigate])

    return (
        <>
            <Navbar />

            <div>
                {notifications?.length > 0 &&
                    notifications?.map((notification, index) => (
                        <div key={index} className={`border-2 flex justify-around ${notification?.read ? 'border-green-500' : 'border-red-500'}`}>
                            <h1> {notification?.message} </h1>
                            <Link to={notification?.action_url}> Go to  </Link>
                            <button onClick={() => handleRead(notification._id)}> Mark as read </button>
                            <button onClick={() => handleDelete(notification._id)} > Delete </button>
                        </div>
                    ))
                }
            </div>
        </>
    );
}