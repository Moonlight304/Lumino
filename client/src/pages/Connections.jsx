import axios from 'axios';
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { socketState, userIDState } from "../configs/atoms";
import { toast } from 'react-toastify';
import toastConfig from '../configs/toastConfig';
import { useNavigate } from 'react-router-dom';

import Navbar from "../components/Navbar";
import ConnectionsList from "../components/ConnectionsList";
import ChatWindow from "../components/ChatWindow";

const server_url = import.meta.env.VITE_server_url;
const cloud_name = import.meta.env.VITE_cloud_name;
const upload_preset = import.meta.env.VITE_upload_preset;

export default function Connections() {
    const [globalUserID] = useRecoilState(userIDState);
    const [globalSocket] = useRecoilState(socketState);

    const [isLoading, setIsLoading] = useState(true);
    const [tab, setTab] = useState('connected');
    const [connected, setConnected] = useState([]);
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);

    const [otherUserID, setOtherUserID] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);

    const [newMessage, setNewMessage] = useState('');
    const [imageURL, setImageURL] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (!globalUserID) navigate(-1);
    }, [globalUserID, navigate]);

    useEffect(() => {
        if (globalSocket) {
            const handleMessage = (messageObject) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        senderID: messageObject.senderID,
                        receiverID: messageObject.receiverID,
                        text: messageObject.text,
                        image: messageObject.image,
                    },
                ]);
            };
            
            globalSocket.on('messageObject', handleMessage);
            return () => globalSocket.off('messageObject', handleMessage);
        }
    }, [globalSocket]);

    async function fetchUser(userID) {
        try {
            const response = await axios.get(`${server_url}/users/getUser/${userID}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}` },
            });
            return response.data.user;
        } catch (e) {
            console.error(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
    }

    async function fetchTabUsers() {
        try {
            const fetchedUser = await fetchUser(globalUserID);
            const connectedPlayers = await Promise.all(fetchedUser?.connectedIDs.map(fetchUser));
            setConnected(connectedPlayers);

            const receivedPlayers = await Promise.all(fetchedUser?.receivedIDs.map(fetchUser));
            setReceived(receivedPlayers);

            const sentPlayers = await Promise.all(fetchedUser?.sentIDs.map(fetchUser));
            setSent(sentPlayers);
        } catch (e) {
            console.error(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchTabUsers();
    }, [tab]);

    async function handleChatWindow() {
        try {
            const response = await axios.get(`${server_url}/message/${otherUserID}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}` },
            });
            setMessages(response.data.allMessages);
        } 
        catch (e) {
            console.log(e.message);            
            toast.error('Oops.. an error occurred', toastConfig);
        }
    }

    useEffect(() => {
        if (otherUserID) handleChatWindow();
    }, [otherUserID]);

    async function handleFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', upload_preset);

        try {
            const cloudResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                formData
            );
            const uploadedImageURL = cloudResponse.data.secure_url;
            setImageURL(uploadedImageURL);
        } catch (e) {
            toast.error('Error uploading file.', toastConfig);
        }
    }

    async function handleMessage() {
        if (!newMessage.trim() && !imageURL) return;

        try {
            const response = await axios.post(
                `${server_url}/message/new_message/${otherUserID}`,
                { newMessage, imageURL },
                { headers: { Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}` } }
            );

            if (response.data.status === 'success') {
                if (globalSocket) {
                    globalSocket.emit('messageObject', {
                        senderID: globalUserID,
                        receiverID: otherUserID,
                        text: newMessage,
                        image: imageURL,
                    });
                }
                setMessages((prev) => [
                    ...prev,
                    { senderID: globalUserID, receiverID: otherUserID, text: newMessage, image: imageURL },
                ]);
                setNewMessage('');
                setImageURL('');
            } else {
                toast.warn(response.data.message, toastConfig);
            }
        } catch (e) {
            toast.error('Oops.. an error occurred', toastConfig);
        }
    }

    return (
        <div className="bg-background min-h-screen text-white">
            <Navbar />
            <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)]">
                <div className="flex flex-col md:flex-row gap-8 h-full">
                    <ConnectionsList
                        tab={tab}
                        setTab={setTab}
                        connected={connected}
                        received={received}
                        sent={sent}
                        isLoading={isLoading}
                        setOtherUser={setOtherUser}
                        setOtherUserID={setOtherUserID}
                    />

                    <ChatWindow
                        otherUser={otherUser}
                        messages={messages}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleFileChange={handleFileChange}
                        handleSendMessage={handleMessage}
                    />
                </div>
            </div>
        </div>
    );
}
