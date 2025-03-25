import axios from 'axios';
import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import toastConfig from '../configs/toastConfig';

import Navbar from "../components/Navbar";
import ConnectionsList from "../components/ConnectionsList";
import ChatWindow from "../components/ChatWindow";
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userIDState } from '../configs/atoms';

const server_url = import.meta.env.VITE_server_url;

export default function Connections() {
    const [globalUserID] = useRecoilState(userIDState);
    const [remoteUserID, setRemoteUserID] = useState(null);
    const [remoteUser, setRemoteUser] = useState(null);
    
    const [messages, setMessages] = useState([]);

    async function handleChatWindow() {
        try {
            const response = await axios.get(`${server_url}/message/${remoteUserID}`, {
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
        if (remoteUserID) handleChatWindow();
    }, [remoteUserID]);

    const navigate = useNavigate();
    useEffect(() => {
        if (!globalUserID) {
            navigate('/');
        }
    }, []);

    return (
        <div className="bg-background min-h-fit text-white">
            <div className="container mx-auto -mt-2 px-4 py-8 h-[calc(100vh-64px)]">
                <div className="flex flex-col md:flex-row gap-8 h-full">

                    <ConnectionsList
                        setRemoteUser={setRemoteUser}
                        setRemoteUserID={setRemoteUserID}
                    />

                    <ChatWindow
                        remoteUser={remoteUser}
                        setRemoteUser={setRemoteUser}
                        setRemoteUserID={setRemoteUserID}
                        remoteUserID={remoteUserID}
                        messages={messages}
                        setMessages={setMessages}
                    />
                    
                </div>
            </div>
        </div>
    );
}
