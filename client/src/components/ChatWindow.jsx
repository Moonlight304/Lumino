import axios from 'axios';
import { CgProfile } from 'react-icons/cg';
import { FiPaperclip } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import toastConfig from '../configs/toastConfig';
import { useRecoilState } from 'recoil';
import { socketState, userIDState } from '../configs/atoms';
import handleFileChange from '../helpers/handleFileChange';

const server_url = import.meta.env.VITE_server_url;
const cloud_name = import.meta.env.VITE_cloud_name;
const upload_preset = import.meta.env.VITE_upload_preset;

export default function ChatWindow({ otherUser, otherUserID, messages, setMessages }) {
    const lastMessageRef = useRef(null);
    const [globalUserID] = useRecoilState(userIDState);


    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);


    async function handleMessage(cloud_image_url) {

        if (!newMessage.trim() && !cloud_image_url) return;

        try {
            const response = await axios.post(`${server_url}/message/new_message/${otherUserID}`,
                { newMessage, imageURL:cloud_image_url },
                { headers: { Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}` } }
            );
            const data = response.data;

            if (data.status === 'success') {
                setMessages((prev) => [
                    ...prev,
                    { senderID: globalUserID, receiverID: otherUserID, text: newMessage, image: cloud_image_url },
                ]);
                setNewMessage('');
            }
            else {
                toast.warn(data.message, toastConfig);
            }
        }
        catch (e) {
            console.log(e.message);            
            toast.error('Oops.. an error occurred', toastConfig);
        }
    }

    return (
        <div className="w-full md:w-2/3 h-full">
            <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                {otherUser ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-gray-800 p-4 flex items-center">
                            {otherUser?.profile_picture ? (
                                <img
                                    className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover mr-4"
                                    src={otherUser.profile_picture || '/placeholder.svg'}
                                    alt={otherUser.display_name}
                                />
                            ) : (
                                <CgProfile className="w-10 h-10 text-blue-500 mr-4" />
                            )}
                            <h2 className="text-xl font-semibold">{otherUser?.display_name}</h2>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-grow overflow-y-auto p-4 bg-gray-900">
                            {messages?.map((message, index) => (
                                <div
                                    key={index}
                                    className={`mb-4 ${message?.senderID === otherUser?._id
                                        ? 'chat chat-start'
                                        : 'chat chat-end'
                                        }`}
                                >
                                    <div
                                        className={`inline-block chat-bubble rounded-lg max-w-[70%] ${message?.senderID === otherUser?._id
                                            ? 'bg-gray-700 text-white'
                                            : 'bg-blue-600 text-white'
                                            } ${message?.text ? 'p-2' : 'p-1'}`}
                                    >
                                        {message?.text ? (
                                            message.text
                                        ) : (
                                            <img
                                                src={message?.image || '/placeholder.svg'}
                                                alt="Shared image"
                                                className="max-w-full h-auto rounded-lg"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* Ref to the last message */}
                            <div ref={lastMessageRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-gray-900">
                            <div className="flex justify-center items-center">
                                <input
                                    className="hidden"
                                    type="file"
                                    id="imageFile"
                                    onChange={async (event) => {
                                        const imageURL = await handleFileChange(event, 'uploads');
                                        await handleMessage(imageURL);
                                    }}
                                />
                                <label htmlFor="imageFile" className="p-3 mr-3 cursor-pointer rounded-full hover:bg-gray-600">
                                    <FiPaperclip className="scale-150" />
                                </label>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-grow bg-gray-800 text-white rounded-l-lg p-2 focus:outline-none"
                                    placeholder="Type a message..."
                                />
                                <button
                                    onClick={handleMessage}
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
