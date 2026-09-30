<<<<<<< HEAD
import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, toAppUser } from './firebase'
=======
import { useState } from 'react'
import { signOut } from './api'
>>>>>>> origin/backend
import Login from './screens/Login'
import AnswerScreen from './screens/AnswerScreen'
import PassportPage from './screens/PassportPage'
import ConflictPanel from './screens/ConflictPanel'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [openPassportId, setOpenPassportId] = useState(null)
  // { conflict, items } so the panel can show citation numbers and titles.
  const [openConflict, setOpenConflict] = useState(null)
  // Bumped after an owner confirms a passport, so the answer is fetched again.
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

  function openPassport(passportId) {
    setOpenConflict(null)
    setOpenPassportId(passportId)
    window.scrollTo(0, 0)
  }

  return (
    <>
<<<<<<< HEAD
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
=======
      {/* Hidden, not removed, while a passport is open: keeps the question and results. */}
      <div hidden={Boolean(openPassportId)}>
        <AnswerScreen
          currentUser={currentUser}
          refreshKey={refreshKey}
          onOpenPassport={openPassport}
          onOpenConflict={(conflict, items) => setOpenConflict({ conflict, items })}
          onLogout={() => signOut().then(() => setCurrentUser(null))}
>>>>>>> origin/backend
        />
      </div>
      {openConflict && (
        <ConflictPanel conflict={openConflict.conflict} items={openConflict.items} onOpenPassport={openPassport} onClose={() => setOpenConflict(null)} />
      )}
      {openPassportId && (
        <PassportPage
          key={openPassportId}
          passportId={openPassportId}
          onOpenPassport={openPassport}
          onVerified={() => setRefreshKey((k) => k + 1)}
          onClose={() => setOpenPassportId(null)}
        />
      )}
    </>
  )
}
