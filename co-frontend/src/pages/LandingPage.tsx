import { Vote, Shield, Users, TrendingUp, ChevronRight, Sparkles, Lock, Eye, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export const LandingPage = () => {
  const [activeCard, setActiveCard] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Shield, title: 'Immutable Records', desc: 'Votes stored permanently on blockchain' },
    { icon: Eye, title: 'Full Transparency', desc: 'Audit trails for every transaction' },
    { icon: Lock, title: 'Secure & Private', desc: 'Cryptographic voter authentication' },
    { icon: CheckCircle, title: 'Instant Verification', desc: 'Real-time vote counting & results' }
  ];

  const userTypes = [
    {
      role: 'Admins',
      icon: Users,
      desc: 'Create and manage elections, verify participants, and oversee the entire voting process.',
      color: 'from-purple-500 to-pink-500',
      loginPath: '/admin/login',
      registerPath: '/admin/register'
    },
    {
      role: 'Voters',
      icon: Vote,
      desc: 'Register to vote and cast your ballot securely with complete anonymity and transparency.',
      color: 'from-blue-500 to-cyan-500',
      loginPath: '/voter/login',
      registerPath: '/voter/register'
    },
    {
      role: 'Candidates',
      icon: TrendingUp,
      desc: 'Stand for election, present your manifesto, and connect with voters on the platform.',
      color: 'from-emerald-500 to-teal-500',
      loginPath: '/candidate/login',
      registerPath: '/candidate/register'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${-scrollY * 0.3}px)`, animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20 opacity-0 animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
              Powered by Blockchain Technology
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
            The Future of Voting
            <br />
            <span className="text-5xl md:text-6xl">Is Here</span>
          </h1>

          <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            Experience secure, transparent, and verifiable elections powered by smart contracts.
            Every vote counts, every vote matters, and every vote is immutably recorded.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/elections"
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 font-semibold shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/60 flex items-center gap-2"
            >
              Browse Active Elections
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <button className="px-8 py-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105">
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 opacity-0 animate-fadeIn"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <feature.icon className="w-10 h-10 mb-4 text-purple-400 group-hover:text-purple-300 transition-colors group-hover:scale-110 duration-300" />
              <h3 className="font-bold mb-2 text-lg">{feature.title}</h3>
              <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* User Type Cards */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Get Started Today
          </h2>
          <p className="text-center text-slate-400 mb-12 text-lg">
            Choose your role and join the revolution in democratic voting
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((user, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setActiveCard(idx)}
                onMouseLeave={() => setActiveCard(0)}
                className={`group relative p-8 rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-2 transition-all duration-500 backdrop-blur-sm ${activeCard === idx
                    ? 'border-transparent scale-105 shadow-2xl'
                    : 'border-slate-700/50 hover:border-slate-600/50'
                  }`}
                style={{
                  boxShadow: activeCard === idx ? '0 25px 50px -12px rgba(139, 92, 246, 0.3)' : 'none'
                }}
              >
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${user.color} blur-xl -z-10`}
                />

                {/* Icon with gradient background */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${user.color} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                    <user.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-3 group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-200 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {user.role}
                </h3>

                <p className="text-slate-400 mb-6 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {user.desc}
                </p>

                <div className="flex gap-3">
                  <a
                    href={user.loginPath}
                    className={`flex-1 px-4 py-3 rounded-xl bg-gradient-to-r ${user.color} font-semibold text-center hover:shadow-lg transition-all duration-300 hover:scale-105`}
                  >
                    Login
                  </a>
                  <a
                    href={user.registerPath}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600 font-semibold text-center transition-all duration-300 hover:scale-105"
                  >
                    Register
                  </a>
                </div>

                {/* Corner decoration */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${user.color} opacity-0 group-hover:opacity-10 rounded-3xl blur-2xl transition-opacity duration-500`} />
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 p-12 rounded-3xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 backdrop-blur-sm">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-slate-400 group-hover:text-slate-300 transition-colors">
                Transparent & Auditable
              </div>
            </div>
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Instant
              </div>
              <div className="text-slate-400 group-hover:text-slate-300 transition-colors">
                Vote Verification
              </div>
            </div>
            <div className="group hover:scale-110 transition-transform duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                Zero
              </div>
              <div className="text-slate-400 group-hover:text-slate-300 transition-colors">
                Fraud Possibility
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};