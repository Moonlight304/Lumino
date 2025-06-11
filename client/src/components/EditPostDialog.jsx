import axios from "axios";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { displayNameState, avatarURLState } from "@/configs/atoms";
import { FaImage } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { CiGlobe } from "react-icons/ci";
import { GoPeople } from "react-icons/go";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea"


import handleFileChange from "@/helpers/handleFileChange";
import { toast } from 'react-hot-toast';
import toastConfig from "@/configs/toastConfig";
import { Trash2 } from "lucide-react";

const server_url = import.meta.env.VITE_server_url;

export default function EditPostDialog({ existingPost }) {
    const [globalDisplayName] = useRecoilState(displayNameState);
    const [globalAvatarURL] = useRecoilState(avatarURLState);

    const [body, setBody] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [visibility, setVisibility] = useState('');

    useEffect(() => {
        setBody(existingPost.body);
        setImageURL(existingPost.imageURL);
        setVisibility(existingPost.visibility);
    }, [existingPost]);

    async function handleEditPost() {
        try {
            console.log("HELO")
        }
        catch (e) {
            toast.error('Oops try again', toastConfig);
            console.log(e.message);
        }
    }

    return (
        <div className="text-white">
            <textarea
                className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-1 py-1 focus:outline-none focus:border-primary"
                // name="body"
                // id="body"
                // value={body}
                // onChange={(e) => setBody(e.target.value)}
                // cols={100}
                // required
                onClick={(e) => {
                    console.log("HELLO BUTTOn")
                    e.target.focus();
                }}
            ></textarea>


            {imageURL &&
                <div className="relative group">
                    <img
                        src={imageURL}
                        alt="posted_image"
                        className="py-4 w-[97%] rounded-lg"
                    />

                    <span
                        onClick={() => setImageURL('')}
                        className="absolute right-6 top-6 hidden bg-[#000000A0] hover:bg-[#000000E0] p-2 rounded-full group-hover:block cursor-pointer"
                    > <Trash2 /> </span>
                </div>

            }

            <div className="w-[95%] flex justify-between px-4 border-t-2 border-[#999999] pt-2">
                <input
                    type="file"
                    name='feed_image'
                    id='feed_image'
                    className="hidden w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-1 py-1 focus:outline-none focus:border-primary"
                    onChange={async (event) => {
                        const online_url = await handleFileChange(event, 'avatars');
                        setImageURL(online_url);
                    }}
                />
                <label htmlFor="feed_image" className="cursor-pointer">
                    <FaImage
                        className="w-8 h-8 hover:opacity-70"
                    />
                </label>

                <div className="flex gap-2">
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    {visibility === 'everyone'
                                        ?
                                        <CiGlobe />
                                        :
                                        <GoPeople />
                                    }
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent >
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className='flex justify-around items-center gap-4'
                                        onClick={() => setVisibility('everyone')}
                                    >
                                        Everyone <CiGlobe />
                                    </DropdownMenuItem>

                                    <DropdownMenuItem className='flex justify-around items-center gap-4'
                                        onClick={() => setVisibility('connections')}
                                    >
                                        Connections <GoPeople />
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div onClick={handleEditPost}>
                        <Button className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white"> Save </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}