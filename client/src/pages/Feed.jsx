import { useState, useRef } from "react";
import Navbar from "../components/Navbar";

export default function Feed() {
    const videoRef = useRef(null);

    const startVideo = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            console.log(stream);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        }
        catch (e) {
            console.log(e.message);
        }
    };

    return (
        <>
            <Navbar />

            <h1>Feed Page</h1>

            <button onClick={startVideo}>
                Start Video
            </button>

            <div className="transform scale-x-[-1]">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    controls
                ></video>
            </div>
        </>
    );
}
