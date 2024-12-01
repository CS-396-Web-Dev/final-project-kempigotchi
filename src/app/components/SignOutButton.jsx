import { logout } from "../utilities/firebase";

const SignOutButton = () => {
    return (
        <div className="absolute top-4 right-4">
            <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm md:text-base lg:text-lg"
            aria-label="Sign Out"
            >
            Sign Out
            </button>
        </div>
    );
};

export default SignOutButton;