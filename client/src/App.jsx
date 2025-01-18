import { Routes, Route } from 'react-router-dom';
import './index.css'

import Landing from './pages/Landing'
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Discover from './pages/Discover';
import Feed from './pages/Feed';
import Notifications from './pages/Notifications';
import Connections from './pages/Connections';

export default function App() {
    return (
        <div className='bg-background text-white min-h-screen'>
            <Routes>
                <Route path='/' element={<Landing />} />
                <Route path='/auth' element={<Auth />} />
                <Route path='/onboarding' element={<Onboarding />} />
                <Route path='/discover' element={<Discover />} />
                <Route path='/feed' element={<Feed />} />
                <Route path='/notifications' element={<Notifications />} />
                <Route path='/connections' element={<Connections />} />

            </Routes>
        </div>
    );
}