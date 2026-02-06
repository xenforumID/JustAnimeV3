import { FaChevronLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

function Error({ error }) {
    const navigate = useNavigate();
    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="flex flex-col w-fit h-fit items-center justify-center">
                <div className="w-[300px] h-[300px] max-[500px]:w-[200px] max-[500px]:h-[200px] relative overflow-hidden rounded-lg">
                    <img 
                        src="https://64.media.tumblr.com/tumblr_lhnjv52vzw1qcrzkko1_500.gif" 
                        alt="404 Error" 
                        className="w-full h-full object-cover grayscale" 
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>
                <h1 className="font-bold text-white text-[48px] mt-8 tracking-tight">{error === "404" ? "404 Error" : "Error"}</h1>
                <p className="text-gray-400 text-lg mt-2">Oops! we couldn't find this page.</p>
                <button 
                    onClick={() => navigate('/home')} 
                    className="mt-8 bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 py-2 px-4 w-fit rounded-3xl flex items-center gap-x-2"
                >
                    <FaChevronLeft className="text-gray-800 w-[20px] h-[20px] rounded-full p-1" />
                    <span className="text-[18px]">Back to homepage</span>
                </button>
            </div>
        </div>
    )
}

export default Error