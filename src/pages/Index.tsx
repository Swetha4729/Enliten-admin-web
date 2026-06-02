import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, BookOpen, Flame, XIcon, Zap, TrendingUp, Layers, BookCopy, BarChart3, Smartphone, Shield, Twitter, Linkedin, Facebook } from "lucide-react";
import { motion, useScroll, useTransform } from 'framer-motion';
import React from "react";
import icon from "../../images/icon.jpeg";
import GooglePlay from "../../images/google-play.png"

const isMobile = () => {
  return /Mobi|Android/i.test(navigator.userAgent);
};

// Usage in a React component 
const mobile = isMobile();
const quizModes = [
  { icon: <Timer className="text-orange-400 w-8 h-8" />, title: "Timed Mode", desc: "Practice under exam conditions with a countdown timer." },
  { icon: <XIcon className="text-red-400 w-8 h-8" />, title: "Missed Questions", desc: "Track your missed questions and practice them again." },
  { icon: <TrendingUp className="text-green-400 w-8 h-8" />, title: "Level up", desc: "Begin your journey with easy questions and unlock tougher challenges as you level up!" },
  { icon: <Layers className="text-purple-400 w-8 h-8" />, title: "Custom Sets", desc: "Build quizzes from your chosen topics." },
];

const features = [
  { icon: <Shield className="w-8 h-8 text-green-400" />, title: "Cybersecurity Exams", desc: "Questions crafted for today’s top cybersecurity exams." },
  { icon: <BarChart3 className="w-8 h-8 text-blue-400" />, title: "Progress Tracking", desc: "Visualize your improvement and stay motivated." },
  { icon: <BookOpen className="w-8 h-8 text-purple-400" />, title: "Detailed Explanations", desc: "Understand every answer with concise explanations." },
  { icon: <BookCopy className="w-8 h-8 text-red-400" />, title: "Study Material", desc: "Study material for all exams." },

];

if (!mobile) {
  features.push({ icon: <Flame className="text-blue-400 w-8 h-8" />, title: "Study Strikes", desc: "Track your daily strikes and stay motivated." },
    { icon: <Zap className="text-orange-400 w-8 h-8" />, title: "Quiz Modes", desc: "Choose from 7 different quiz modes to suit your learning style." },
  );

}

