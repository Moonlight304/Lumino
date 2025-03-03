import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns';
import { FaHeart, FaRegHeart, FaRegComment, FaShareAlt, FaRegBookmark, FaBookmark } from 'react-icons/fa'
import { CiGlobe } from "react-icons/ci";
import { GoPeople } from "react-icons/go";
import { FaImage } from "react-icons/fa6";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'
import toastConfig from '../configs/toastConfig'
import { Button } from './ui/button';
import { useRecoilState } from 'recoil';
import { userIDState } from '@/configs/atoms';
import { CgProfile } from 'react-icons/cg';

const server_url = import.meta.env.VITE_server_url;

export default function PostCard({ post }) {
    const [globalUserID] = useRecoilState(userIDState);
    const [timeAgo, setTimeAgo] = useState(null);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

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

    async function handleDeletePost() {
        try {
            const response = await axios.get(`${server_url}/posts/delete_post/${post?._id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success') {
                toast.success(data.message, toastConfig);
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

    useEffect(() => {

        if (post?.createdAt) {
            const date = parseISO(post.createdAt);
            const formattedTime = formatDistanceToNow(date, { addSuffix: true });
            setTimeAgo(formattedTime);
        }

        getLikeInclude();
        setLikeCount(post?.likeCount)
    }, []);



    return (
        <div className="flex flex-col justify-center items-center w-[95%] sm:w-2/3 md:w-3/4 max-w-xl m-5 mt-5 bg-fourth rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b-[#999999] border-b-2 w-[95%]">
                <div className="flex items-center space-x-4 relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#616161]">
                        {/* <img src={post?.user_avatar || "/placeholder.svg"} alt={post?.display_name} className="w-full h-full object-cover" /> */}
                        {post?.user_avatar
                            ?
                            <img src={post?.user_avatar} alt="avatar_image" className="w-full h-full rounded-full border-2 border-secondary object-cover mr-4" />
                            :
                            <CgProfile className="w-full h-full rounded-full border-2 border-secondary object-cover mr-4" />
                        }
                    </div>
                    <div>
                        <h2 className="inline-block text-lg font-semibold text-white hover:underline "> <Link to={`/user/${post?.userID}`}>{post?.display_name}</Link></h2>

                        <div className='flex items-center gap-2'>
                            <p className="text-sm text-[#BDBDBD]"> {timeAgo} </p>

                            <div className='cursor-pointer'>
                                {post?.visibility === 'everyone'
                                    ?
                                    <CiGlobe className='w-5 h-5' />
                                    :
                                    <GoPeople className='w-5 h-5' />
                                }
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center gap-3 absolute right-5 '>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline"> ⚙️ </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup>
                                    {globalUserID === post?.userID &&
                                        <>
                                            <DropdownMenuItem>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleDeletePost}>
                                                Delete
                                            </DropdownMenuItem>
                                        </>
                                    }
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                </div>
            </div>
            <div className="px-4 py-2 space-y-4 w-full">
                <p className="text-[#BDBDBD] w-full break-all whitespace-pre-wrap"> {post?.body.trim()} </p>
                {post?.imageURL &&
                    (
                        <div className="relative w-full pt-[56.25%] border-2 border-[#999999] rounded-lg">
                            <img
                                src={post?.imageURL}
                                alt="Post image"
                                className="absolute inset-0 w-full h-full object-cover rounded-md"
                            />
                        </div>
                    )

                }
            </div>
            <div className="w-[90%] px-4 py-3 border-t border-[#616161] flex justify-between items-center">
                <div className="flex space-x-4 gap-4">
                    <button
                        className={`flex items-center space-x-1 ${isLiked ? 'text-[#FF3333]' : 'text-[#BDBDBD]'}`}
                        onClick={isLiked ? handleDislike : handleLike}
                    >
                        {isLiked ? (
                            <FaHeart className="h-6 w-6" />
                        ) : (
                            <FaRegHeart className="h-6 w-6" />
                        )}
                        <span>{likeCount}</span>
                    </button>

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
                    
                    {/* <button className="flex items-center space-x-1 text-[#BDBDBD]">
                        <FaRegComment className="h-6 w-6" />
                        <span>Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 text-[#BDBDBD]">
                        <FaShareAlt className="h-6 w-6" />
                        <span>Share</span>
                    </button> */}
                </div>
            </div>
        </div >
    )
}
