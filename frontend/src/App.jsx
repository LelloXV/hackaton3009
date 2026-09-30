import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, toAppUser } from './firebase'
import Login from './screens/Login'
import AnswerScreen from './screens/AnswerScreen'
import DocumentPassport from './screens/DocumentPassport'
import ConflictPanel from './screens/ConflictPanel'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [openPassportId, setOpenPassportId] = useState(null)
  // { conflict, sources } so the panel can show what each side says.
  const [openConflict, setOpenConflict] = useState(null)
  // Bumped after an owner verifies a source, so the answer is fetched again.
  const [refreshKey, setRefreshKey] = useState(0)
  // Without Firebase there is nothing to wait for (demo accounts).
  const [authReady, setAuthReady] = useState(!auth)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (fbUser) => {
      setCurrentUser(fbUser ? toAppUser(fbUser) : null)
      setAuthReady(true)
    })
  }, [])

  function logout() {
    if (auth) signOut(auth)
    setCurrentUser(null)
  }

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">Loading…</div>
  }

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />
  }

  return (
    <>
      <AnswerScreen
        currentUser={currentUser}
        refreshKey={refreshKey}
        onOpenPassport={setOpenPassportId}
        onOpenConflict={(conflict, sources) => setOpenConflict({ conflict, sources })}
        onLogout={logout}
      />
      {openConflict && (
        <ConflictPanel
          conflict={openConflict.conflict}
          sources={openConflict.sources}
          onOpenPassport={setOpenPassportId}
          onClose={() => setOpenConflict(null)}
        />
      )}
      {openPassportId && (
        <DocumentPassport
          passportId={openPassportId}
          currentUser={currentUser}
          onVerified={() => setRefreshKey((k) => k + 1)}
          onClose={() => setOpenPassportId(null)}
        />
      )}
    </>
  )
}