const testimonials = [
  { quote: "The best app for CompTIA prep. Period.", author: "Alex D.", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { quote: "Helped me pass my Security+ on the first try!", author: "Sarah K.", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { quote: "A must-have for anyone serious about cybersecurity certs.", author: "Mike P.", avatar: "https://randomuser.me/api/portraits/men/56.jpg" },
];
const Section = ({ title, children, id }) => (
  <div id={id} className="w-screen h-screen flex flex-col items-center justify-center shrink-0 relative">
    {/* {!mobile && <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-white absolute top-[25%]">{title}</h2>} */}
    <div className="max-w-5xl w-full mx-auto px-4 mt-32">
      {children}
    </div>
  </div>
);

const Index = () => {
  const targetRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end end'] });

  // --- TIMING & KEYFRAMES ---
  // Defines the scroll progress points where animations transition.
  // This creates pauses and ensures content is readable.
  const heroEnd = 0.1;
  const featuresStart = 0.15, featuresEnd = 0.30;
  const modesStart = 0.35, modesEnd = 0.50;
  const testimonialsStart = 0.55, testimonialsEnd = 0.70;
  const ctaStart = 0.75, ctaEnd = 0.9;

  // --- HERO ANIMATIONS ---
  const heroScale = useTransform(scrollYProgress, [0, heroEnd], [1, 0.8]);
  const heroOpacity = useTransform(scrollYProgress, [heroEnd - 0.05, heroEnd], [1, 0]);
  const heroZIndex = useTransform(scrollYProgress, (pos) => pos < heroEnd ? 10 : -1);
  const heroContentY = useTransform(scrollYProgress, [0, heroEnd], ['0%', '20%']);

  // --- STICKY SECTIONS CONTAINER ---
  // This container handles the horizontal scroll and fade for all sticky sections.
  const stickySectionsX = useTransform(scrollYProgress,
    [featuresStart, featuresEnd, modesStart, modesEnd, testimonialsStart, testimonialsEnd],
    ['0%', '0%', '-100%', '-100%', '-200%', '-200%']
  );
  const stickySectionsOpacity = useTransform(scrollYProgress,
    [heroEnd, featuresStart, testimonialsEnd, ctaStart],
    [0, 1, 1, 0]
  );

  // --- CTA & FOOTER ANIMATIONS ---
  const ctaOpacity = useTransform(scrollYProgress, [testimonialsEnd, ctaStart, ctaEnd, ctaEnd + 0.05], [0, 1, 1, 0]);
  const ctaY = useTransform(scrollYProgress, [ctaStart, ctaEnd], ['50px', '0px']);
  const ctaZIndex = useTransform(scrollYProgress, (pos) => (pos > testimonialsEnd && pos < ctaEnd + 0.05) ? 20 : -1);

  return (
    <div className="bg-[#181F2A] text-white font-sans">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-[#181F2A]/80 backdrop-blur-lg shadow-md"
      >
        {/* Header content remains the same */}
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* <Shield className="text-[#FFA726] w-9 h-9" /> */}
            <img src={icon} alt="" className="w-12 h-12 rounded-full" />
            <span className="font-extrabold text-2xl tracking-tight">The cyber Cruciora</span>
          </div>
          {!mobile && (
            <a href="https://play.google.com/store/apps/details?id=com.cyber.cruciora" rel="noopener noreferrer">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-[#FFA726] hover:bg-orange-500 text-white font-semibold px-7 py-2.5 rounded-xl shadow-md">
                  Download App
                </Button>
              </motion.div>
            </a>)}
        </div>
      </motion.header>

      <div ref={targetRef} className="h-[800vh] relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* --- BACKGROUND ELEMENTS --- */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#181F2A] via-[#232B3E] to-[#111620]" />
          <motion.div className="absolute top-[10%] left-[5%] w-64 h-64 bg-purple-500/10 rounded-full filter blur-3xl" style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '200%']) }} />
          <motion.div className="absolute bottom-[5%] right-[10%] w-80 h-80 bg-orange-500/10 rounded-full filter blur-3xl" style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-150%']) }} />

          {/* --- HERO SECTION --- */}
          <motion.div
            className="h-full w-full flex items-start justify-center relative px-4 mt-[20%]"
            style={{ scale: heroScale, opacity: heroOpacity, zIndex: heroZIndex, y: heroContentY }}
          >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-[12rem] items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-left"
              >
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                  Master Your Cyber Exams
                </h1>
                <p className="text-xl md:text-2xl mb-10 max-w-xl text-[#D2DBF9]">
                  The ultimate study tool for CompTIA, CISSP, and more. Pass with confidence.
                </p>
                <div className="flex justify-start items-center gap-4 flex-wrap">

                  <a href="https://play.google.com/store/apps/details?id=com.cyber.cruciora" rel="noopener noreferrer">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="bg-[#FFA726] hover:bg-orange-500 text-white font-semibold px-10 py-4 rounded-xl shadow-xl text-xl">Get Started Free</Button>
                    </motion.div>
                  </a>
                  <a href="https://play.google.com/store/apps/details?id=com.cyber.cruciora" rel="noopener noreferrer">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <img src={GooglePlay} alt="" className="w-48 h-12" />
                    </motion.div>
                  </a>
                </div>
              </motion.div>
              {/* <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                          className="relative w-full h-96 flex items-center justify-center"
                      >
                          <div className="w-72 h-[30rem] bg-slate-800/40 rounded-3xl border border-white/10 p-4 backdrop-blur-sm">
                              <div className="w-full h-full rounded-2xl bg-[#181F2A] p-4 space-y-4 overflow-hidden">
                                  <div className="flex justify-between items-center">
                                      <span className="text-sm font-bold text-white">Security+</span>
                                      <div className="w-16 h-2 bg-green-500 rounded-full"></div>
                                  </div>
                                  <div className="w-full h-8 bg-slate-700/50 rounded-lg animate-pulse"></div>
                                  <div className="w-10/12 h-8 bg-slate-700/50 rounded-lg animate-pulse"></div>
                                  <div className="w-full h-24 bg-slate-700/50 rounded-lg animate-pulse"></div>
                                  <div className="w-8/12 h-8 bg-slate-700/50 rounded-lg animate-pulse"></div>
                              </div>
                          </div>
                      </motion.div> */}

              {!mobile &&
                <div className="w-full h-full">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="relative w-[18rem] h-[18rem] flex items-center justify-center"
                  >
                    <img src={icon} alt="" className="rounded-xl" />

                  </motion.div>
                </div>
              }

            </div>
          </motion.div>

          {/* --- STICKY SCROLL CONTAINER --- */}
          <motion.div style={{ x: stickySectionsX, opacity: stickySectionsOpacity }} className="absolute inset-0 flex items-center">
            <div className="flex w-[300vw]">
              <Section title="Why The Cyber Cruciora?" id="features">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {features.map((feature, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                      <Card className="bg-[#232B3E]/60 border border-white/10 rounded-2xl p-6 text-left h-full">
                        <CardHeader className="flex flex-row items-center gap-4 p-0 mb-4">
                          {feature.icon}
                          <CardTitle className="text-2xl font-bold text-white">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <p className="text-base text-[#D2DBF9]">{feature.desc}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Section>

              <Section title="Advanced Quiz Modes" id="modes">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {quizModes.map((mode, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                      <Card className="bg-[#232B3E]/60 border border-white/10 rounded-2xl p-6 text-left h-full">
                        <CardHeader className="flex flex-row items-center gap-4 p-0 mb-4">
                          {mode.icon}
                          <CardTitle className="text-2xl font-bold text-white">{mode.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <p className="text-base text-[#D2DBF9]">{mode.desc}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Section>

              <Section title="What Our Users Say" id="testimonials">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                      <Card className="bg-[#232B3E]/60 border border-white/10 rounded-2xl p-6 h-full flex flex-col justify-between">
                        <CardContent className="p-0">
                          <p className="text-lg italic text-white mb-4">"{testimonial.quote}"</p>
                        </CardContent>
                        <CardHeader className="p-0 flex flex-row items-center gap-4">
                          <img src={testimonial.avatar} alt={testimonial.author} className="w-12 h-12 rounded-full" />
                          <p className="font-bold text-base text-[#D2DBF9]">{testimonial.author}</p>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Section>
            </div>
          </motion.div>

          {/* --- FINAL CTA SECTION --- */}
          <motion.div
            id="download"
            style={{ opacity: ctaOpacity, y: ctaY, zIndex: ctaZIndex }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
              <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-green-500/10 rounded-full filter blur-3xl"></div>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">Start Your Cybersecurity Journey</h2>
              <p className="text-xl md:text-2xl mb-10 max-w-2xl text-[#D2DBF9]">Download The Cyber Cruciora and unlock your potential today.</p>
              <a href="https://play.google.com/store/apps/details?id=com.cyber.cruciora" target="_blank" rel="noopener noreferrer">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="animate-pulse-slow">
                  <Button size="lg" className="bg-[#FFA726] hover:bg-orange-500 text-white font-semibold px-10 py-4 rounded-xl shadow-xl text-xl">Download The App</Button>
                </motion.div>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.footer
        style={{ opacity: useTransform(scrollYProgress, [ctaEnd, 1], [0, 1]) }}
        className="w-full py-16 bg-gradient-to-t from-[#111620] to-[#181F2A] text-[#D2DBF9] text-base relative z-30"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-8">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {/* <Shield className="text-[#FFA726] w-9 h-9" /> */}
              <span className="font-extrabold text-2xl tracking-tight">The cyber Cruciora</span>
            </div>
            <p className="text-sm text-slate-400">The ultimate study tool for cybersecurity certifications. Master your exams with confidence.</p>
            <div className="flex gap-4 mt-2">
              <a href="#" className="text-slate-400 hover:text-white"><Twitter /></a>
              <a href="#" className="text-slate-400 hover:text-white"><Facebook /></a>
              <a href="#" className="text-slate-400 hover:text-white"><Linkedin /></a>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="https://play.google.com/store/apps/details?id=com.cyber.cruciora" className="hover:text-white transition-colors">Download</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-12 pt-8 border-t border-[#232B3E]">
          <span>&copy; {new Date().getFullYear()} The Cyber Cruciora. All rights reserved.</span>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
