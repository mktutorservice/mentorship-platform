import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0f0f17] text-white flex flex-col justify-between selection:bg-[#B38728] selection:text-white">
      
      {/* HEADER NAVBAR WITH GEOMETRIC LOGO & LOGIN BUTTON */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between p-6 md:p-10 z-30">
        
        {/* GEOMETRIC LOGO: UNKNOWN MENTORSHIP */}
        <Link href="/" className="flex items-center gap-2 group">
          <svg
            viewBox="0 0 470 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 md:h-6 w-auto"
          >
            {/* U */}
            <path d="M5 2 V16 A6 6 0 0 0 17 16 V2" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            
            {/* N */}
            <path d="M27 22 V2 L45 22 V2" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            
            {/* K */}
            <path d="M55 2 V22 M69 2 L55 12 L69 22" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            
            {/* N */}
            <path d="M79 22 V2 L97 22 V2" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            
            {/* O */}
            <circle cx="117" cy="12" r="10" stroke="white" strokeWidth="3.5" />
            
            {/* W */}
            <path d="M137 2 L143 22 L149 10 L155 22 L161 2" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            
            {/* N */}
            <path d="M171 22 V2 L189 22 V2" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />

            {/* M */}
            <path d="M214 22 V2 L222 14 L230 2 V22" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            
            {/* E */}
            <path d="M254 2 H240 V22 H254 M240 12 H250" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            
            {/* N */}
            <path d="M264 22 V2 L282 22 V2" stroke="white" strokeWidth="3.5" strokeLinecap="square" strokeLinejoin="miter" />
            
            {/* T */}
            <path d="M292 2 H312 M302 2 V22" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            
            {/* O */}
            <circle cx="328" cy="12" r="10" stroke="white" strokeWidth="3.5" />
            
            {/* R */}
            <path d="M346 22 V2 H356 A5 5 0 0 1 356 12 H346 M354 12 L362 22" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            
            {/* S */}
            <path d="M384 6 C384 2, 372 2, 372 7 C372 12, 384 12, 384 17 C384 22, 372 22, 372 18" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            
            {/* H */}
            <path d="M394 2 V22 M394 12 H410 M410 2 V22" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            
            {/* I */}
            <path d="M420 2 V22" stroke="white" strokeWidth="3.5" strokeLinecap="square" />
            
            {/* P */}
            <path d="M430 22 V2 H442 A5 5 0 0 1 442 12 H430" stroke="white" strokeWidth="3.5" strokeLinecap="square" />

            {/* ACCENT PERIOD */}
            <rect x="452" y="18" width="4" height="4" fill="#B38728" />
          </svg>
        </Link>

        {/* LOGIN BUTTON */}
        <Link 
          href="/login" 
          className="relative inline-block hover:scale-105 transition-transform duration-300"
        >
          <Image
            src="/login-btn.png"
            alt="Login"
            width={70}
            height={40}
            className="brightness-0 invert object-contain h-auto w-16 md:w-20" 
            priority
          />
        </Link>
      </header>

      {/* SECTION 1: HERO / TOP SECTION */}
      <section className="relative w-full max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative space-y-6 z-10">
          <span className="absolute -top-10 -left-6 text-7xl md:text-9xl font-black text-white/5 select-none pointer-events-none uppercase tracking-tighter">
            Connect
          </span>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            <span className="font-thamrah gold-text text-5xl md:text-7xl block mb-2">
              Entitlements
            </span>
            <span className="text-white">
              & Growth Strategy
            </span>
          </h1>

          <p className="font-tech gold-text text-xs md:text-sm max-w-lg leading-relaxed uppercase tracking-wider">
            Accelerate your engineering workflow through direct peer collaboration, structured 
            learning frameworks, and personalized technical mentorship tailored to your targets.
          </p>

          <div className="pt-2">
            <Link
              href="/login"
              className="gold-bg font-tech inline-block font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-xl hover:scale-105 transition duration-300"
            >
              START UR JOURNEY WITH US
            </Link>
          </div>
        </div>

        <div className="relative w-full h-[320px] md:h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
          <Image
            src="/card1.jpg"
            alt="Mentorship Platform Hero"
            fill
            priority
            className="object-cover group-hover:scale-105 transition duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f17] via-transparent to-transparent opacity-60" />
        </div>
      </section>

      {/* SECTION 2: ABOUT / FEATURE SECTION */}
      <section className="relative w-full bg-[#151521] py-20 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative w-full h-[350px] md:h-[480px] rounded-2xl overflow-hidden shadow-2xl [clip-path:polygon(0_0,100%_8%,88%_100%,0_100%)] border border-white/10">
            <Image
              src="/card2.jpg"
              alt="About Our Platform"
              fill
              className="object-cover hover:scale-105 transition duration-700 ease-out"
            />
          </div>

          <div className="relative space-y-6">
            <span className="absolute -top-12 right-0 text-7xl md:text-9xl font-black text-white/5 select-none pointer-events-none uppercase tracking-tighter">
              About
            </span>

            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              About <span className="gold-text font-thamrah">Us</span>
            </h2>

            <p className="font-tech text-xs md:text-sm text-gray-300 leading-relaxed max-w-xl tracking-wide">
              We connect aspiring developers and engineers with industry-vetted mentors to bridge the gap 
              between academic theory and hands-on production code. Engage in live classrooms, request 
              detailed code architecture reviews, and build real-world software together.
            </p>

            <div className="pt-4">
              <Link
                href="/login"
                className="gold-bg font-tech inline-block font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-xl hover:scale-105 transition duration-300"
              >
                View More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: 3-CARD CLASSROOMS GRID */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] gold-text font-tech font-semibold">
            LEVERAGE YOUR FUTURE
          </span>
          <h2 className="text-4xl md:text-6xl font-serif tracking-tight text-white">
            Explore Active <span className="italic font-normal gold-text">Classrooms</span>
          </h2>
          <p className="text-xs md:text-sm text-gray-400 max-w-lg mx-auto font-light leading-relaxed">
            Choose a path to level up your technical domain with guided sessions, 1-on-1 feedback, and peer collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          
          {/* Card 1 */}
          <div className="bg-[#171722] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-[#B38728]/60 transition duration-300 group shadow-2xl">
            <div className="relative w-full h-52 rounded-xl overflow-hidden bg-gray-900">
              <Image
                src="/card1.jpg"
                alt="Live Code Audits"
                fill
                className="object-cover group-hover:scale-105 transition duration-500 ease-out"
              />
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] gold-text font-tech font-bold">
                  WORKSHOP
                </span>
                <h3 className="text-2xl font-serif text-white mt-1">
                  Live Code Audits
                </h3>
                <p className="text-xs text-gray-400 font-light mt-2 leading-relaxed">
                  Collaborative architecture, direct code refactoring, and real-time debugging sessions.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 text-xs font-semibold text-white group-hover:text-[#FCF6BA] transition"
                >
                  <span className="font-tech">Explore Hub</span>
                  <span className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#FCF6BA] group-hover:translate-x-1 transition duration-300">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#171722] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-[#B38728]/60 transition duration-300 group shadow-2xl">
            <div className="relative w-full h-52 rounded-xl overflow-hidden bg-gray-900">
              <Image
                src="/card2.jpg"
                alt="Personalized Mentorship"
                fill
                className="object-cover group-hover:scale-105 transition duration-500 ease-out"
              />
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] gold-text font-tech font-bold">
                  1-ON-1 GUIDANCE
                </span>
                <h3 className="text-2xl font-serif text-white mt-1">
                  Personal Mentorship
                </h3>
                <p className="text-xs text-gray-400 font-light mt-2 leading-relaxed">
                  Tailored learning roadmaps, direct reviews, and scheduled consultations with experts.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 text-xs font-semibold text-white group-hover:text-[#FCF6BA] transition"
                >
                  <span className="font-tech">Book Session</span>
                  <span className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#FCF6BA] group-hover:translate-x-1 transition duration-300">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#171722] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-6 hover:border-[#B38728]/60 transition duration-300 group shadow-2xl">
            <div className="relative w-full h-52 rounded-xl overflow-hidden bg-gray-900">
              <Image
                src="/card3.jpg"
                alt="Peer Network"
                fill
                className="object-cover group-hover:scale-105 transition duration-500 ease-out"
              />
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] gold-text font-tech font-bold">
                  COMMUNITY
                </span>
                <h3 className="text-2xl font-serif text-white mt-1">
                  Peer Network
                </h3>
                <p className="text-xs text-gray-400 font-light mt-2 leading-relaxed">
                  Share knowledge, manage team repos, and track real-time build progress with peers.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-3 text-xs font-semibold text-white group-hover:text-[#FCF6BA] transition"
                >
                  <span className="font-tech">Join Community</span>
                  <span className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#FCF6BA] group-hover:translate-x-1 transition duration-300">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/5 py-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} MentorshipPlatform Inc. All rights reserved.
      </footer>

    </main>
  );
}