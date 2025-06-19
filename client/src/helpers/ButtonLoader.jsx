import { LoaderCircle } from 'lucide-react';

export default function ButtonLoader({ className = "" }) {
    return (
        <LoaderCircle className={`animate-spin ${className}`} />
    );
}
