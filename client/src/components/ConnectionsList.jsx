import { CgProfile } from 'react-icons/cg';

export default function ConnectionsList({
    tab,
    setTab,
    connected,
    received,
    sent,
    isLoading,
    setOtherUser,
    setOtherUserID,
}) {
    const handleUserSelect = async (user) => {
        setOtherUser(user);
        setOtherUserID(user?._id);
    };

    const renderUserList = (users, emptyMessage) => {
        if (users.length === 0) {
            return <div className="text-gray-400 p-4">{emptyMessage}</div>;
        }

        return users.map((user) => (
            <div
                key={user?._id}
                className="flex items-center cursor-pointer p-4 hover:bg-gray-700 transition duration-150 ease-in-out"
                onClick={() => handleUserSelect(user)}
            >
                {user?.profile_picture ? (
                    <img
                        className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover mr-4"
                        src={user.profile_picture || '/placeholder.svg'}
                        alt={user.display_name}
                    />
                ) : (
                    <CgProfile className="w-12 h-12 text-blue-500 mr-4" />
                )}
                <h2 className="text-lg font-semibold">{user?.display_name}</h2>
            </div>
        ));
    };

    return (
        <div className="w-full md:w-1/3 h-full">
            <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                {/* Tab Navigation */}
                <div className="flex justify-around bg-gray-800 p-2">
                    <button
                        className={`px-4 py-2 rounded-md ${tab === 'connected' ? 'bg-primary' : 'hover:bg-gray-600'
                            }`}
                        onClick={() => setTab('connected')}
                    >
                        Connected ({connected?.length})
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${tab === 'received' ? 'bg-primary' : 'hover:bg-gray-600'
                            }`}
                        onClick={() => setTab('received')}
                    >
                        Received ({received?.length})
                    </button>
                    <button
                        className={`px-4 py-2 rounded-md ${tab === 'sent' ? 'bg-primary' : 'hover:bg-gray-600'
                            }`}
                        onClick={() => setTab('sent')}
                    >
                        Sent ({sent?.length})
                    </button>
                </div>

                {/* User Lists */}
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {tab === 'connected' &&
                                renderUserList(connected, 'No connected players found.')}
                            {tab === 'received' &&
                                renderUserList(received, 'No received requests found.')}
                            {tab === 'sent' &&
                                renderUserList(sent, 'No sent requests found.')}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
