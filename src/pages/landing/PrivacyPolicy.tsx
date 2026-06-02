
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { useEffect } from 'react';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [])
    return (
        <>
            <Navbar />
            <div className="pt-24 pb-16 page-transition">
                <section className="py-16 relative overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-5xl font-bold mb-8 gradient-text text-center">PRIVACY POLICY</h1>

                            <div className="text-center mb-12 text-gray-400">
                                <p><strong>Effective Date:</strong> December 21, 2025</p>
                                <p><strong>Owner:</strong> Protexura Technologies, Bangalore, India</p>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">1. INTRODUCTION</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    Welcome to The Cyber Cruciora (TCC). Your privacy is paramount to us. This Privacy Policy explains how Protexura Technologies ("we", "us", or "our") handles your information when you use our mobile application The Cyber Cruciora (TCC). We are committed to a "Data Minimalist" approach, collecting only what is strictly necessary to provide our certification preparation services.
                                </p>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">2. DATA WE COLLECT</h2>
                                <p className="text-gray-300 mb-4">We collect only two specific pieces of "Personal Data":</p>
                                <ul className="space-y-3 text-gray-300 mb-6">
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Full Name:</strong> To personalize your learning dashboard and certification progress reports.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Email Address:</strong> To act as your unique login identifier, send password reset links, and provide subscription updates.</span>
                                    </li>
                                </ul>
                                <div className="bg-dark-900/50 p-4 rounded border border-gray-700">
                                    <p className="text-gray-300 italic">
                                        <strong className="text-neon-purple">Note:</strong> We do NOT collect your location, contacts, or SMS data. All payment processing is handled by secure third-party gateways; Protexura Technologies does not store your credit card or banking details.
                                    </p>
                                </div>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">3. PURPOSE OF DATA COLLECTION</h2>
                                <p className="text-gray-300 mb-4">Under the Indian DPDPA, we process your data based on your consent for the following purposes:</p>
                                <ol className="space-y-3 text-gray-300 list-decimal pl-6">
                                    <li><strong className="text-white">Account Management:</strong> Creating and maintaining your user profile.</li>
                                    <li><strong className="text-white">Performance Tracking:</strong> Linking your quiz scores and mock exam results to your identity.</li>
                                    <li><strong className="text-white">Communication:</strong> Sending critical updates regarding exam syllabus changes or technical support.</li>
                                </ol>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">4. DATA STORAGE AND SECURITY</h2>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Localization:</strong> In compliance with Indian regulations, your data is stored on secure servers located within India.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Protection:</strong> We employ industry-standard encryption (SSL/TLS) to protect your Name and Email ID from unauthorized access.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">5. DATA SHARING & THIRD PARTIES</h2>
                                <p className="text-gray-300 mb-4">We do not sell, rent, or trade your personal information to third-party advertisers. We only share data with:</p>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Cloud Service Providers:</strong> To host the application.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Payment Gateways:</strong> Only to the extent necessary to verify your subscription status.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">6. YOUR RIGHTS (DATA PRINCIPAL RIGHTS)</h2>
                                <p className="text-gray-300 mb-4">As a user of The Cyber Cruciora, you have the following rights:</p>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Right to Access:</strong> You can view your profile data at any time within the App settings.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Right to Correction:</strong> You may update your Name or Email if they are inaccurate.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Right to Erasure:</strong> You may request the deletion of your account. Upon deletion, your Name and Email will be purged from our active databases.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg">
                                <h2 className="text-2xl font-bold mb-4 text-white">7. GRIEVANCE REDRESSAL</h2>
                                <p className="text-gray-300 mb-4">If you have concerns regarding your data privacy, please contact our Grievance Officer as per the Information Technology Act of India:</p>
                                <ul className="space-y-2 text-gray-300">
                                    <li><strong className="text-white">Company:</strong> Protexura Technologies</li>
                                    <li><strong className="text-white">Location:</strong> Bangalore, Karnataka, India</li>
                                    <li><strong className="text-white">Email:</strong> <a href="mailto:support@thecybercruciora.com" className="text-neon-blue hover:underline">support@thecybercruciora.com</a></li>
                                </ul>
                            </div>

                        </div>
                    </div>
                    <div className="absolute -top-24 right-0 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 left-0 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />
                </section>
            </div>
            <Footer />
        </>
    );
};

export default PrivacyPolicy;
