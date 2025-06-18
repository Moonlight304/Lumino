import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';
import toastConfig from '../configs/toastConfig';

import ConnectionsList from "../components/ConnectionsList";
import ChatWindow from "../components/ChatWindow";
import { API } from '@/configs/api';

export default function Connections() {
    const [remoteUserID, setRemoteUserID] = useState(null);
    const [remoteUser, setRemoteUser] = useState(null);
    
    const [messages, setMessages] = useState([]);

    async function handleChatWindow() {
        try {
            const response = await API(`/message/${remoteUserID}`, 'GET');
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
