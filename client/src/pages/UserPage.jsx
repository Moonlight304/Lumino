import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Calendar, Briefcase, Settings, LogOut } from 'lucide-react';
import fetchUser from '@/helpers/fetchUser';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import toastConfig from '@/configs/toastConfig';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useRecoilState } from 'recoil';
import { userIDState } from '@/configs/atoms';
import { FaDiscord, FaSteam } from 'react-icons/fa';
import { BsFillPersonPlusFill } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';
import Loading from '@/components/Loading';

const server_url = import.meta.env.VITE_server_url;

export default function UserPage() {
    const { display_name } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [globalUserID, setGlobalUserID] = useRecoilState(userIDState);

    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('');

    const [displayedPosts, setDisplayedPosts] = useState([]);
    const navigate = useNavigate();

    async function handleRequest() {
        try {
            const response = await axios.get(`${server_url}/message/send_request/${globalUserID}/${user?._id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            })
            const data = response.data;

            if (data.success) {
                toast.success(data.message, toastConfig);
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

    async function handleAccept() {
        try {
            const response = await axios.get(`${server_url}/message/accept_request/${globalUserID}/${user?._id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success') {
                toast.success(data.message, toastConfig);
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

    async function handleRemoveConnection() {
        try {
            const response = await axios.get(`${server_url}/message/remove_connection/${globalUserID}/${user?._id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success') {
                setConnectionStatus('Nothing');
                toast.success(data.message, toastConfig);
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

    useEffect(() => {
        async function getUser() {
            try {
                const fetchedUser = await fetchUser(display_name, true);
                setUser(fetchedUser);

                const userPostsData = fetchedUser.posts.length > 0
                    ? await Promise.all(fetchedUser.posts.map(postID =>
                        axios.get(`${server_url}/posts/${postID}`, {
                            headers: { Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}` },
                        }).then(res => res.data.post)
                    ))
                    : [];

                // Fetch saved posts
                const savedPostsData = fetchedUser.savedPosts.length > 0
                    ? await Promise.all(fetchedUser.savedPosts.map(postID =>
                        axios.get(`${server_url}/posts/${postID}`, {
                            headers: { Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}` },
                        }).then(res => res.data.post)
                    ))
                    : [];

                setPosts(userPostsData);
                setSavedPosts(savedPostsData);

                setDisplayedPosts(userPostsData);

                if (fetchedUser._id !== globalUserID) {
                    const connectionCheckResponse = await axios.get(`${server_url}/message/check/${fetchedUser._id}`, {
                        headers: {
                            Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                        }
                    });
                    const connectionData = connectionCheckResponse.data;
                    console.log(connectionData);

                    setConnectionStatus(connectionData.message);
                }
            }
            catch (e) {
                console.error(e.message);
                toast.error('Oops.. an error occurred', toastConfig);
            }
            finally {
                setIsLoading(false);
            }
        }

        getUser();
    }, [display_name]);

    useEffect(() => {
        if (!globalUserID) {
            navigate('/');
            toast.error('Cannot access page');
        }
    }, []);

    if (isLoading) return <Loading message={'Getting latest user info...'} />
    if (!user) return <p className="text-white text-center">User not found.</p>;

    return (
        <>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Card className="w-full bg-gray-900 border-red-600">
                    <CardHeader className="flex flex-row max-md:flex-col items-center justify-center gap-8">
                        <Avatar className="h-40 w-40 border-4 border-red-500">
                            {
                                user?.profile_picture
                                    ?
                                    <AvatarImage
                                        src={user.profile_picture || <CgProfile />}
                                        alt={`${user.display_name}'s profile`}
                                        className={'object-cover'}
                                    />
                                    :
                                    <CgProfile className="w-full h-full text-white rounded-full object-cover" />
                            }
                        </Avatar>

                        <div className="text-center flex space-x-5">
                            <div className='space-y-5'>
                                <CardTitle className="text-4xl font-bold text-white">
                                    {user.display_name}
                                </CardTitle>
                                <CardTitle className="text-xl font-bold text-white">
                                    {user.connectedIDs.length} Connections
                                </CardTitle>

                                {globalUserID && user?._id && globalUserID !== user._id &&
                                    (
                                        <div className='flex justify-center'>

                                            {
                                                connectionStatus === 'Connected'
                                                    ?
                                                    <button
                                                        onClick={handleRemoveConnection}
                                                        className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white transition duration-300 ease-in-out py-2 px-4 rounded-lg flex items-center justify-center">
                                                        Remove Connection
                                                    </button>
                                                    :
                                                    connectionStatus === 'Sent'
                                                        ?
                                                        <button className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white transition duration-300 ease-in-out py-2 px-4 rounded-lg flex items-center justify-center">
                                                            Request Sent
                                                        </button>
                                                        :
                                                        connectionStatus === 'Accept'
                                                            ?
                                                            <button onClick={handleAccept} className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white transition duration-300 ease-in-out py-2 px-4 rounded-lg flex items-center justify-center">
                                                                Accept
                                                            </button>
                                                            :
                                                            <button onClick={handleRequest} className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white transition duration-300 ease-in-out py-2 px-4 rounded-lg flex items-center justify-center">
                                                                <BsFillPersonPlusFill className="mr-2" />
                                                                Connect
                                                            </button>
                                            }
                                        </div>
                                    )
                                }
                            </div>

                            {globalUserID === user._id &&
                                <Settings
                                    onClick={() => navigate('/edit_profile')}
                                    className='text-white mt-1 cursor-pointer hover:rotate-90 transition scale-150'
                                />
                            }
                        </div>
                    </CardHeader>


                    <CardContent className="mt-6 space-y-6">
                        {user.bio && (
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-white flex items-center mb-2">
                                    <User className="mr-2 h-5 w-5 text-red-500" /> About Me
                                </h3>
                                <p className="text-gray-300">{user.bio}</p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                            {user.country && (
                                <div className="flex items-center bg-gray-800 p-3 rounded-lg">
                                    <MapPin className="mr-3 h-6 w-6 text-red-500" />
                                    <div>
                                        <h4 className="text-sm text-gray-400">Country</h4>
                                        <p className="text-white">{user.country}</p>
                                    </div>
                                </div>
                            )}

                            {user.age > 0 && (
                                <div className="flex items-center bg-gray-800 p-3 rounded-lg">
                                    <Calendar className="mr-3 h-6 w-6 text-red-500" />
                                    <div>
                                        <h4 className="text-sm text-gray-400">Age</h4>
                                        <p className="text-white">{user.age}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {user.discord_username && (
                                <div className="flex items-center bg-gray-800 p-3 rounded-lg">
                                    <FaDiscord className="mr-3 h-6 w-6 text-red-500" />

                                    <div>
                                        <h4 className="text-sm text-gray-400">Discord</h4>
                                        <p className="text-white">{user.discord_username}</p>
                                    </div>
                                </div>
                            )}

                            {user.steam_id && (
                                <div className="flex items-center bg-gray-800 p-3 rounded-lg">
                                    <FaSteam className="mr-3 h-6 w-6 text-red-500" />

                                    <div>
                                        <h4 className="text-sm text-gray-400">Steam ID</h4>
                                        <p className="text-white">{user.steam_id}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {globalUserID === user._id && (
                    <div className="flex flex-col justify-center items-center mt-5 w-full">
                        {/* Buttons */}
                        <div className="flex gap-4">
                            <Button
                                className={`border-2 px-4 py-2 rounded-lg transition duration-300 ease-in-out ${displayedPosts === posts
                                    ? "bg-red-600 text-white border-red-800"
                                    : "bg-black text-red-500 border-red-800 hover:bg-red-600 hover:text-white"
                                    }`}
                                onClick={() => setDisplayedPosts(posts)}
                            >
                                My Posts
                            </Button>
                            <Button
                                className={`border-2 px-4 py-2 rounded-lg transition duration-300 ease-in-out ${displayedPosts === savedPosts
                                    ? "bg-red-600 text-white border-red-800"
                                    : "bg-black text-red-500 border-red-800 hover:bg-red-600 hover:text-white"
                                    }`}
                                onClick={() => setDisplayedPosts(savedPosts)}
                            >
                                Saved Posts
                            </Button>
                        </div>

                        {/* Posts Section */}
                        <div className="w-full mt-5 flex flex-col justify-center items-center">
                            {displayedPosts.length > 0 ? (
                                displayedPosts.map((post, index) => (
                                    <PostCard key={index} post={post} setPosts={setDisplayedPosts} />
                                ))
                            ) : (
                                <div className='flex justify-center items-center'>
                                    <h1 className="text-gray-400 text-lg mt-5 italic">No posts available</h1>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};