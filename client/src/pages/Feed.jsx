import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { toast } from 'react-hot-toast';


import toastConfig from '../configs/toastConfig';
import { userIDState } from '../configs/atoms';

import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import NewPostCard from '@/components/NewPostCard';
import Loading from '@/components/Loading';

const server_url = import.meta.env.VITE_server_url;

export default function Feed() {
    const [isLoading, setIsLoading] = useState(true);
    const [globalUserID] = useRecoilState(userIDState);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        async function getPosts() {
            try {
                const response = await axios.get(`${server_url}/posts/`, {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('jwt_token')}`
                    }
                });
                const data = response.data;

                if (data.status === 'success') {
                    setPosts(data.allPosts);
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

        getPosts();
    }, []);

    const navigate = useNavigate();
    useEffect(() => {
        if (!globalUserID) {
            navigate('/');
            toast.error('Cannot access page', toastConfig);
        }
    }, [globalUserID]);

    return (
        <>
            {isLoading ? (
                <Loading message={'Loading latest posts...'} />
            ) : (
                <div className='flex flex-col items-center'>
                    <NewPostCard
                        setPosts={setPosts}
                    />

                    {posts.length > 0
                        ?
                        posts.map((post, index) => {
                            return (
                                <PostCard
                                    key={index}
                                    post={post}
                                    setPosts={setPosts}
                                />
                            );
                        })
                        : (
                            <h1>No posts available</h1>
                        )}
                </div>
            )}
        </>
    );
}
