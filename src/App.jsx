import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowUpRight, Check } from 'lucide-react'

const VIDEO_URL = `${import.meta.env.BASE_URL}media/character-scrub.mp4`
const SERVICE_OPTIONS = ['Brand', 'Digital', 'Campaign', 'Other']
const PLATFORMS = ['Figma', 'Framer', 'Webflow', 'Vercel', 'Shopify', 'Notion']

const SIGNAL_ITEMS = [
  {
    number: '01',
    title: 'POSITION',
    copy: 'Find the sharpest version of what makes you impossible to replace.',
  },
  {
    number: '02',
    title: 'FORM',
    copy: 'Shape identity and interface into a first impression that stays.',
  },
  {
    number: '03',
    title: 'FLOW',
    copy: 'Build the path from curiosity to the action that counts.',
  },
  {
    number: '04',
    title: 'FORWARD',
    copy: 'Keep refining the momentum once your next market arrives.',
  },
]

const WORK_ITEMS = [
  {
    category: 'NEW CATEGORY',
    title: 'BLUE\nSHIFT',
    copy: 'A product story shaped for the moment a new category opens.',
    tags: 'BRAND / WEB / GROWTH',
    className: 'bg-[#176DF4] text-white',
  },
  {
    category: 'EDITORIAL WEB',
    title: 'FIELD\nNOTES',
    copy: 'An editorial experience for a company whose expertise travels faster than it speaks.',
    tags: 'STRATEGY / DESIGN',
    className: 'bg-[#08111F] text-white',
  },
  {
    category: 'DIGITAL DIRECTION',
    title: 'ORBIT\nHOUSE',
    copy: 'A sharp digital destination designed to make an invitation feel inevitable.',
    tags: 'IDENTITY / PLATFORM',
    className: 'bg-[#EDF3FF] text-[#08111F] border border-[#B9CAE8]',
  },
]

function useTypewriter(text, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let intervalId
    setDisplayed('')
    setDone(false)

    const timeoutId = window.setTimeout(() => {
      let index = 0
      intervalId = window.setInterval(() => {
        index += 1
        setDisplayed(text.slice(0, index))

        if (index >= text.length) {
          window.clearInterval(intervalId)
          setDone(true)
        }
      }, speed)
    }, startDelay)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [text, speed, startDelay])

  return { displayed, done }
}

