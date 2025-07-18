import { useState } from "react";
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import toast from 'react-hot-toast';
import toastConfig from "@/configs/toastConfig";
import { Trash2 } from "lucide-react";
import ButtonLoader from "@/helpers/ButtonLoader";
import { API } from "@/configs/api";
import removeOldImage from "@/helpers/removeOldImage";

export default function NewPostCard({ setPosts, existingPost = null }) {
    const [globalDisplayName] = useRecoilState(displayNameState);
    const [globalAvatarURL] = useRecoilState(avatarURLState);
    const [body, setBody] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [oldImageURL, setOldImageURL] = useState('');
    const [visibility, setVisibility] = useState('everyone');
    const [isLoading, setIsLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    async function handleNewPost() {
        setIsLoading(true);

        try {
            if (body === "") {
                toast.error('Type something...', toastConfig);
                return;
            }

            // If a new image is selected, upload it
            let uploadedImageURL = imageURL;
            if (imageFile) {
                // Remove old image if exists
                if (oldImageURL) {
                    await removeOldImage(oldImageURL);
                }
                const form = new FormData();
                form.append('imageFile', imageFile);
                const imageURLResponse = await API('/images/upload?folder=posts', 'POST', form);
                uploadedImageURL = imageURLResponse.data.secure_url;
            }

            console.log("UPloadedImageURL : " , uploadedImageURL);
            const response = await API(`/posts/new_post`, 'POST', { body, imageURL: uploadedImageURL, visibility });
            const data = response.data;
            console.log("Data : ", data)

            if (data.status === 'success' && data.newPost && data.newPost._id) {
                toast.success('Posted', toastConfig);
                setImageURL('');
                setImageFile(null);
                setOldImageURL('');
                setBody('');
                setPosts((prevPosts) => [data.newPost, ...prevPosts]);
            } else {
                toast.error(data.message, toastConfig);
                console.log(data.message);
            }
        }
        catch (e) {
            toast.error('Oops try again', toastConfig);
            console.log(e.message);
        }
        finally {
            setIsLoading(false);
        }
    }

    async function handleImageChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (imageURL) {
            await removeOldImage(imageURL);
        }
        setImageFile(file);
        setImageURL(URL.createObjectURL(file));
        setOldImageURL(imageURL);
    }

    async function handleRemoveImage() {
        if (imageURL) {
            await removeOldImage(imageURL);
        }
        setImageURL('');
        setImageFile(null);
        setOldImageURL('');
    }

    return (
        <div className="flex flex-col justify-center items-center p-2 w-[95%] sm:w-3/4 md:w-full max-w-3xl m-5 mt-5 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            <div className="flex mb-2">
                {globalAvatarURL !== ''
                    ?
                    <img
                        src={globalAvatarURL}
                        alt="avatar_image"
                        className="w-16 h-16 rounded-full border-2 border-secondary object-cover mr-4"
                    />
                    :
                    <CgProfile
                        className="w-20 h-20 rounded-full object-cover mr-4"
                    />
                }

                <textarea
                    className="w-full bg-[#1A1A1A] text-white border border-gray-700 rounded px-1 py-1 focus:outline-none focus:border-primary"
                    name="body"
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    cols={100}
                    placeholder={`Share what\'s on your mind, ${globalDisplayName}...`}
                    required
                ></textarea>
            </div>

            {imageURL &&
                <div className="relative group">
                    <img
                        src={imageFile ? URL.createObjectURL(imageFile) : imageURL}
                        alt="posted_image"
                        className="py-4 w-[97%] rounded-lg"
                    />

                    <span
                        onClick={handleRemoveImage}
                        className="absolute right-6 top-6 bg-[#000000A0] hover:bg-[#000000E0] p-2 rounded-full group-hover:block cursor-pointer"
                    > <Trash2 /> </span>
                </div>
            }

            <div className="w-[95%] flex justify-between px-4 border-t-2 border-[#999999] pt-2">
                <input
                    type="file"
                    name='feed_image'
                    id='feed_image'
                    className="hidden"
                    onChange={handleImageChange}
                />
                <label htmlFor="feed_image" className="cursor-pointer">
                    <FaImage className="w-8 h-8 hover:opacity-70" />
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

                    {isLoading
                        ?
                        <Button
                            className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white flex justify-center"
                        >
                            <ButtonLoader />
                        </Button>
                        :
                        <Button
                            onClick={handleNewPost}
                            className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white"
                            disabled={isLoading}
                        >
                            Post
                        </Button>
                    }
                </div>
            </div>
        </div>
    );
}