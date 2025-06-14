import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns';
import { FaHeart, FaRegHeart, FaRegComment, FaShareAlt, FaRegBookmark, FaBookmark } from 'react-icons/fa'
import { CiGlobe, CiMedicalClipboard } from "react-icons/ci";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast'
import toastConfig from '../configs/toastConfig'
import { Button } from './ui/button';
import { useRecoilState } from 'recoil';
import { userIDState } from '@/configs/atoms';
import { CgProfile } from 'react-icons/cg';
import { Clipboard, Edit, Settings, Trash } from 'lucide-react';
import EditPostDialog from './EditPostDialog';
import { Input } from '@/components/ui/input';
import fetchUser from '@/helpers/fetchUser';

const server_url = import.meta.env.VITE_server_url;

export default function PostCard({ post, setPosts }) {
    const [globalUserID] = useRecoilState(userIDState);
    const [timeAgo, setTimeAgo] = useState(null);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const [postUsername, setPostUsername] = useState(null);
    const [postUserAvatar, setPostUserAvatar] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false)

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

    async function toggleLike() {
        try {
            const response = await axios.get(`${server_url}/posts/${isLiked ? 'dislike' : 'like'}/${post?._id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success') {
                setLikeCount(data.newLikeCount);
                setIsLiked(!isLiked)
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

    async function getSavedInclude() {
        try {
            const response = await axios.get(`${server_url}/posts/checkSaved/${post?._id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success')
                setIsSaved(JSON.parse(data.message));
            else
                toast.error(data.message, toastConfig);
        }
        catch (e) {
            console.log(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
    }

    async function toggleSavePost() {
        try {
            const response = await axios.get(`${server_url}/posts/${isSaved ? 'deleteSavedPost' : 'savePost'}/${post?._id}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success') {
                toast.success(isSaved ? 'Removed from saved post' : 'Saved post', toastConfig);
                setIsSaved(!isSaved);
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

    function handleClipboard() {
        if (!navigator.clipboard) {
            console.log('Clipboard API not supported');
            toast.error('Clipboard API not supported', toastConfig);
            return;
        }

        try {
            if (!post?._id) {
                console.log('Post ID is not defined');
                toast.error('No post found', toastConfig);
                return;
            }
            const copyURL = `${window.location.origin}/post/${post?._id}`;
            navigator.clipboard.writeText(copyURL);
            console.log('Copied to clipboard');
            toast.success('Copied to clipboard!', toastConfig);
        }
        catch (e) {
            console.log(e.message);
            toast.error('Error copying to clipboard', toastConfig);
        }
    }

    async function handleDeletePost() {
        try {
            const response = await axios.get(`${server_url}/posts/delete_post/${post?._id}/${post?.userID}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                }
            });
            const data = response.data;

            if (data.status === 'success') {
                setPosts((prev) => prev.filter((prevPost) => prevPost?._id !== post?._id));
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

    useEffect(() => {

        if (post?.createdAt) {
            const date = parseISO(post.createdAt);
            const formattedTime = formatDistanceToNow(date, { addSuffix: true });
            setTimeAgo(formattedTime);
        }

        async function getUser() {
            try {
                const fetchedUser = await fetchUser(post?.userID);

                setPostUsername(fetchedUser.display_name);
                setPostUserAvatar(fetchedUser.profile_picture);
            }
            catch (e) {
                console.log(e.message);
                toast.error('Oops.. an error occurred', toastConfig);
            }
        }

        getLikeInclude();
        setLikeCount(post?.likeCount);
        getSavedInclude();
        getUser();
    }, []);



    return (
        <div className="flex flex-col justify-center items-center w-[95%] sm:w-2/3 md:w-3/4 max-w-2xl m-5 mt-5 bg-fourth rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b-[#999999] border-b-2 w-[95%]">
                <div className="flex items-center space-x-8 relative">
                    <div className="flex items-center space-x-2 relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#616161]">
                            {/* <img src={post?.user_avatar || "/placeholder.svg"} alt={post?.display_name} className="w-full h-full object-cover" /> */}
                            {postUserAvatar
                                ?
                                <img src={postUserAvatar} alt="avatar_image" className="w-full h-full rounded-full border-2 border-secondary object-cover mr-4" />
                                :
                                <CgProfile className="w-full h-full rounded-full border-2 border-secondary object-cover mr-4" />
                            }
                        </div>
                        <div>
                            <h2 className="inline-block text-lg font-semibold text-white hover:underline "> <Link to={`/user/${post?.display_name}`}>{postUsername}</Link></h2>

                            <div className='flex items-center gap-2'>
                                <p className="text-sm text-[#BDBDBD]"> {timeAgo} </p>

                                <div className='cursor-pointer'>
                                    <TooltipProvider>

                                        {post?.visibility === 'everyone'
                                            ?
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="p-2 rounded-full">
                                                        <CiGlobe className="w-5 h-5" />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className='bg-white text-black'>
                                                    <p> Visible to everyone </p>
                                                </TooltipContent>
                                            </Tooltip>
                                            :
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="p-2 rounded-full">
                                                        <GoPeople className='w-5 h-5' />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className='bg-white text-black'>
                                                    <p> Visible to Connections only </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        }

                                    </TooltipProvider>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="button" onClick={handleDeletePost}> DELETE </button>

                    {globalUserID === post?.userID &&
                        <div className='flex items-center gap-3 absolute right-5 group'>
                            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button className='bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white'>
                                        <Settings
                                            className='text-white cursor-pointer group-hover:rotate-90 transition scale-120'
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className={'bg-[#EEEEEE]'}>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDeletePost}>
                                            <Trash />
                                            Delete
                                        </DropdownMenuItem>
                                        {/* <DropdownMenuItem>
                                            <Clipboard />
                                            Copy link
                                            </DropdownMenuItem> */}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    }
                </div>
            </div>

            <div className="px-4 py-2 space-y-4 w-full">
                <p className="text-[#BDBDBD] w-full break-all whitespace-pre-wrap"> {post?.body.trim()} </p>
                <Dialog>
                    {post?.imageURL &&
                        (
                            <DialogTrigger asChild>
                                <div className="relative w-full pt-[56.25%] border-2 border-[#999999] rounded-lg cursor-pointer">
                                    <img
                                        src={post?.imageURL}
                                        alt="Post image"
                                        className="absolute inset-0 w-full h-full object-cover rounded-md"
                                    />
                                </div>
                            </DialogTrigger>
                        )
                    }
                    <DialogContent className="w-[90vw] h-[90vh] max-w-none max-h-none flex items-center justify-center bg-black/80 p-0">
                        <img
                            src={post?.imageURL}
                            alt="Post image"
                            className='max-w-full max-h-full'
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="w-[90%] px-4 py-3 border-t border-[#616161] flex justify-between items-center">
                <div className="flex space-x-4 gap-10">
                    <button
                        className='flex items-center space-x-1 text-[#BDBDBD]'
                        onClick={toggleLike}
                    >
                        {isLiked ? (
                            <FaHeart className="h-6 w-6 text-[#FF3333]" />
                        ) : (
                            <FaRegHeart className="h-6 w-6" />
                        )}
                        <span>{likeCount}</span>
                    </button>

                    <button
                        className='flex items-center space-x-1 text-[#BDBDBD]'
                        onClick={toggleSavePost}
                    >
                        {isSaved ? (
                            <FaBookmark className="h-6 w-6 text-[#FF3333]" />
                        ) : (
                            <FaRegBookmark className="h-6 w-6" />
                        )}
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                </div>
            </div>
        </div >
    )
}
