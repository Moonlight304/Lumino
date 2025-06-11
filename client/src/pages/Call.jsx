import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { socketConnection } from '../configs/socketConnection';
import peer from '../configs/peer';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { userIDState } from '../configs/atoms';

export default function Call() {
    const [globalUserID] = useRecoilState(userIDState);
    const [socket, setSocket] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);

    const localVideo = useRef(null);
    const remoteVideo = useRef(null);

    const { callingUserID } = useParams();

    async function handleCall(newSocket) {
        try {
            // Get local media stream
            const localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            // Display local video stream
            if (localVideo.current) {
                localVideo.current.srcObject = localStream;
            }

            // Add local stream tracks to peer connection
            localStream.getTracks().forEach((track) => {
                peer.peer.addTrack(track, localStream);
            });

            // Create and send offer
            const offer = await peer.getOffer();
            newSocket.emit('new-call', { remoteUserID: callingUserID, offer });

            setIsConnecting(false); // Call initiation complete
        } catch (error) {
            console.error('Error during call setup:', error.message);
            alert('Failed to start call. Please check your media permissions.');
        }
    }

    async function handleCallAccepted(remoteSocketID, answer) {
        try {
            await peer.setLocalDescription(answer);
            console.log('Call accepted, connected to:', remoteSocketID);

            // Listen for remote track events and display remote stream
            peer.peer.ontrack = (event) => {
                if (remoteVideo.current) {
                    remoteVideo.current.srcObject = event.streams[0];
                }
            };
        } catch (error) {
            console.error('Error during call acceptance:', error.message);
        }
    }

    // Toggle Audio
    function toggleMute() {
        const stream = localVideo.current?.srcObject;
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }

    // Toggle Video
    function toggleVideo() {
        const stream = localVideo.current?.srcObject;
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    }

    useEffect(() => {
        const newSocket = socketConnection(globalUserID);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            handleCall(newSocket);
        });

        newSocket.on('call-accepted', ({ remoteSocketID, answer }) => {
            handleCallAccepted(remoteSocketID, answer);
        });

        return () => {
            // Cleanup on component unmount
            newSocket.disconnect();
            if (localVideo.current?.srcObject) {
                localVideo.current.srcObject.getTracks().forEach((track) => track.stop());
            }
        };
    }, [globalUserID]);

    const navigate = useNavigate();
    useEffect(() => {
        if (!globalUserID) {
            navigate("/")
            toast.error('Cannot access page', toastConfig);
        }
    }, [globalUserID, navigate])

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            {isConnecting ? (
                <p className="text-lg">Connecting...</p>
            ) : (
                <>
                    <div className="flex justify-around w-full">
                        {/* Local Video */}
                        <video
                            ref={localVideo}
                            autoPlay
                            playsInline
                            muted
                            className="w-1/2 border-2 border-blue-500 rounded-lg"
                        ></video>

                        {/* Remote Video */}
                        <video
                            ref={remoteVideo}
                            autoPlay
                            playsInline
                            className="w-1/2 border-2 border-green-500 rounded-lg"
                        ></video>
                    </div>

                    {/* Call Controls */}
                    <div className="mt-4">
                        <button
                            onClick={toggleMute}
                            className={`px-4 py-2 rounded-lg ${isMuted ? 'bg-red-600' : 'bg-green-600'}`}
                        >
                            {isMuted ? 'Unmute' : 'Mute'}
                        </button>
                        <button
                            onClick={toggleVideo}
                            className={`px-4 py-2 rounded-lg ml-4 ${isVideoEnabled ? 'bg-green-600' : 'bg-red-600'}`}
                        >
                            {isVideoEnabled ? 'Disable Video' : 'Enable Video'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
