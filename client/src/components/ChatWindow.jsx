import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

import { CgProfile } from 'react-icons/cg';
import { FiPaperclip } from 'react-icons/fi';
import { FaImage } from "react-icons/fa6";

import { toast } from 'react-hot-toast';
import toastConfig from '../configs/toastConfig';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { useRecoilState } from 'recoil';

import handleFileChange from '../helpers/handleFileChange';
import { userIDState } from '../configs/atoms';
import { socketConnection } from '../configs/socketConnection';
import { useNavigate } from 'react-router-dom';
import peer from '../configs/peer';

const server_url = import.meta.env.VITE_server_url;

export default function ChatWindow({ remoteUser, setRemoteUser, remoteUserID, setRemoteUserID, messages, setMessages }) {
    const [socket, setSocket] = useState(null);
    const [globalUserID] = useRecoilState(userIDState);
    const [remoteUserIsTyping, setRemoteUserIsTyping] = useState(false);

    const lastMessageRef = useRef(null);
    const navigate = useNavigate();

    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);


    async function handleMessage(cloud_image_url) {

        if (!newMessage.trim() && !cloud_image_url) return;

        try {
            const response = await axios.post(`${server_url}/message/new_message/${remoteUserID}`,
                { newMessage, imageURL: cloud_image_url },
                { headers: { Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}` } }
            );
            const data = response.data;

            const messageObject = { senderID: globalUserID, receiverID: remoteUserID, text: newMessage, image: cloud_image_url };
            if (data.status === 'success') {
                setMessages((prev) => [
                    ...prev,
                    messageObject,
                ]);

                socket.emit('messageObject', messageObject);

                setNewMessage('');
            }
            else {
                toast.error(data.message, toastConfig);
            }
        }
        catch (e) {
            console.log(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
    }

    async function handleIncomingCall(newSocket, callerSocketID, offer) {
        console.log('Incoming call from : ', callerSocketID);
        const answer = await peer.getAnswer(offer);

        console.log('Socket:');
        console.log(newSocket);

        newSocket.emit('call-accepted', ({ callerSocketID, answer }));
        navigate(`/call/${globalUserID}`);
    }

    useEffect(() => {
        const newSocket = socketConnection(globalUserID);
        setSocket(newSocket);

        newSocket.on('messageObject', (messageObject) => {
            setMessages((prev) => [...prev, messageObject]);
        });

        newSocket.on('isTyping', (isTyping) => {
            setRemoteUserIsTyping(isTyping);
        })

        newSocket.on('incoming-call', ({ callerSocketID, offer }) => {
            handleIncomingCall(newSocket, callerSocketID, offer);
        })

        return () => {
            newSocket.disconnect();
        };
    }, [globalUserID]);

    const typingTimeout = useRef(null);

    function handleTyping(value) {
        setNewMessage(value);

        socket.emit('isTyping', true, remoteUserID);

        // Clear the previous timeout and set a new one
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socket.emit('isTyping', false, remoteUserID);
        }, 700);
    };


    return (
        <div className="w-full md:w-2/3 h-full">
            <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                {remoteUser ? (
                    <>
                        {/* Chat Header */}
                        <div className='flex items-center justify-between bg-gray-800'>
                            <div className="p-4 flex items-center">
                                {remoteUser?.profile_picture ? (
                                    <img
                                        className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover mr-4"
                                        src={remoteUser.profile_picture || '/placeholder.svg'}
                                        alt={remoteUser.display_name}
                                    />
                                ) : (
                                    <CgProfile className="w-10 h-10 text-blue-500 mr-4" />
                                )}
                                <h2 onClick={() => navigate(`/user/${remoteUser?.display_name}`)} className="text-xl font-semibold cursor-pointer">{remoteUser?.display_name}</h2>
                            </div>

                            <div>

                                {/* audio and video calling, under development
                                <button
                                    className='scale-125 p-2 mr-5'
                                    onClick={() => navigate(`/call/${remoteUserID}`)}
                                >
                                    📞
                                </button> */}

                                <button
                                    className='scale-125 p-2 mr-5'
                                    onClick={() => {
                                        setRemoteUser(null);
                                        setRemoteUserID(null);
                                    }}
                                >
                                    ❌
                                </button>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-grow overflow-y-auto p-4 bg-gray-900">
                            {messages?.map((message, index) => (
                                <div
                                    key={index}
                                    className={` ${message?.senderID !== remoteUser?._id && 'text-right'}`}
                                >
                                    <div
                                        className={`inline-block max-w-[70%] mb-4 rounded-lg  ${message?.senderID === remoteUser?._id
                                            ? 'bg-gray-700 text-white  rounded-bl-none'
                                            : 'bg-white text-black x rounded-br-none'
                                            } ${message?.text ? 'p-2' : 'p-1'}`}
                                    >
                                        {message?.text ? (
                                            <p className="whitespace-normal break-words">{message.text}</p>
                                        ) : message?.image ? (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="relative w-full border-2 border-[#999999] rounded-lg cursor-pointer">
                                                        <img
                                                            src={message?.image}
                                                            alt="Shared image"
                                                            className="max-w-full h-fit rounded-lg bg-green-400 cursor-pointer"
                                                        />
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent className="w-[90vw] h-[90vh] max-w-none max-h-none flex items-center justify-center bg-black/80 p-0">
                                                    <img
                                                        src={message?.image}
                                                        alt="Post image"
                                                        className='max-w-full max-h-full'
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        ) : (
                                            <FaImage className="w-auto h-[10rem] ps-1 pe-1" />
                                        )}

                                    </div>
                                </div>
                            ))}
                            {/* Ref to the last message */}
                            <div ref={lastMessageRef} />

                            {remoteUserIsTyping &&
                                <div className='chat chat-start chat-bubble'>
                                    <div className="flex items-center gap-1 p-3 rounded-lg bg-gray-800 text-gray-500 text-sm w-fit">
                                        <div className="flex gap-0.5">
                                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0s]"></span>
                                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                        </div>
                                    </div>
                                </div>
                            }

                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-gray-900 flex justify-center items-center w-full">

                            {/* doesnt render */}
                            <input
                                className="hidden"
                                type="file"
                                id="imageFile"
                                onChange={async (event) => {
                                    const imageURL = await handleFileChange(event, 'chats');
                                    await handleMessage(imageURL);
                                }}
                            />

                            <label
                                htmlFor="imageFile"
                                className="p-0 mr-3 cursor-pointer rounded-full hover:bg-gray-600"
                            >
                                <FiPaperclip className="scale-150" />
                            </label>

                            <div className='flex w-full'>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => handleTyping(e.target.value)}
                                    className="flex-grow bg-gray-800 text-white rounded-l-lg p-2 focus:outline-none"
                                    onKeyDown={async (e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            await handleMessage('');
                                            socket.emit('isTyping', false, globalUserID);
                                        }
                                    }}
                                    placeholder="Type a message..."
                                />

                                <button
                                    onClick={async () => await handleMessage('')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg"
                                >
                                    Send
                                </button>
                            </div>

                        </div>
                    </>
                ) : (
                    <div className="flex justify-center items-center h-full bg-gray-900">
                        <p className="text-gray-400 text-lg">Select a connection to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
