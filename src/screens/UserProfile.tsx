import { useNavigate, useParams } from 'react-router-dom'
import { getUser } from '../services'
import { BackHeader } from '../components/ui'
import { ProfileBody } from '../components/ProfilePopup'

/** Full profile page, reached from guest lists, groups, chats and the network. Find opens the same profile as a popup. */
export default function UserProfile() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const user = getUser(id)
  if (!user) return <><BackHeader title="Profile" /><p className="p-8 text-center text-sm text-ink/60">This profile is no longer available.</p></>
  return (
    <div className="flex h-full flex-col">
      <BackHeader title={user.id === 'me' ? 'How others see you' : user.name} />
      <ProfileBody user={user} onDone={() => nav(-1)} />
    </div>
  )
}
