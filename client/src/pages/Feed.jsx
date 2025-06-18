import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import toastConfig from '../configs/toastConfig';

import PostCard from '../components/PostCard';
import NewPostCard from '@/components/NewPostCard';
import Loading from '@/components/Loading';
import { API } from '@/configs/api';


export default function Feed() {
    const [isLoading, setIsLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function getPosts() {
            try {
                const response = await API('/posts', 'GET');
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
                                    key={post?._id}
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
