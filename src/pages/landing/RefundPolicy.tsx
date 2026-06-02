
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { useEffect } from 'react';

const RefundPolicy = () => {
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
                            <h1 className="text-5xl font-bold mb-12 gradient-text text-center">REFUND & CANCELLATION POLICY</h1>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-12">
                                <h2 className="text-3xl font-bold mb-8 text-blue-400">REFUND</h2>

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold mb-4 text-white">I. Digital Content Policy</h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        Our certification preparation materials (quizzes, mock tests, and study guides) are classified as Digital Goods. Because these materials are accessible immediately upon purchase, we maintain a Strict No-Refund Policy.
                                    </p>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold mb-4 text-white">II. Why are refunds not provided?</h3>
                                    <ul className="space-y-3 text-gray-300">
                                        <li className="flex items-start">
                                            <div className="text-blue-400 mr-2 font-bold">•</div>
                                            <span><strong className="text-white">Instant Access:</strong> Once a subscription is activated, you gain full access to our proprietary database of questions.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="text-blue-400 mr-2 font-bold">•</div>
                                            <span><strong className="text-white">Intellectual Property:</strong> Digital content cannot be "returned" in the same way physical goods can.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold mb-4 text-white">III. Exceptional Circumstances</h3>
                                    <p className="text-gray-300 mb-4">While we do not offer general refunds, we may consider a pro-rata credit or subscription extension in the following cases:</p>
                                    <ul className="space-y-3 text-gray-300">
                                        <li className="flex items-start">
                                            <div className="text-blue-400 mr-2 font-bold">•</div>
                                            <span><strong className="text-white">Duplicate Payment:</strong> If you were charged twice for the same subscription due to a technical glitch.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <div className="text-blue-400 mr-2 font-bold">•</div>
                                            <span><strong className="text-white">Technical Failure:</strong> If a server-side error prevents you from accessing the App for more than 48 consecutive hours (verified by our technical team).</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-3xl font-bold mb-8 text-purple-400">CANCELLATION</h2>
                                <p className="text-gray-300 mb-4">You may cancel your subscription at any time to prevent future renewals.</p>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-start">
                                        <div className="text-purple-400 mr-2 font-bold">•</div>
                                        <span>Cancellation stops the next billing cycle but does not result in a refund for the current period.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="text-purple-400 mr-2 font-bold">•</div>
                                        <span>You will retain access to the premium content until your current billing period expires.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg">
                                <h2 className="text-2xl font-bold mb-4 text-white">Contact for Billing Issues</h2>
                                <p className="text-gray-300">
                                    For duplicate payment concerns, please email at <a href="mailto:support@thecybercruciora.com" className="text-blue-400 font-bold hover:underline">support@thecybercruciora.com</a> with your transaction ID and registered email address.
                                </p>
                            </div>

                        </div>
                    </div>
                    <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                </section>
            </div>
            <Footer />
        </>
    );
};

export default RefundPolicy;
