import { CgProfile } from "react-icons/cg";
import { BsFillPersonPlusFill } from "react-icons/bs";

import { toast } from 'react-hot-toast';
import toastConfig from "../configs/toastConfig";

import { useRecoilState } from "recoil";

import { countryNameToCode } from '../configs/countryNameToCode';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { userIDState } from "../configs/atoms";
import { Link } from "react-router-dom";
import { FaGamepad, FaDesktop, FaPlaystation, FaXbox, FaAndroid, FaApple, FaHeadset, FaMicrophone, FaKeyboard, FaFire, FaUserFriends } from 'react-icons/fa';
import ButtonLoader from "@/helpers/ButtonLoader";
import { useState, useEffect } from "react";
import { API } from "@/configs/api";


export default function UserCard({ user, setUsers }) {
    const [globalUserID] = useRecoilState(userIDState);
    const [isLoading, setIsLoading] = useState(false);

    async function handleRequest() {
        setIsLoading(true);

        try {
            const response = await API(`/message/send_request/${globalUserID}/${user?._id}`, 'GET')
            const data = response.data;

            if (data.success) {
                toast.success(data.message, toastConfig);
                setUsers((prev) => prev.filter((u) => u._id !== user?._id));
            }
            else {
                toast.error(data.message, toastConfig);
            }
        }
        catch (e) {
            console.log(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
        finally {
            setIsLoading(false);
        }
    }


    const platformIcons = {
        PC: <FaDesktop className="mr-2 text-blue-500" />,
        PlayStation: <FaPlaystation className="mr-2 text-blue-600" />,
        Xbox: <FaXbox className="mr-2 text-green-500" />,
        Android: <FaAndroid className="mr-2 text-green-400" />,
        IOS: <FaApple className="mr-2 text-gray-400" />,
        Any: <FaGamepad className="mr-2 text-gray-500" />,
    };

    const playstyleIcons = {
        Casual: <FaUserFriends className="mr-2 text-yellow-400" />,
        Competitive: <FaFire className="mr-2 text-red-500" />,
        Mixed: <FaGamepad className="mr-2 text-purple-500" />,
        Any: <FaGamepad className="mr-2 text-gray-500" />,
    };

    const communicationIcons = {
        Voice: <FaMicrophone className="mr-2 text-blue-500" />,
        Text: <FaKeyboard className="mr-2 text-green-500" />,
        Both: <FaHeadset className="mr-2 text-purple-500" />,
        Any: <FaHeadset className="mr-2 text-gray-500" />,
    };

    return (
        <div className="bg-gray-900 border-2 border-red-500 rounded-lg shadow-md w-full ">
            <div className="p-6">
                <div className="flex items-center mb-4">
                    {user?.profile_picture ? (
                        <img
                            className="w-28 h-28 rounded-full border-2 border-secondary object-cover mr-4"
                            src={user.profile_picture}
                            alt={user.display_name}
                        />
                    ) : (
                        <CgProfile className="min-w-28 min-h-28 rounded-full border-2 border-secondary object-cover mr-4" />
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex min-w-0">
                            <Link to={`/user/${user?.display_name}`} className="min-w-0 w-full">
                                <h2 className="text-xl font-semibold text-gray-300 dark:text-white truncate">
                                    {user?.display_name}
                                </h2>
                            </Link>
                        </div>

                        <div className="flex items-center mt-1">
                            <TooltipProvider>
                                {user.country && countryNameToCode[user.country] ? (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="p-2 rounded-full">
                                                <img
                                                    src={`https://flagsapi.com/${countryNameToCode[user.country]}/flat/24.png`}
                                                    alt={user.country}
                                                    className="mr-2 flex-shrink-0"
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className='bg-white text-black'>
                                            <p>{user.country}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ) : (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="p-2 rounded-full">
                                                <span className="mr-2 flex-shrink-0">🌍</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className='bg-white text-black'>
                                            <p>Earth</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </TooltipProvider>

                            <span className="text-lg text-gray-400 dark:text-gray-300">{user?.age}</span>
                        </div>
                    </div>
                </div>

                {user?.bio && (
                    <p className="text-gray-400 mb-4">{user?.bio}</p>
                )}

                <div className="space-y-2 mb-4 text-gray-400 text-lg">
                    {user?.platform && platformIcons[user.platform] && (
                        <div className="flex items-center">
                            {platformIcons[user.platform]}
                            <span>{user.platform}</span>
                        </div>
                    )}
                    {user?.playstyle && playstyleIcons[user.playstyle] && (
                        <div className="flex items-center">
                            {playstyleIcons[user.playstyle]}
                            <span>{user.playstyle}</span>
                        </div>
                    )}
                    {user?.communication_preference && communicationIcons[user.communication_preference] && (
                        <div className="flex items-center">
                            {communicationIcons[user.communication_preference]}
                            <span>{user.communication_preference}</span>
                        </div>
                    )}
                </div>

            </div>
            <div className="px-6 pb-6">
                {isLoading
                    ?
                    <button className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white transition duration-300 ease-in-out w-full py-2 px-4 rounded-lg flex items-center justify-center">
                        <ButtonLoader />
                    </button>
                    :
                    <button onClick={handleRequest} className="bg-black border-2 border-red-800 text-red-500 hover:bg-red-600 hover:text-white transition duration-300 ease-in-out w-full py-2 px-4 rounded-lg flex items-center justify-center">
                        <BsFillPersonPlusFill className="mr-2" />
                        Connect
                    </button>
                }
            </div>
        </div >
    );
}



