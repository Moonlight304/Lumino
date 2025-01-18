import { Link, useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { displayNameState, userIDState, socketState } from "../configs/atoms";


export default function Navbar() {
    const [globalUserID, setGlobalUserID] = useRecoilState(userIDState);
    const [globalDisplayName] = useRecoilState(displayNameState);
    const [globalSocket, setGlobalSocket] = useRecoilState(socketState);

    const navigate = useNavigate();

    function disconnectSocket() {
        if (globalSocket) {
            globalSocket.disconnect();
        }
    }

    return (
        <header className="container mx-auto px-10 pt-4 pb-2 flex justify-between items-center border-b-2 border-white">
            <div className="text-2xl font-bold text-primary">Lumino</div>

            <button onClick={() => {
                sessionStorage.removeItem('jwt_token');
                setGlobalUserID(null);
                setGlobalUserID('');
                disconnectSocket();
                navigate('/auth');
            }}> Logout </button>

            <nav className="hidden md:block">
                <ul className="flex space-x-6">
                    <li> <Link to={'/notifications'} className="p-2 rounded-lg hover:bg-primary transition duration-300"> Notifications </Link> </li>
                    <li> <Link to={'/feed'} className="p-2 rounded-lg hover:bg-primary transition duration-300"> Feed </Link> </li>
                    <li> <Link to={'/discover'} className="p-2 rounded-lg hover:bg-primary transition duration-300"> Discover </Link> </li>
                    <li> <Link to={'/connections'} className="p-2 rounded-lg hover:bg-primary transition duration-300"> Connections </Link> </li>
                    <li> <Link to={'/profile'} className="p-2 rounded-lg hover:bg-primary transition duration-300"> {globalDisplayName} </Link> </li>
                </ul>
            </nav>
            <button className="md:hidden text-2xl">☰</button>
        </header>
    );
}