import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaImage } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { toast } from 'react-hot-toast';
import toastConfig from '../configs/toastConfig';
import axios from 'axios';
import { Trash2 } from "lucide-react";
import handleFileChange from "@/helpers/handleFileChange";
import ButtonLoader from "@/helpers/ButtonLoader";
import { useRecoilState } from "recoil";
import { avatarURLState } from "@/configs/atoms";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CiGlobe } from "react-icons/ci";
import { GoPeople } from "react-icons/go";

const server_url = import.meta.env.VITE_server_url;

const EditPostDialog = React.memo(({ post, isOpen, setIsOpen, setPosts }) => {
    const [globalAvatarURL] = useRecoilState(avatarURLState);
    const [body, setBody] = useState(post?.body || '');
    const [imageURL, setImageURL] = useState(post?.imageURL || '');
    const [visibility, setVisibility] = useState(post?.visibility || 'everyone');
    const [isLoading, setIsLoading] = useState(false);

    async function handleEditPost() {
        if (!body || !visibility) {
            toast.error('Please fill all required fields', toastConfig);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${server_url}/posts/edit_post/${post?._id}`,
                {
                    body,
                    imageURL,
                    visibility,
                },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                    }
                }
            );

            const data = response.data;

            if (data.status === 'success') {
                setPosts(prev =>
                    prev.map(p =>
                        p._id === post._id
                            ? { ...p, body, imageURL, visibility }
                            : p
                    )
                );
                toast.success('Post updated successfully', toastConfig);
                handleClose();
            } else {
                toast.error(data.message, toastConfig);
            }
        } catch (e) {
            console.log(e.message);
            toast.error('Failed to update post', toastConfig);
        } finally {
            setIsLoading(false);
        }
    }

    const handleClose = () => {
        // Reset form state
        setBody(post?.body || '');
        setImageURL(post?.imageURL || '');
        setVisibility(post?.visibility || 'everyone');
        // Close dialog after state reset
        setIsOpen(false);

        // location.reload();
        
    };

    // Force cleanup when dialog closes
    useEffect(() => {
        if (!isOpen) {
            handleClose();
        }
    }, [isOpen, handleClose]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} >
            <DialogContent className="bg-fourth text-white overflow-y-auto max-h-[90vh] max-w-[90vw] sm:max-w-[40vw]">
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col justify-center items-center w-full space-y-4">
                    <div className="flex w-full mb-2">
                        {globalAvatarURL ? (
                            <img
                                src={globalAvatarURL}
                                alt="avatar_image"
                                className="w-16 h-16 rounded-full border-2 border-secondary object-cover mr-4"
                            />
                        ) : (
                            <CgProfile className="w-20 h-20 rounded-full object-cover mr-4" />
                        )}

                        <textarea
                            className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-1 py-1 focus:outline-none focus:border-primary"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Edit your post..."
                            rows={4}
                        />
                    </div>

                    {imageURL && (
                        <div className="relative group w-full">
                            <img
                                src={imageURL}
                                alt="post_image"
                                className="py-4 w-[97%] rounded-lg"
                            />
                            <span
                                onClick={() => setImageURL('')}
                                className="absolute right-6 top-6 hidden bg-[#000000A0] hover:bg-[#000000E0] p-2 rounded-full group-hover:block cursor-pointer"
                            >
                                <Trash2 />
                            </span>
                        </div>
                    )}

                    <div className="w-full flex justify-between px-4 border-t-2 border-[#999999] pt-2">
                        <div className="flex gap-2">
                            <input
                                type="file"
                                name="edit_post_image"
                                id="edit_post_image"
                                className="hidden"
                                onChange={async (event) => {
                                    const online_url = await handleFileChange(event, 'posts');
                                    setImageURL(online_url);
                                }}
                            />
                            <label htmlFor="edit_post_image" className="cursor-pointer">
                                <FaImage className="w-8 h-8 hover:opacity-70" />
                            </label>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        onClick={(e) => e.stopPropagation()}
                                        type="button"
                                    >
                                        {visibility === 'everyone' ? <CiGlobe /> : <GoPeople />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem 
                                            className='flex justify-around items-center gap-4'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setVisibility('everyone');
                                            }}
                                        >
                                            Everyone <CiGlobe />
                                        </DropdownMenuItem>

                                        <DropdownMenuItem 
                                            className='flex justify-around items-center gap-4'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setVisibility('connections');
                                            }}
                                        >
                                            Connections <GoPeople />
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={handleClose}
                                className="text-white hover:bg-gray-800"
                            >
                                Cancel
                            </Button>
                            
                            {isLoading ? (
                                <Button className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white flex justify-center">
                                    <ButtonLoader />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleEditPost}
                                    className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white"
                                    disabled={!body || !visibility}
                                >
                                    Update
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
});

export default EditPostDialog;