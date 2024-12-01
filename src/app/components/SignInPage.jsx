import { signInWithGoogle } from "../utilities/firebase";

const SignInPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-200 to-purple-300">
            <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">
            Welcome to Kempigotchi!
            </h1>
            <button
            onClick={signInWithGoogle}
            className="bg-white text-blue-500 px-4 py-2 rounded shadow-md hover:bg-gray-100"
            aria-label="Sign in with Google"
            >
            Sign in with Google
            </button>
        </div>
    );
};

export default SignInPage;