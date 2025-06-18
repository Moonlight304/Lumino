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
import RequireAuth from '@/configs/RequireAuth';
import RedirectIfAuth from '@/configs/RedirectIfAuth';

export default function App() {
    const location = useLocation();
    const hideNavbarPaths = ["/", "/auth", "/forgot-password", "/reset-password", "/onboarding"];

    return (
        <div className='bg-background text-white min-h-screen'>

            {!hideNavbarPaths.includes(location.pathname) && <Navbar />}

            <Routes>
                {/* Public routes */}
                <Route path='/' element={<RedirectIfAuth><Landing /></RedirectIfAuth>} />
                <Route path='/auth' element={<RedirectIfAuth><Auth /></RedirectIfAuth>} />
                <Route path='/forgot-password' element={<RedirectIfAuth><ForgotPassword /></RedirectIfAuth>} />
                <Route path='/reset-password' element={<RedirectIfAuth><ResetPassword /></RedirectIfAuth>} />
                <Route path='/onboarding' element={<RedirectIfAuth><Onboarding /></RedirectIfAuth>} />

                {/* Private routes */}
                <Route path='/discover' element={<RequireAuth><Discover /></RequireAuth>} />
                <Route path='/feed' element={<RequireAuth><Feed /></RequireAuth>} />
                <Route path='/notifications' element={<RequireAuth><Notifications /></RequireAuth>} />
                <Route path='/user/:display_name' element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path='/edit_profile' element={<RequireAuth><EditProfile /></RequireAuth>} />
                <Route path='/connections' element={<RequireAuth><Connections /></RequireAuth>} />
                <Route path='/call/:callingUserID' element={<RequireAuth><Call /></RequireAuth>} />
            </Routes>
        </div>
    );
}