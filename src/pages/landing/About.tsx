
import { Button } from '@/components/ui/button';

import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import GeminiChatbot from '@/components/landing/GeminiChatbot';
import { useEffect } from 'react';

// import pic from '../img/gokul.jpg' 
const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 page-transition">
        {/* Hero Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h1 className="text-5xl font-bold mb-6 gradient-text">About Cyber Cruciora</h1>
              <p className="text-xl text-gray-300">
                We’re building the future of cybersecurity learning — one quiz at a time. With focused practice, smart tracking, and exam-ready challenges, Cyber Cruciora helps you strengthen your skills and succeed with confidence.
              </p>
            </div>
          </div>
          <div className="absolute -top-24 right-0 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 left-0 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-dark-800/50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="glass-effect neon-border p-8 rounded-lg">
                <h2 className="text-3xl font-bold mb-6 text-neon-blue text-white">Our Mission</h2>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  To simplify the journey toward cybersecurity certification by providing focused practice tools, comprehensive mock tests, and a learning experience designed for real-world success. We aim to make exam preparation efficient, engaging, and empowering.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <div className="text-neon-blue mr-2">✦</div>
                    <span>Designing quiz modes that target individual strengths and weaknesses</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-neon-blue mr-2">✦</div>
                    <span>Delivering realistic mock tests that mirror actual exam environments</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-neon-blue mr-2">✦</div>
                    <span>Supporting continuous growth through progress tracking and smart revision</span>
                  </li>
                </ul>
              </div>

              <div className="glass-effect neon-border p-8 rounded-lg">
                <h2 className="text-3xl font-bold mb-6 text-neon-purple text-white">Our Vision</h2>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  To become the world's leading platform for effortless and effective cybersecurity exam preparation. We aim to empower learners with the tools, confidence, and structure they need to master certifications and thrive in a cyber-secure future.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <div className="text-neon-purple mr-2">✦</div>
                    <span>Accessible and practical learning for every aspiring cybersecurity professional</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-neon-purple mr-2">✦</div>
                    <span>Smart quiz modes that adapt to real learning needs and certification paths</span>
                  </li>
                  <li className="flex items-start">
                    <div className="text-neon-purple mr-2">✦</div>
                    <span>A platform that grows with you — from beginner to expert</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-12 text-center gradient-text">Our Values</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="p-6 glass-effect hover:neon-border rounded-lg transition-all">
                <div className="w-16 h-16 rounded-full bg-neon-blue/20 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-neon-blue text-white">Learner-First</h3>
                <p className="text-gray-400 text-center">
                  Everything we build starts with the learner in mind - simple, effective tools that make exam prep less stressful and more achievable.
                </p>
              </div>

              <div className="p-6 glass-effect hover:neon-border rounded-lg transition-all">
                <div className="w-16 h-16 rounded-full bg-neon-purple/20 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-neon-purple text-white">Purpose-Driven Design</h3>
                <p className="text-gray-400 text-center">
                  Our quiz modes and features are built to solve real challenges faced by cybersecurity aspirants, from daily practice to performance tracking.
                </p>
              </div>

              <div className="p-6 glass-effect hover:neon-border rounded-lg transition-all">
                <div className="w-16 h-16 rounded-full bg-electric-blue/20 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl">🛠️</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-electric-blue text-white">Focused Innovation</h3>
                <p className="text-gray-400 text-center">
                  We constantly refine and improve Cyber Cruciora to stay aligned with evolving certification standards and learner needs.
                </p>
              </div>

              <div className="p-6 glass-effect hover:neon-border rounded-lg transition-all">
                <div className="w-16 h-16 rounded-full bg-electric-purple/20 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-center text-electric-purple text-white">Security-Centric              </h3>
                <p className="text-gray-400 text-center">
                  As a cybersecurity platform, we take privacy and trust seriously — your data and progress are protected, always.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-dark-800/50">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-4 text-center gradient-text">Our Team</h2>
            <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
              At The Cyber Cruciora we are powered by a diverse group of cybersecurity experts and technologists dedicated to empowering your professional success. We provide unparalleled support and expert guidance to ensure you excel throughout your entire certification journey.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* <div className="glass-effect neon-border p-6 rounded-lg text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-neon-blue to-neon-purple opacity-70" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">-</h3>
                <p className="text-neon-blue mb-3 text-white">CO-Founder</p>
                <p className="text-gray-400">
                  Co-founder with a deep understanding of AI technologies, -- is instrumental in shaping our product vision.
                </p>
              </div> */}

              <div className="glass-effect neon-border p-6 rounded-lg text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-neon-purple to-electric-blue opacity-70" />
                  {/* <img src={pic} alt="" /> */}
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">K K Singh</h3>
                <p className="text-neon-purple mb-3 text-white">Subject Expert</p>
                <p className="text-gray-400">
                  Strategic cybersecurity expert dedicated to protecting global systems, with a relentless focus on risk mitigation and data integrity.
                </p>
              </div>

              <div className="glass-effect neon-border p-6 rounded-lg text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-electric-blue to-neon-green opacity-70" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">Gokulakrishnan K</h3>
                <p className="text-electric-blue mb-3 text-white">Technical Head</p>
                <p className="text-gray-400">
                  Versatile full-stack leader dedicated to engineering secure, high-performance architectures with a relentless focus on cybersecurity and intelligent systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Join Us */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6 gradient-text">Join Our Team</h2>
              <p className="text-xl text-gray-300 mb-8">
                "We don’t just help users learn — we help them succeed."
              </p>
              <p className="text-gray-400 mb-8">
                At Cyber Cruciora, we’re building the future of exam prep in cybersecurity. If you're passionate about education, user experience, and making learning easier and smarter for everyone, we’d love to have you on board.
              </p>
              <Button onClick={() => window.location.href = "mailto:support@thecybercruciora.com"} className="bg-purple-600 hover:bg-purple-700 text-lg py-6 px-8 animate-pulse-neon">
                Join Us
              </Button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
      <GeminiChatbot />
    </>
  );
};

export default About;