function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function BackgroundVideo() {
  const videoRef = useRef(null)
  const previousXRef = useRef(null)
  const targetTimeRef = useRef(0)
  const smoothedTimeRef = useRef(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    let animationFrameId
    let previousFrameTime = performance.now()
    let previousCommitTime = 0

    const renderScrubFrame = (frameTime) => {
      const elapsed = Math.min(64, frameTime - previousFrameTime)
      previousFrameTime = frameTime

      if (window.innerWidth >= 1024 && Number.isFinite(video.duration) && video.duration > 0) {
        const target = Math.max(0, Math.min(video.duration, targetTimeRef.current))
        const easing = 1 - Math.exp(-elapsed / 26)
        smoothedTimeRef.current += (target - smoothedTimeRef.current) * easing

        if (Math.abs(target - smoothedTimeRef.current) < 0.001) {
          smoothedTimeRef.current = target
        }

        if (
          !video.seeking &&
          frameTime - previousCommitTime >= 1000 / 30 &&
          Math.abs(video.currentTime - smoothedTimeRef.current) > 1 / 240
        ) {
          previousCommitTime = frameTime
          video.currentTime = smoothedTimeRef.current
        }
      }

      animationFrameId = window.requestAnimationFrame(renderScrubFrame)
    }

    const handleMouseMove = (event) => {
      if (window.innerWidth < 1024) {
        previousXRef.current = null
        return
      }

      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        previousXRef.current = event.clientX
        return
      }

      if (previousXRef.current === null) {
        previousXRef.current = event.clientX
        const cursorProgress = event.clientX / window.innerWidth
        targetTimeRef.current = Math.max(
          0,
          Math.min(video.duration, (0.1 + cursorProgress * 0.8) * video.duration),
        )
        return
      }

      const delta = event.clientX - previousXRef.current
      previousXRef.current = event.clientX
      targetTimeRef.current = Math.max(
        0,
        Math.min(
          video.duration,
          targetTimeRef.current + (delta / window.innerWidth) * 0.8 * video.duration,
        ),
      )
    }

    const resetCursorTracking = () => {
      previousXRef.current = null
    }

    const handleLoadedMetadata = () => {
      targetTimeRef.current = video.currentTime
      smoothedTimeRef.current = video.currentTime
    }

    const handleSeeked = () => {
      if (Math.abs(video.currentTime - smoothedTimeRef.current) < 1 / 60) {
        smoothedTimeRef.current = video.currentTime
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', resetCursorTracking)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('seeked', handleSeeked)
    animationFrameId = window.requestAnimationFrame(renderScrubFrame)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', resetCursorTracking)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('seeked', handleSeeked)
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    const syncPlaybackMode = () => {
      if (window.innerWidth < 1024) {
        video.autoplay = true
        void video.play().catch(() => {})
      } else {
        video.autoplay = false
        video.pause()
      }
    }

    syncPlaybackMode()
    window.addEventListener('resize', syncPlaybackMode, { passive: true })
    return () => window.removeEventListener('resize', syncPlaybackMode)
  }, [])

  return (
    <motion.div
      className="order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-[#EDF3FF] lg:bg-transparent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover object-right lg:object-right-bottom"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-[#EDF3FF]/20 via-transparent to-[#DBE8FF]/10" />
    </motion.div>
  )
}

function Navbar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const links = [
    ['System', '#system'],
    ['Signal', '#signal'],
    ['Work', '#work'],
    ['Contact', '#contact'],
  ]

  return (
    <>
      <header className="fixed top-3 sm:top-4 inset-x-3 sm:inset-x-5 z-50 px-4 sm:px-6 py-3 flex flex-row justify-between items-center rounded-full border border-white/70 bg-white/60 supports-[backdrop-filter]:bg-white/45 backdrop-blur-2xl shadow-[0_14px_50px_rgba(8,17,31,0.14)]">
        <a href="#top" className="flex flex-row items-center gap-2.5" aria-label="Thrivepix home">
          <span className="text-[18px] sm:text-[21px] tracking-[-0.035em] text-black font-extrabold select-none">
            THRIVEPIX<sup className="text-[9px] ml-0.5">®</sup>
          </span>
          <span className="text-[22px] sm:text-[25px] text-[#176DF4] select-none font-medium leading-none mb-0.5">
            &#10033;
          </span>
        </a>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 flex-row items-center gap-7 md:flex text-[15px] text-black">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="hover:opacity-50 transition-opacity">
              {label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          className="hidden md:inline-flex items-center gap-1.5 text-[14px] font-medium uppercase tracking-[0.08em] text-black hover:opacity-55 transition-opacity"
        >
          Start a signal <ArrowUpRight size={15} />
        </a>

        <button
          type="button"
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="flex flex-col gap-[5px] md:hidden"
        >
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-black transition-all duration-300 ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </header>

      <div
        aria-hidden={!isMobileMenuOpen}
        className={`fixed inset-0 z-40 bg-[#EDF3FF]/92 backdrop-blur-2xl transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-5 text-4xl tracking-tight text-black">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="transition-opacity hover:opacity-60"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </>
  )
}

function Hero() {
  const { displayed, done } = useTypewriter('MAKE YOUR\nMARK MOVE.', 34, 550)

  return (
    <section id="top" className="relative flex flex-col lg:block lg:min-h-screen">
      <BackgroundVideo />
      <div className="relative z-10 flex flex-col order-first lg:order-none w-full bg-[#EDF3FF] lg:bg-transparent pb-8 lg:pb-0 lg:min-h-screen">
        <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
          <div className="w-full pt-24 sm:pt-28 lg:w-[54%] lg:pt-20 xl:w-[51%]">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mb-7 text-[11px] font-bold uppercase tracking-[0.2em] text-[#176DF4]"
            >
              Built in India / Designed for everywhere
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-[52px] sm:text-6xl lg:text-[74px] xl:text-[82px] font-black tracking-[-0.065em] text-[#08111F] leading-[0.89] mb-8 select-none w-full whitespace-pre-wrap">
                {displayed}
                {!done && (
                  <span className="inline-block w-[3px] h-[0.9em] bg-[#176DF4] align-middle ml-[5px] animate-blink" />
                )}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-[#52617A] leading-relaxed font-normal mb-9 max-w-xl"
            >
              We turn ambitious brands into digital experiences that cross borders, hold attention,
              and make the next market feel closer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4"
            >
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.025 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-full bg-[#176DF4] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/15"
              >
                Build your presence <ArrowUpRight size={16} />
              </motion.a>
              <a
                href="#system"
                className="inline-flex items-center gap-2 px-2 py-3 text-sm font-bold text-[#08111F] transition-opacity hover:opacity-55"
              >
                Explore the system <ArrowDown size={16} />
              </a>
            </motion.div>

            <p className="mt-10 text-xs tracking-[0.08em] text-[#52617A]">
              A creative partner for brands with somewhere to go.
            </p>
          </div>
        </main>
      </div>
    </section>
  )
}

function PlatformMarquee() {
  const repeatedPlatforms = [...PLATFORMS, ...PLATFORMS]

  return (
    <section aria-label="Digital platforms" className="overflow-hidden border-y border-[#08111F]/15 bg-[#EDF3FF] py-5">
      <div className="platform-track flex w-max items-center">
        {repeatedPlatforms.map((platform, index) => (
          <div key={`${platform}-${index}`} className="flex items-center">
            <span className="px-8 text-sm font-bold uppercase tracking-[0.18em] text-black/70 sm:px-12">
              {platform}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#176DF4]" />
          </div>
        ))}
      </div>
    </section>
  )
}

function DifferenceSection() {
  return (
    <section className="bg-[#F8FBFF] px-6 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#176DF4]">
            The Thrivepix difference
          </p>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.065em] text-[#08111F] sm:text-7xl lg:text-[92px]">
            DON'T JUST<br />SHOW UP.<br />ARRIVE.
          </h2>
          <p className="mt-10 max-w-2xl text-lg leading-relaxed text-[#52617A] md:text-xl">
            Ambitious brands do not need a louder website. They need a point of view that is clear
            at every distance: in a first glance, a sales call, and a second market.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function SignalSystem() {
  return (
    <section id="system" className="bg-[#08111F] px-4 py-20 text-white sm:px-6 sm:py-28 lg:py-36">
      <div className="mx-auto w-full max-w-7xl">
        <Reveal className="grid gap-7 border-b border-white/15 pb-12 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#176DF4]">
              One connected build
            </p>
            <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.065em] sm:text-7xl lg:text-[86px]">
              THE SIGNAL<br />SYSTEM.
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-white/60 lg:justify-self-end">
            One strategic system, tailored to the exact point your brand needs to make next.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4">
          {SIGNAL_ITEMS.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.06 }}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
              className="group flex min-h-72 flex-col justify-between border-b border-white/15 p-6 md:border-r lg:min-h-80 lg:border-b-0"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs text-white/35">{item.number}</span>
                <ArrowUpRight className="text-white/35 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-white" size={18} />
              </div>
              <div>
                <h3 className="mb-4 text-3xl font-bold tracking-[-0.045em]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[#B9CAE8]">{item.copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function BeliefSection() {
  return (
    <section id="signal" className="overflow-hidden bg-[#DBE8FF] px-6 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto grid w-full max-w-7xl gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <p className="mb-7 text-[11px] font-bold uppercase tracking-[0.2em] text-[#176DF4]">
            What we believe
          </p>
          <h2 className="text-5xl font-black leading-[0.91] tracking-[-0.065em] text-[#08111F] sm:text-7xl lg:text-[84px]">
            A GREAT SITE<br />SHOULD FEEL LIKE<br />A PASSPORT.
          </h2>
          <p className="mt-9 max-w-xl text-lg leading-relaxed text-[#52617A] md:text-xl">
            It carries your point of view further than you can, without losing what makes it yours.
          </p>
          <a href="#work" className="mt-9 inline-flex items-center gap-2 text-sm font-bold text-[#176DF4] hover:opacity-55">
            See the proof <ArrowDown size={16} />
          </a>
        </Reveal>

        <Reveal delay={0.08} className="relative mx-auto aspect-square w-full max-w-[31rem]">
          <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_35%_25%,#ffffff_0%,#DBE8FF_18%,#176DF4_58%,#0845A7_100%)] shadow-[0_45px_100px_rgba(8,69,167,0.28)]" />
          <motion.div
            className="absolute inset-[2%] rounded-full border border-[#0845A7]/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            <span className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#176DF4] shadow-[0_0_0_8px_rgba(23,109,244,0.12)]" />
          </motion.div>
          <div className="absolute inset-[23%] rounded-full border border-white/30" />
          <p className="absolute inset-x-0 bottom-0 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-[#3B527A]">
            Made to cross the line
          </p>
        </Reveal>
      </div>
    </section>
  )
}

function WorkSection() {
  return (
    <section id="work" className="bg-white px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-7xl">
        <Reveal className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[#176DF4]">
              Selected directions
            </p>
            <h2 className="text-5xl font-black leading-[0.9] tracking-[-0.065em] text-[#08111F] sm:text-7xl lg:text-[88px]">
              SIGNALS THAT<br />STICK.
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-[#52617A] lg:justify-self-end">
            Three ways Thrivepix can make a lasting impression feel completely your own.
          </p>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-3">
          {WORK_ITEMS.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.65, delay: index * 0.08 }}
              whileHover={{ y: -7 }}
              className={`group flex min-h-[31rem] flex-col justify-between overflow-hidden rounded-[2rem] p-7 transition-shadow hover:shadow-2xl ${item.className}`}
            >
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] opacity-55">
                <span>{item.category}</span>
                <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <div>
                <h3 className="whitespace-pre-line text-5xl font-extrabold leading-[0.88] tracking-[-0.065em] sm:text-6xl">
                  {item.title}
                </h3>
                <p className="mt-7 max-w-xs text-sm leading-relaxed opacity-65">{item.copy}</p>
                <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-45">
                  {item.tags}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ApproachSection() {
  const statements = [
    ['Clear enough to cross cultures.', 'Specific enough to matter.'],
    ['Built with editorial depth.', 'Engineered to move fast.'],
    ['Made in India with a long-range eye.', 'Never made to blend in.'],
  ]

  return (
    <section className="border-y border-[#08111F]/10 bg-white px-6 py-24 sm:py-32 lg:py-40">
      <div className="mx-auto grid w-full max-w-7xl gap-16 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <p className="mb-7 text-[11px] font-bold uppercase tracking-[0.2em] text-[#176DF4]">
            Why Thrivepix
          </p>
          <h2 className="text-5xl font-black leading-[0.91] tracking-[-0.065em] text-[#08111F] sm:text-7xl lg:text-[78px]">
            THE INTERNET<br />IS EVERYWHERE.<br />YOUR NEXT CLIENT<br />CAN BE TOO.
          </h2>
        </Reveal>

        <div className="self-end">
          {statements.map(([primary, secondary], index) => (
            <Reveal key={primary} delay={index * 0.06}>
              <div className="border-t border-black/15 py-7">
                <p className="text-xl font-bold tracking-[-0.035em] text-[#08111F] sm:text-2xl">{primary}</p>
                <p className="mt-2 text-lg text-[#52617A]">{secondary}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceSelector({ services, setServices }) {
  const toggleService = (service) => {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    )
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 text-[#08111F] shadow-[0_30px_90px_rgba(8,17,31,0.2)] sm:p-8">
      <h3 className="text-2xl font-extrabold tracking-[-0.035em] mb-2">What sort of service?</h3>
      <p className="opacity-85 text-[#52617A] mb-7">Select all that apply</p>

      <div className="mb-6 flex flex-wrap gap-3">
        {SERVICE_OPTIONS.map((service) => {
          const isActive = services.includes(service)
          return (
            <motion.button
              key={service}
              type="button"
              aria-pressed={isActive}
              onClick={() => toggleService(service)}
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.97 }}
              layout
              className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-300 ${
                isActive
                  ? 'bg-[#176DF4] text-white shadow-md shadow-blue-950/10'
                  : 'border border-[#B9CAE8] bg-white text-[#08111F] hover:bg-[#F0F6FF]'
              }`}
            >
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: 'auto' }}
                    exit={{ opacity: 0, scale: 0, width: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="inline-flex overflow-hidden"
                  >
                    <Check size={16} strokeWidth={2.2} />
                  </motion.span>
                )}
              </AnimatePresence>
              {service}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {services.length === 0 ? (
          <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} exit={{ opacity: 0 }} className="text-xs italic">
            Please click to select services above.
          </motion.p>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 rounded-2xl border border-[#DCE9FF] bg-[#F8FBFF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#3B527A]">Ready to inquire about: {services.join(', ')}</p>
              <a
                href={`mailto:hello@thrivepix.studio?subject=${encodeURIComponent(`Project inquiry: ${services.join(', ')}`)}`}
                className="inline-flex items-center gap-1 self-start text-xs uppercase tracking-[0.12em] text-[#176DF4] sm:self-auto"
              >
                Let's go <ArrowUpRight size={15} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ContactSection({ services, setServices }) {
  return (
    <section id="contact" className="bg-[#0B172A] px-6 py-24 text-white sm:py-32 lg:py-40">
      <div className="mx-auto grid w-full max-w-7xl gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <Reveal>
          <p className="mb-7 text-[11px] font-bold uppercase tracking-[0.2em] text-[#176DF4]">
            The next move is yours
          </p>
          <h2 className="text-5xl font-black leading-[0.89] tracking-[-0.065em] sm:text-7xl lg:text-[88px]">
            TAKE YOUR<br />BRAND FURTHER.
          </h2>
          <p className="mt-9 max-w-xl text-lg leading-relaxed text-white/60 md:text-xl">
            Tell us where you are going. We will give the world a reason to follow.
          </p>
          <a
            href="mailto:hello@thrivepix.studio"
            className="mt-9 inline-flex items-center gap-2 text-sm font-bold text-white transition-opacity hover:opacity-55"
          >
            Start the conversation <ArrowUpRight size={16} />
          </a>
        </Reveal>
        <Reveal delay={0.08}>
          <ServiceSelector services={services} setServices={setServices} />
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#08111F] px-6 py-8 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 text-xs uppercase tracking-[0.12em] text-[#91A5C7] sm:flex-row sm:items-center sm:justify-between">
        <a href="#top" className="text-lg font-semibold tracking-tight text-white">
          THRIVEPIX<sup className="ml-0.5 text-[8px]">®</sup>
        </a>
        <span>© 2026 Thrivepix Studio</span>
        <a href="#top" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
          Back to top <span>↑</span>
        </a>
      </div>
    </footer>
  )
}

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [services, setServices] = useState([])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false)
    }

    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen])

  return (
    <div className="relative bg-[#EDF3FF] text-[#08111F] font-sans selection:bg-[#DBE8FF] selection:text-[#08111F] antialiased overflow-x-hidden">
      <Navbar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <main>
        <Hero />
        <PlatformMarquee />
        <DifferenceSection />
        <SignalSystem />
        <BeliefSection />
        <WorkSection />
        <ApproachSection />
        <ContactSection services={services} setServices={setServices} />
      </main>
      <Footer />
    </div>
  )
}
