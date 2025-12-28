import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, Brain, Mic, ShieldCheck, Play, Star, Stethoscope, Users } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F6F8FA] overflow-x-hidden selection:bg-emerald-500/30 font-inter">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-400/20 blur-[120px] rounded-full mix-blend-multiply opacity-70 animate-pulse"></div>
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] bg-blue-400/20 blur-[120px] rounded-full mix-blend-multiply opacity-70"></div>
        <div className="absolute bottom-[0%] left-[20%] w-[30%] h-[40%] bg-purple-400/20 blur-[120px] rounded-full mix-blend-multiply opacity-60"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer">
           <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
             <Activity className="text-white w-6 h-6" />
           </div>
           <span className="text-xl font-bold tracking-tight text-slate-900">OSCE Master</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
           <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
           <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How it works</a>
           <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => navigate('/dashboard')} className="text-slate-600 font-bold text-sm hover:text-emerald-600 hidden sm:block">Log In</button>
           <button 
             onClick={() => navigate('/dashboard')}
             className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-105 transition-all"
           >
             Get Started
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-32 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/50 shadow-sm backdrop-blur-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-700 tracking-wide uppercase">AI-Powered Patient Simulations</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                Master Clinical Skills with <br className="hidden md:block" />
                <span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">Virtual Patients</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                Prepare for USMLE Step 2 CS with hyper-realistic AI simulations. Practice history taking, physical exams, and reasoning in real-time.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="h-14 px-8 rounded-full bg-emerald-500 text-white font-bold text-lg shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-105 transition-all flex items-center gap-2"
                >
                    Start Free Practice <ArrowRight className="w-5 h-5" />
                </button>
                <button className="h-14 px-8 rounded-full bg-white text-slate-700 font-bold text-lg shadow-soft border border-white/50 hover:bg-slate-50 transition-all flex items-center gap-2 group">
                    <Play className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" /> Watch Demo
                </button>
            </div>
        </div>

        {/* Mockup / Visual */}
        <div className="relative mx-auto max-w-5xl animate-in fade-in zoom-in duration-1000 delay-500">
            <div className="relative rounded-[2rem] bg-slate-900 p-3 shadow-2xl border border-slate-800 rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
                <div className="rounded-[1.5rem] overflow-hidden bg-slate-100 relative aspect-video">
                     {/* Fake Interface */}
                     <div className="absolute inset-0 flex">
                        <div className="w-1/3 bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-4">
                            <div className="flex gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="w-24 h-24 rounded-full bg-slate-200 mx-auto mb-4 overflow-hidden">
                                <img src="https://picsum.photos/400/400?random=1" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 bg-slate-200 rounded w-3/4 mx-auto"></div>
                                <div className="h-2 bg-slate-200 rounded w-1/2 mx-auto"></div>
                            </div>
                            <div className="mt-auto p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-slate-400">HEART RATE</span>
                                    <HeartIcon className="w-3 h-3 text-red-500" />
                                </div>
                                <div className="text-2xl font-bold text-slate-800">112 <span className="text-xs font-normal text-slate-400">bpm</span></div>
                            </div>
                        </div>
                        <div className="w-2/3 bg-white p-8 flex flex-col">
                            <div className="flex-1 space-y-4">
                                <div className="p-4 rounded-xl rounded-tl-none bg-slate-100 max-w-[80%] text-sm text-slate-600">
                                    My chest feels tight, like someone is sitting on it. It started about an hour ago.
                                </div>
                                <div className="p-4 rounded-xl rounded-tr-none bg-emerald-500 text-white max-w-[80%] ml-auto text-sm">
                                    Does the pain radiate anywhere? Do you have any shortness of breath?
                                </div>
                                <div className="p-4 rounded-xl rounded-tl-none bg-slate-100 max-w-[80%] text-sm text-slate-600">
                                    Yes, it goes up to my jaw. And I feel a bit winded, yeah.
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
            
            {/* Floating Elements */}
            <GlassCard className="absolute -top-12 -right-8 w-64 animate-bounce delay-700" noPadding>
                <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Diagnosis</p>
                        <p className="text-sm font-bold text-slate-900">Acute MI Confirmed</p>
                    </div>
                </div>
            </GlassCard>

             <GlassCard className="absolute -bottom-8 -left-8 w-56 animate-bounce delay-1000" noPadding>
                <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Mic className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Voice Input</p>
                        <p className="text-sm font-bold text-slate-900">Listening...</p>
                    </div>
                </div>
            </GlassCard>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-10 border-y border-slate-200/60 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by medical students at</p>
            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Mock Logos */}
               <h3 className="text-xl font-bold font-serif text-slate-800">Stanford Medicine</h3>
               <h3 className="text-xl font-bold font-serif text-slate-800">Johns Hopkins</h3>
               <h3 className="text-xl font-bold font-serif text-slate-800">Mayo Clinic</h3>
               <h3 className="text-xl font-bold font-serif text-slate-800">UCSF Health</h3>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Complete Clinical Mastery</h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">Everything you need to ace your exams and prepare for real-world practice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: 'Reactive AI Patients', desc: 'Patients with dynamic emotions, hidden agendas, and realistic physiological responses.', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { title: 'Natural Voice', desc: 'Speak naturally to your patient. Our AI understands medical terminology and nuance.', icon: Mic, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { title: 'USMLE Evaluation', desc: 'Get scored on 6 core competencies with detailed feedback on every interaction.', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map((feat, i) => (
                    <GlassCard key={i} className="hover:scale-105 transition-transform duration-300">
                        <div className={`w-14 h-14 rounded-2xl ${feat.bg} ${feat.color} flex items-center justify-center mb-6`}>
                            <feat.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
                        <p className="text-slate-500 leading-relaxed">
                            {feat.desc}
                        </p>
                    </GlassCard>
                ))}
            </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[150px] rounded-full"></div>
         <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <div className="flex justify-center mb-8 text-emerald-400">
                {[...Array(5)].map((_,i) => <Star key={i} className="w-6 h-6 fill-current" />)}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-8">
                "I used OSCE Master for 2 weeks before my Step 2 CS. The feedback on empathy and data gathering was spot on. I passed with high performance."
            </h2>
            <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="" />
                </div>
                <div className="text-left">
                    <p className="font-bold text-lg">Sarah Jenkins</p>
                    <p className="text-slate-400 text-sm">3rd Year Medical Student, UCLA</p>
                </div>
            </div>
         </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-5xl mx-auto px-6 text-center">
         <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
             <div className="relative z-10">
                 <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Ready to start your rotation?</h2>
                 <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">Join 10,000+ medical students mastering their clinical skills today.</p>
                 <button 
                    onClick={() => navigate('/dashboard')}
                    className="h-14 px-10 rounded-full bg-slate-900 text-white font-bold text-lg shadow-xl shadow-slate-900/20 hover:bg-emerald-600 transition-all hover:scale-105"
                 >
                    Get Started for Free
                 </button>
             </div>
             
             {/* Decor */}
             <Stethoscope className="absolute -bottom-10 -right-10 w-64 h-64 text-emerald-500/10 rotate-12" />
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                    <Activity className="text-white w-4 h-4" />
                 </div>
                 <span className="font-bold text-slate-900">OSCE Master</span>
            </div>
            <div className="text-slate-500 text-sm">
                © 2024 OSCE Master Inc. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm font-semibold text-slate-600">
                <a href="#" className="hover:text-slate-900">Privacy</a>
                <a href="#" className="hover:text-slate-900">Terms</a>
                <a href="#" className="hover:text-slate-900">Contact</a>
            </div>
         </div>
      </footer>

    </div>
  );
};

// Mini icon component for mockup
const HeartIcon = ({className}:{className?:string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
)

export default Landing;