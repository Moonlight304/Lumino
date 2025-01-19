import axios from 'axios';
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import toastConfig from '../configs/toastConfig';

import Navbar from "../components/Navbar";
import ConnectionsList from "../components/ConnectionsList";
import ChatWindow from "../components/ChatWindow";

const server_url = import.meta.env.VITE_server_url;

export default function Connections() {

    const [otherUserID, setOtherUserID] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    
    const [messages, setMessages] = useState([]);

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



    return (
        <div className="bg-background min-h-screen text-white">
            <Navbar />

            <div className="container mx-auto px-4 py-8 h-[calc(100vh-64px)]">
                <div className="flex flex-col md:flex-row gap-8 h-full">

                    <ConnectionsList
                        setOtherUser={setOtherUser}
                        setOtherUserID={setOtherUserID}
                    />

                    <ChatWindow
                        otherUser={otherUser}
                        setOtherUser={setOtherUser}
                        setOtherUserID={setOtherUserID}
                        otherUserID={otherUserID}
                        messages={messages}
                        setMessages={setMessages}
                    />
                    
                </div>
            </div>
        </div>
    );
}
