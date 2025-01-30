import axios from "axios";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { displayNameState, avatarURLState } from "@/configs/atoms";
import { FaImage } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { Button } from "@/components/ui/button";

import handleFileChange from "@/helpers/handleFileChange";
import { toast } from "react-toastify";
import toastConfig from "@/configs/toastConfig";

const server_url = import.meta.env.VITE_server_url;

export default function NewPostCard({ setPosts }) {
    const [globalDisplayName] = useRecoilState(displayNameState);
    const [globalAvatarURL] = useRecoilState(avatarURLState);
    const [body, setBody] = useState('');
    const [imageURL, setImageURL] = useState('');

    async function handleNewPost() {
        try {
            const response = await axios.post(`${server_url}/posts/new_post`,
                { body, imageURL },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                    }
                }
            )
            const data = response.data;

            if (data.status === 'success') {
                toast.success('Posted', toastConfig);

                setImageURL('');
                setBody('');

                setPosts((prev) => [data.newPost, ...prev]);
            }
            else {
                toast.error(data.message, toastConfig);
            }
        }
        catch (e) {
            toast.error('Oops try again', toastConfig);
        }
    }

    return (
        <div className="flex flex-col justify-center items-center p-2 w-[95%] sm:w-2/3 md:w-3/4 max-w-xl m-5 mt-5 bg-fourth rounded-lg shadow-lg overflow-hidden">
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
                        className="w-16 h-16 rounded-full border-2 border-secondary object-cover mr-4"
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
                <div className="relative">
                    <img
                        src={imageURL}
                        alt="posted_image"
                        className="py-4 w-[97%] rounded-lg"
                    />

                    <span
                        onClick={() => setImageURL('')}
                        className="absolute right-5 top-5"
                    > ❌ </span>
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
                        onChange={(e) => handleFileChange(e, 'feed')}
                    />
                </label>

                <div onClick={handleNewPost}>
                    <Button> Post </Button>
                </div>
            </div>
        </div>
    );
}