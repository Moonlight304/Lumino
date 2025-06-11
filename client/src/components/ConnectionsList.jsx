import axios from 'axios';
import { useEffect, useState } from 'react';
import { CgProfile } from 'react-icons/cg';
import { useRecoilState } from 'recoil';

import { toast } from 'react-hot-toast';
import toastConfig from '../configs/toastConfig';

import { userIDState } from '../configs/atoms';
import fetchUser from '../helpers/fetchUser';
import Loading from './Loading';

const server_url = import.meta.env.VITE_server_url;

export default function ConnectionsList({ setRemoteUser, setRemoteUserID }) {
    const [globalUserID] = useRecoilState(userIDState);
    const [isLoading, setIsLoading] = useState(true);
    const [tab, setTab] = useState('connected');
    const [connected, setConnected] = useState([]);
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);

    useEffect(() => {
        fetchTabUsers();
    }, [tab]);


    async function handleUserSelect(user) {
        setRemoteUser(user);
        setRemoteUserID(user?._id);
    };

    async function fetchTabUsers() {
        try {
            const fetchedUser = await fetchUser(globalUserID);

            // connected players
            const connectedPlayers = await Promise.all(fetchedUser?.connectedIDs.map(async (id) => {
                try {
                    return await fetchUser(id);
                }
                catch (error) {
                    console.error(`Error fetching user ${id}:`, error);
                    return null;
                }
            }));
            setConnected(connectedPlayers);

            // players from which connection request is received
            const receivedPlayers = await Promise.all(fetchedUser?.receivedIDs.map(async (id) => {
                try {
                    return await fetchUser(id);
                }
                catch (error) {
                    console.error(`Error fetching user ${id}:`, error);
                    return null;
                }
            }));
            setReceived(receivedPlayers);

            // players to which connection request was sent
            const sentPlayers = await Promise.all(fetchedUser?.sentIDs.map(async (id) => {
                try {
                    return await fetchUser(id);
                }
                catch (error) {
                    console.error(`Error fetching user ${id}:`, error);
                    return null;
                }
            }));
            setSent(sentPlayers);
        }
        catch (e) {
            console.error(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
        finally {
            setIsLoading(false);
        }
    }

    async function handleAccept(senderUserID) {
        try {
            const response = await axios.get(`${server_url}/message/accept_request/${globalUserID}/${senderUserID}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success') {
                toast.success(data.message, toastConfig);
                fetchTabUsers();
            }
            else {
                toast.error(data.message, toastConfig);
            }
        }
        catch (e) {
            console.error(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
    }

    async function handleCancel(senderUserID, receiverUserID) {
        try {
            const response = await axios.get(`${server_url}/message/cancel_request/${receiverUserID}/${senderUserID}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success') {
                toast.success(data.message, toastConfig);
                fetchTabUsers();
            }
            else {
                toast.error(data.message, toastConfig);
            }
        }
        catch (e) {
            console.error(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
    }


    function renderUserList(users, emptyMessage) {
        if (users.length === 0) {
            return <div className="text-gray-400 p-4">{emptyMessage}</div>;
        }

        console.log(users);

        return users.map((user) => (
            <div
                key={user?._id}
                className="flex items-center justify-between cursor-pointer p-4 hover:bg-gray-700 transition duration-150 ease-in-out"
                onClick={() => {
                    if (tab === 'connected')
                        return handleUserSelect(user)
                }}
            >
                <div className="flex items-center">
                    {user?.profile_picture ? (
                        <img
                            className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover mr-4"
                            src={user.profile_picture || '/placeholder.svg'}
                            alt={user.display_name}
                        />
                    ) : (
                        <CgProfile className="w-12 h-12 text-blue-500 mr-4" />
                    )}
                    <h2 className="text-lg font-semibold">{user?.display_name}</h2>
                </div>

                {tab !== 'connected' &&
                    <div className='flex items-center justify-center gap-2'>
                        {tab === 'received' &&
                            <button
                                className='bg-green-600 p-2 rounded-lg'
                                onClick={() => handleAccept(user?._id)}
                            > Accept </button>
                        }

                        <button
                            className='bg-red-600 p-2 rounded-lg'
                            onClick={() => {
                                if (tab === 'received')
                                    return handleCancel(user?._id, globalUserID);
                                else
                                    return handleCancel(globalUserID, user?._id);
                            }}
                        > Cancel </button>
                    </div>
                }
            </div>
        ));
    };

    return (
        <div className="w-full md:w-1/3 h-full">
            <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                {/* Tab Navigation */}
                <div className="flex justify-around bg-gray-800 p-2">
                    <button
                        className={`px-4 py-2 rounded-md ${tab === 'connected' ? 'bg-primary' : 'hover:bg-gray-600'
                            }`}
                        onClick={() => setTab('connected')}
                    >
                        Connected ({connected?.length})
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${tab === 'received' ? 'bg-primary' : 'hover:bg-gray-600'
                            }`}
                        onClick={() => setTab('received')}
                    >
                        Received ({received?.length})
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${tab === 'sent' ? 'bg-primary' : 'hover:bg-gray-600'
                            }`}
                        onClick={() => setTab('sent')}
                    >
                        Sent ({sent?.length})
                    </button>
                </div>

                {/* User Lists */}
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? (
                        <Loading message={'Getting your connections...'} />
                    ) : (
                        <>
                            {tab === 'connected' &&
                                renderUserList(connected, 'No connected players found.')}
                            {tab === 'received' &&
                                renderUserList(received, 'No received requests found.')}
                            {tab === 'sent' &&
                                renderUserList(sent, 'No sent requests found.')}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
