import { useState } from 'react'
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { CalendarDays, House, Map as MapIcon, MessageCircle, Search, Sprout, UserRound, Wrench } from 'lucide-react'
import { nowOf, useKudzu } from './store/useKudzu'
import { OverlayContext, Toast } from './components/ui'
import { APP_NAME, TAGLINE } from './config/brand'
import { inSchool, incomingRequests } from './services'
import Find from './screens/Find'
import Home from './screens/Home'
import Messages from './screens/Messages'
import ChatThread from './screens/ChatThread'
import Network from './screens/Network'
import ConnectionDetail from './screens/ConnectionDetail'
import Events from './screens/Events'
import EventDetail, { EventPopup } from './screens/EventDetail'
import EventChat from './screens/EventChat'
import { PushBanner } from './components/Announcements'
import { Tour } from './components/Tour'
import { TourOffer } from './components/TourOffer'
import GroupDetail from './screens/GroupDetail'
import Profile from './screens/Profile'
import UserProfile from './screens/UserProfile'
import Guidelines from './screens/Guidelines'
import Cohort from './screens/Cohort'
import Known from './screens/Known'
import Onboarding from './screens/Onboarding'
import CheckInSheet from './components/CheckInSheet'
import DemoPanel from './components/DemoPanel'

const TABS = [
  { to: '/find', label: 'Find', icon: Search, tour: 'find' },
  { to: '/events', label: 'Events', icon: CalendarDays, tour: 'events' },
  { to: '/network', label: 'Network', icon: Sprout, tour: 'network' },
  { to: '/messages', label: 'Messages', icon: MessageCircle, tour: 'messages' },
  { to: '/profile', label: 'Profile', icon: UserRound, tour: 'profile' },
]

/** The simple app keeps four tabs: the people you know, where they are, your messages, and you. */
const SIMPLE_TABS = [
  { to: '/home', label: 'Home', icon: House, tour: 'home' },
  { to: '/network', label: 'Map', icon: MapIcon, tour: 'map' },
  { to: '/messages', label: 'Messages', icon: MessageCircle, tour: 'messages' },
  { to: '/profile', label: 'Profile', icon: UserRound, tour: 'profile' },
]

function TabBar({ tabs }: { tabs: typeof TABS }) {
  // unread conversations, plus requests waiting on you, which now live on this tab in the full app
  const unread = useKudzu((s) => s.conversations.filter((c) => c.unread && inSchool(c.otherId, s.schoolId) && !s.blocked.includes(c.otherId)).length + (s.experience === 'simple' ? 0 : incomingRequests(s, nowOf(s)).length))
  return (
    <nav className="flex shrink-0 border-t border-sage-200 bg-cream pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5">
      {tabs.map(({ to, label, icon: Icon, tour }) => (
        <NavLink key={to} to={to} data-tour={`tab-${tour}`} className={({ isActive }) => `relative flex flex-1 flex-col items-center gap-0.5 py-1 ${tabs.length < 5 ? 'text-[12.5px]' : 'text-[10.5px]'} font-semibold ${isActive ? 'text-vine-700' : 'text-ink/40'}`}>
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.9} />
              {label}
              {to === '/messages' && unread > 0 && (
                <span className="absolute right-[calc(50%-18px)] top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-coffee-500 px-1 text-[9px] text-white">{unread}</span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default function App() {
  const onboarded = useKudzu((s) => s.onboarded)
  const set = useKudzu((s) => s.set)
  const [overlay, setOverlay] = useState<HTMLElement | null>(null)
  const { pathname } = useLocation()
  const simple = useKudzu((s) => s.experience === 'simple')
  const tabs = simple ? SIMPLE_TABS : TABS
  const start = simple ? '/home' : '/find'
  const showTabs = onboarded && tabs.some((t) => pathname === t.to)

  return (
    <div className="flex h-full items-center justify-center gap-14 sm:py-4">
      <aside className="hidden max-w-xs lg:block">
        <div className="font-display text-5xl font-semibold text-vine-700">{APP_NAME}</div>
        <p className="mt-2 font-display text-xl text-coffee-600">{TAGLINE}</p>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">
          A clickable demo. Verified students and alumni of the same school stay in touch, meet for coffee and at events, and keep their network alive.
        </p>
        <button onClick={() => set({ demoOpen: true })} className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream">
          <Wrench size={16} /> Open demo controls
        </button>
        <p className="mt-2 text-xs text-ink/45">Or tap the {APP_NAME} logo three times.</p>
      </aside>

      <div className="relative flex h-full w-full flex-col overflow-hidden bg-cream sm:h-[844px] sm:max-h-full sm:w-[390px] sm:rounded-[44px] sm:border-[10px] sm:border-ink sm:shadow-2xl">
        <OverlayContext.Provider value={overlay}>
          <main className="relative z-0 min-h-0 flex-1">
            {!onboarded ? (
              <Routes>
                <Route path="*" element={<Onboarding />} />
              </Routes>
            ) : (
              <Routes>
                {/* the simple app has no search of the school and no events: those addresses lead home */}
                <Route path="/home" element={simple ? <Home /> : <Navigate to="/find" replace />} />
                <Route path="/find" element={simple ? <Navigate to="/home" replace /> : <Find />} />
                <Route path="/events" element={simple ? <Navigate to="/home" replace /> : <Events />} />
                <Route path="/network" element={<Network />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/event-chat/:id" element={<EventChat />} />
                <Route path="/groups/:id" element={<GroupDetail />} />
                <Route path="/network/:id" element={<ConnectionDetail />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:id" element={<ChatThread />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/u/:id" element={<UserProfile />} />
                <Route path="/guidelines" element={<Guidelines />} />
                <Route path="/cohorts/:kind" element={<Cohort />} />
                <Route path="/known" element={<Known />} />
                <Route path="*" element={<Navigate to={start} replace />} />
              </Routes>
            )}
          </main>
          {showTabs && <TabBar tabs={tabs} />}
          <div ref={setOverlay} className="pointer-events-none absolute inset-0 z-[1500]" />
          {onboarded && <EventPopup />}
          {onboarded && <PushBanner />}
          <TourOffer />
          <Tour />
          <CheckInSheet />
          <DemoPanel />
          <Toast />
        </OverlayContext.Provider>
      </div>

      <button
        onClick={() => set({ demoOpen: true })}
        className="fixed bottom-24 right-2 z-[3000] flex h-9 w-9 items-center justify-center rounded-full bg-ink/70 text-cream shadow-lg backdrop-blur sm:bottom-5 sm:right-5 sm:h-11 sm:w-11 sm:bg-ink lg:hidden"
        aria-label="Demo controls"
      >
        <Wrench size={16} />
      </button>
    </div>
  )
}
