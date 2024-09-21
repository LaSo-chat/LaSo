import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../app/slices/authSlice'; // Redux action to update auth state
import { useNavigate } from 'react-router-dom';
import { signUp } from '../services/authService'; // Auth service
import { IoEyeOffOutline, IoEyeOutline, IoArrowForward } from 'react-icons/io5'; // Importing icons from React Icons

const SignUp: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSignUp = async () => {
        try {
            const { user } = await signUp(email, password);
            if (user) {
                dispatch(login(user)); // Dispatch Redux action to update auth state
                navigate('/profile-step-1'); // Redirect to home after successful signup
            }
        } catch (error: any) {
            alert(error.message); // Handle signup errors
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
                {/* Square Image and Title */}
                <div className="text-center mb-6">
                    <div className="relative mb-6">
                        <img
                            src="/checkout.svg" // Placeholder for the square image
                            alt="Square Image"
                            className="mx-auto w-150 h-100 object-cover rounded-2xl"
                        />
                    </div>
                    <h1 className="font-poppins italic text-4xl font-bold">LaSo</h1>
                    <p className="text-gray-600">Sign into your account</p>
                </div>

                {/* Form */}
                <div>
                    {/* Email Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-800 mb-2">
                            Your email address
                        </label>
                        <input
                            type="email"
                            className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    {/* Password Input */}
                    <div className="mb-6 relative">
                        <label className="block text-sm font-medium text-gray-800 mb-2">
                            Choose a password
                        </label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full p-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-10 text-gray-500"
                        >
                            {showPassword ? <IoEyeOffOutline size={24} /> : <IoEyeOutline size={24} />}
                        </button>
                    </div>

                    {/* Submit Button */}
                    <div className="mb-4">
                        <button
                            onClick={handleSignUp}
                            className="w-full bg-sky-600 text-lg font-semibold text-white p-4 rounded-full hover:bg-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-900 flex justify-center items-center"
                        >
                            Continue
                            <IoArrowForward size={24} className="ml-2" />
                        </button>
                    </div>

                    <div onClick={() => navigate('/login')} className="text-center">Already have an account? <span className='text-sky-700 text-lg font-bold font-poppins italic cursor-pointer hover:underline' >Login</span> </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
