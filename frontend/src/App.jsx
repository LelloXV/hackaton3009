import { useState } from 'react'
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
        onLogout={() => setCurrentUser(null)}
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
