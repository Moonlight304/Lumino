import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { avatarURLState, displayNameState, userIDState } from "../configs/atoms";
import { CgProfile } from "react-icons/cg";

export default function Navbar() {
    const [globalUserID, setGlobalUserID] = useRecoilState(userIDState);
    const [globalDisplayName] = useRecoilState(displayNameState);
    const [globalAvatarURL] = useRecoilState(avatarURLState);    

    const navigate = useNavigate();   

    return (
        <header className="container mx-auto px-10 py-1 flex justify-between items-center border-b-2 border-[#999999]">
            <div className="text-2xl font-bold text-primary">Lumino</div>

            <button onClick={() => {
                sessionStorage.removeItem('jwt_token');
                setGlobalUserID(null);

                navigate('/auth');
            }}> Logout </button>

            <nav className="hidden md:block">
                <ul className="flex justify-center items-center space-x-6">
                    <li> <Link to={'/notifications'} className="p-2 rounded-lg hover:bg-primary transition duration-300"> Notifications </Link> </li>
                    <li> <Link to={'/feed'} className="p-2 rounded-lg hover:bg-primary transition duration-300"> Feed </Link> </li>
                    <li> <Link to={'/discover'} className="p-2 rounded-lg hover:bg-primary transition duration-300"> Discover </Link> </li>
                    <li> <Link to={'/connections'} className="p-2 rounded-lg hover:bg-primary transition duration-300"> Connections </Link> </li>

                    <li>
                        <Link to={'/profile'} className="p-2 rounded-lg hover:bg-primary transition duration-300 flex items-center px-3">
                            {globalAvatarURL
                                ?
                                <img src={globalAvatarURL} alt="avatar_image" className="w-11 h-11 rounded-full border-2 border-secondary object-cover mr-4" />
                                :
                                <CgProfile className="w-11 h-11 rounded-full border-2 border-secondary object-cover mr-4" />
                            }
                            <h1> {globalDisplayName} </h1>
                        </Link>
                    </li>
                </ul>
            </nav>
            <button className="md:hidden text-2xl">☰</button>
        </header>
    );
}