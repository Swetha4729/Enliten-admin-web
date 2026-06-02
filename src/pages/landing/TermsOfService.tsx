
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { useEffect } from 'react';

const TermsOfService = () => {
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
                            <h1 className="text-5xl font-bold mb-12 gradient-text text-center">TERMS OF SERVICE</h1>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">1. OPERATIONAL SCOPE</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    THE CYBER CRUCIORA Mobile Application is owned and operated by Protexura Technologies, with its primary business office at Bangalore, India. These Terms govern your access to our certification exam preparation platform.
                                </p>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">2. INTELLECTUAL PROPERTY & USAGE</h2>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Ownership:</strong> All quiz questions, mock exams, and proprietary algorithms are the property of Protexura Technologies.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">License Grant:</strong> We grant you a personal, limited, non-transferable license to use the app.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <div>
                                            <strong className="text-white">Restrictions:</strong> You are strictly prohibited from:
                                            <ul className="pl-6 mt-2 space-y-1">
                                                <li className="flex items-start"><span className="mr-2">o</span> Copying or distributing exam questions.</li>
                                                <li className="flex items-start"><span className="mr-2">o</span> Sharing account credentials.</li>
                                                <li className="flex items-start"><span className="mr-2">o</span> Using automated scripts (bots) to scrape data.</li>
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">3. SUBSCRIPTION & REFUND POLICY</h2>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Payments:</strong> Fees are processed in INR through Protexura Technologies</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">No Refund Policy:</strong> Due to the immediate delivery of digital content (quiz banks), all purchases are final and non-refundable.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">4. DATA PRIVACY (DPDPA COMPLIANCE)</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    We respect your privacy under the Indian Digital Personal Data Protection Act. We collect your name and email to track your progress and manage your subscription. We do not sell your data to third parties.
                                </p>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">5. DISCLAIMERS & LIMITATIONS</h2>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">No Guarantee:</strong> Our materials are aids; we do not guarantee a passing grade on any official certification exam.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">"As-Is" Service:</strong> We are not liable for technical errors, typographical mistakes, or temporary app downtime.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Liability Cap:</strong> Protexura Technologies' total liability shall not exceed the amount paid by you for the subscription.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg mb-8">
                                <h2 className="text-2xl font-bold mb-4 text-white">6. DISPUTE RESOLUTION</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    Any legal disputes arising from these terms will be settled exclusively in the courts of Bangalore, Karnataka, under Indian Law.
                                </p>
                            </div>

                            <div className="glass-effect neon-border p-8 rounded-lg">
                                <h2 className="text-2xl font-bold mb-4 text-white">7. CONTACT INFORMATION</h2>
                                <ul className="space-y-3 text-gray-300">
                                    <li className="flex items-start">
                                        <div className="text-neon-blue mr-2 font-bold">•</div>
                                        <span><strong className="text-white">Email:</strong> support@thecybercruciora.com</span>
                                    </li>
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

export default TermsOfService;
