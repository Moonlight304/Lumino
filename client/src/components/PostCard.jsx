import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart, FaRegComment, FaShareAlt, FaRegBookmark, FaBookmark } from 'react-icons/fa'

import { toast } from 'react-toastify'
import toastConfig from '../configs/toastConfig'

const server_url = import.meta.env.VITE_server_url;

const PostCard = ({ post }) => {
    const [likeCount, setLikeCount] = useState(0)
    const [isLiked, setIsLiked] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    async function getLikeInclude() {
        try {
            const response = await axios.get(`${server_url}/posts/${post?._id}/checkLiked`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                    }
                }
            )
            const data = response.data;
    
            if (data.status === 'success')
                setIsLiked(JSON.parse(data.message));
            else {
                toast.error(data.message, toastConfig);
                console.log(data.message);
            }
        }
        catch (e) {
            console.log(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
    }

    async function handleLike() {
        try {
            const response = await axios.get(`${server_url}/posts/like/${post?._id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success') {
                setLikeCount(data.newLikeCount);
                setIsLiked(true)
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

    async function handleDislike() {
        try {
            const response = await axios.get(`${server_url}/posts/dislike/${post?._id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success') {
                setLikeCount(data.newLikeCount);
                setIsLiked(false)
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

    const handleSave = () => {
        setIsSaved(!isSaved)
    }

    useEffect(() => {
        getLikeInclude();
        setLikeCount(post?.likeCount)
    }, []);

    return (
        <div className="w-full max-w-md mx-auto bg-[#0A0A0A] rounded-lg shadow-lg overflow-hidden">
            <div className="p-4">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#616161]">
                        <img src={post?.user_avatar || "/placeholder.svg"} alt={post?.display_name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">{post?.display_name}</h2>
                        {/* Need to change date display */}
                        <p className="text-sm text-[#BDBDBD]">{new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
            <div className="px-4 py-2 space-y-4">
                <h3 className="text-xl font-bold text-white">{post?.title}</h3>
                <p className="text-[#BDBDBD]">{post?.body}</p>
                {post?.imageUrl && (
                    <div className="relative w-full pt-[56.25%]">
                        <img
                            src={post?.imageUrl || "/placeholder.svg"}
                            alt="Post image"
                            className="absolute inset-0 w-full h-full object-cover rounded-md"
                        />
                    </div>
                )}
            </div>
            <div className="px-4 py-3 border-t border-[#616161] flex justify-between items-center">
                <div className="flex space-x-4">
                    <button
                        className={`flex items-center space-x-1 ${isLiked ? 'text-[#FF3333]' : 'text-[#BDBDBD]'}`}
                        onClick={isLiked ? handleDislike : handleLike }
                    >
                        {isLiked ? (
                            <FaHeart className="h-6 w-6" />
                        ) : (
                            <FaRegHeart className="h-6 w-6" />
                        )}
                        <span>{likeCount}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-[#BDBDBD]">
                        <FaRegComment className="h-6 w-6" />
                        <span>Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 text-[#BDBDBD]">
                        <FaShareAlt className="h-6 w-6" />
                        <span>Share</span>
                    </button>
                </div>
                <button
                    className={`flex items-center space-x-1 ${isSaved ? 'text-[#FF3333]' : 'text-[#BDBDBD]'}`}
                    onClick={handleSave}
                >
                    {isSaved ? (
                        <FaBookmark className="h-6 w-6" />
                    ) : (
                        <FaRegBookmark className="h-6 w-6" />
                    )}
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
            </div>
        </div>
    )
}

export default PostCard
