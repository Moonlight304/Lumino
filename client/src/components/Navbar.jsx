import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { avatarURLState, displayNameState, userIDState } from "../configs/atoms";
import { CgProfile } from "react-icons/cg";
import { Bell, Compass, Gamepad, LogOut, Menu, Newspaper } from "lucide-react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import toastConfig from "@/configs/toastConfig";
import { API } from "@/configs/api";




export default function Navbar() {

    const [globalUserID, setGlobalUserID] = useRecoilState(userIDState);
    const [globalDisplayName] = useRecoilState(displayNameState);
    const [globalAvatarURL] = useRecoilState(avatarURLState);

    const navigate = useNavigate();

    async function handleLogout() {
        try {
            
            const response = await API('/auth/logout', 'GET');

            if (response.status === 200) {
                localStorage.removeItem('access_token');
                setGlobalUserID(null);
    
                navigate('/');
                toast.success('Logged out', toastConfig)
            }
            else {
                toast.error('Error');
            }
        }
        catch (e) {
            console.log(e.message);
            toast.error('Oops.. an error occurred', toastConfig);
        }
    }

    return (
        <header className="container mx-auto px-10 py-1 flex justify-between items-center  border-b-2 border-[#999999]">
            <div className="text-2xl font-bold text-primary">Lumino</div>

            <div className="flex gap-4 max-lg:hidden">
                <nav className="flex justify-center items-center gap-5">
                    <Link to={'/discover'} className="p-2 rounded-lg hover:bg-primary transition duration-300 flex gap-4"> <Compass /> Discover </Link>
                    <Link to={'/feed'} className="p-2 rounded-lg hover:bg-primary transition duration-300 flex gap-4"> <Newspaper /> Feed </Link>
                    <Link to={'/connections'} className="p-2 rounded-lg hover:bg-primary transition duration-300 flex gap-4"> <Gamepad /> Connections </Link>
                    <Link to={'/notifications'} className="p-2 rounded-lg hover:bg-primary transition duration-300 flex gap-4"> <Bell /> Notifications </Link>

                    <Button
                        onClick={() => handleLogout()}
                        className="p-2 bg-transparent w-full scale-130 rounded-lg hover:bg-primary transition duration-300 flex gap-4"
                    > <LogOut /> Log Out </Button>


                </nav>

                <Link to={`/user/${globalDisplayName}`} className="p-2 rounded-lg hover:bg-primary transition duration-300 flex items-center px-3">
                    {globalAvatarURL
                        ?
                        <img src={globalAvatarURL} alt="avatar_image" className="w-11 h-11 rounded-full border-2 border-secondary object-cover mr-4" />
                        :
                        <CgProfile className="w-11 h-11 rounded-full border-2 border-secondary object-cover mr-4" />
                    }
                    <h1> {globalDisplayName} </h1>
                </Link>
            </div>

            <Sheet>
                <SheetTrigger className="text-white rounded-md lg:hidden">
                    <Menu size={28} />
                </SheetTrigger>

                <SheetContent className="text-white flex flex-col pt-10">
                    <div className="text-3xl font-bold text-primary mb-5">Lumino</div>

                    <SheetClose asChild>
                        <Link to="/discover" className="p-2 rounded-lg hover:bg-primary transition duration-300 flex gap-4">
                            <Compass /> Discover
                        </Link>
                    </SheetClose>

                    <SheetClose asChild>
                        <Link to="/feed" className="p-2 rounded-lg hover:bg-primary transition duration-300 flex gap-4">
                            <Newspaper /> Feed
                        </Link>
                    </SheetClose>

                    <SheetClose asChild>
                        <Link to="/connections" className="p-2 rounded-lg hover:bg-primary transition duration-300 flex gap-4">
                            <Gamepad /> Connections
                        </Link>
                    </SheetClose>

                    <SheetClose asChild>
                        <Link to="/notifications" className="p-2 rounded-lg hover:bg-primary transition duration-300 flex gap-4">
                            <Bell /> Notifications
                        </Link>
                    </SheetClose>

                    <div className="mt-5 space-y-2">
                        <SheetClose asChild>
                            <Link to={`/user/${globalDisplayName}`} className="px-3 py-1 rounded-lg hover:bg-primary transition duration-300 flex items-center">
                                {globalAvatarURL ? (
                                    <img src={globalAvatarURL} alt="avatar_image" className="w-11 h-11 rounded-full border-2 border-secondary object-cover mr-4" />
                                ) : (
                                    <CgProfile className="w-11 h-11 rounded-full border-2 border-secondary object-cover mr-4" />
                                )}
                                <h1> {globalDisplayName} </h1>
                            </Link>
                        </SheetClose>

                        <SheetClose asChild>
                            <Button
                                onClick={handleLogout}
                                className="p-2 bg-transparent w-full scale-130 rounded-lg hover:bg-primary transition duration-300 flex gap-4"
                            >
                                <LogOut /> Log Out
                            </Button>
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>



        </header>
    );
}
