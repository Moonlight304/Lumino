import { Routes, Route } from 'react-router-dom';
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

export default function App() {
    return (
        <div className='bg-background text-white min-h-screen'>
            <Routes>
                <Route path='/' element={<Landing />} />
                <Route path='/auth' element={<Auth />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/reset-password' element={<ResetPassword />} />
                <Route path='/onboarding' element={<Onboarding />} />
                <Route path='/discover' element={<Discover />} />
                <Route path='/feed' element={<Feed />} />
                <Route path='/notifications' element={<Notifications />} />
                <Route path='/connections' element={<Connections />} />
                <Route path='/call/:callingUserID' element={<Call />} />

            </Routes>
        </div>
    );
}