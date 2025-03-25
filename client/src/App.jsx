import { Routes, Route, useLocation } from 'react-router-dom';
import './index.css'

import Landing from './pages/Landing'
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Discover from './pages/Discover';
import Feed from './pages/Feed';
import Notifications from './pages/Notifications';
import Connections from './pages/Connections';
import Call from './pages/Call';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/UserPage';
import EditProfile from './pages/EditProfile';
import Navbar from './components/Navbar';

export default function App() {
    const location = useLocation();
    const hideNavbarPaths = ["/", "/auth", "/forgot-password", "/reset-password", "/onboarding"];

    return (
        <div className='bg-background text-white min-h-screen'>

            {!hideNavbarPaths.includes(location.pathname) && <Navbar />}

            <Routes>
                <Route path='/' element={<Landing />} />
                <Route path='/auth' element={<Auth />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path='/onboarding' element={<Onboarding />} />
                <Route path='/discover' element={<Discover />} />
                <Route path='/feed' element={<Feed />} />
                <Route path='/notifications' element={<Notifications />} />
                <Route path='/user/:display_name' element={<Profile />} />
                <Route path='/edit_profile' element={<EditProfile />} />

                <Route path='/connections' element={<Connections />} />
                <Route path='/call/:callingUserID' element={<Call />} />

            </Routes>
        </div>
    );
}