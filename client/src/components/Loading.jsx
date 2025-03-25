import { Loader2 } from "lucide-react";

export default function Loading({ message }) {
    return (
        <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-red-500 mb-4" />
            <p className="text-lg text-red-400"> {message} </p>
        </div>
    );
}