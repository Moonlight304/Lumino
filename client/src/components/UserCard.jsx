import axios from "axios";
import { CgProfile } from "react-icons/cg";
import { BsFillPersonPlusFill } from "react-icons/bs";
import { FaGamepad, FaComments, FaMicrophoneAlt } from "react-icons/fa";

import { toast } from 'react-hot-toast';
import toastConfig from "../configs/toastConfig";

import { useRecoilState } from "recoil";

import { countryCodes } from '../configs/countryCodes';
import { userIDState } from "../configs/atoms";

const server_url = import.meta.env.VITE_server_url;

export default function UserCard({ user, setUsers }) {
    const [globalUserID] = useRecoilState(userIDState);

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
    }

    return (
        <div className="bg-gray-900 border-2 border-secondary rounded-lg shadow-md w-full sm:w-[48%] lg:w-[32%] h-fit">
            <div className="p-6">
                <div className="flex items-center mb-4">
                    {user?.profile_picture ? (
                        <img
                            className="w-28 h-28 rounded-full border-2 border-secondary object-cover mr-4"
                            src={user.profile_picture}
                            alt={user.display_name}
                        />
                    ) : (
                        <CgProfile className="min-w-20 min-h-20 rounded-full border-2 border-secondary object-cover mr-4" />
                    )}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-300 dark:text-white">{user?.display_name}</h2>
                        <div className="flex items-center mt-1">
                            {user.country ? (
                                <img
                                    src={`https://flagsapi.com/${countryCodes[user?.country]}/flat/24.png`}
                                    alt={user?.country}
                                    className="mr-2"
                                />
                            ) : (
                                <span className="mr-2">🌍</span>
                            )}
                            <span className="text-lg text-gray-400 dark:text-gray-300">{user?.age} </span>
                        </div>
                    </div>
                </div>

                {user?.bio && (
                    <p className="text-gray-400 mb-4">{user?.bio}</p>
                )}

                <div className="space-y-2 mb-4">
                    {user?.platform && (
                        <div className="flex items-center text-lg text-gray-400">
                            <FaGamepad className="mr-2" />
                            <span>{user.platform}</span>
                        </div>
                    )}
                    {user?.playstyle && (
                        <div className="flex items-center text-lg text-gray-400 ">
                            {user?.playstyle === 'Casual'
                                ? <span className="mr-2"> 😎 </span>
                                : <span className="mr-2"> 🔥 </span>
                            }
                            <span>{user.playstyle}</span>
                        </div>
                    )}
                    {user?.communication_preference && (
                        <div className="flex items-center text-lg text-gray-400">
                            {user?.communication_preference === 'Voice'
                                ? <FaMicrophoneAlt className="mr-2" />
                                : <FaComments className="mr-2" />
                            }
                            <span>{user.communication_preference}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 pb-6">
                <button onClick={handleRequest} className="w-full bg-primary hover:bg-opacity-70 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center">
                    <BsFillPersonPlusFill className="mr-2" />
                    Connect
                </button>
            </div>
        </div>
    );
}



