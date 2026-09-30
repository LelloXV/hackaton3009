import { useState } from 'react'
import Login from './screens/Login'
import AnswerScreen from './screens/AnswerScreen'
import DocumentPassport from './screens/DocumentPassport'
import ConflictPanel from './screens/ConflictPanel'

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [openPassportId, setOpenPassportId] = useState(null)
  const [openConflict, setOpenConflict] = useState(null)

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />
  }

  return (
    <>
      <AnswerScreen
        currentUser={currentUser}
        onOpenPassport={setOpenPassportId}
        onOpenConflict={setOpenConflict}
        onLogout={() => setCurrentUser(null)}
      />
      {openConflict && (
        <ConflictPanel
          conflict={openConflict}
          onOpenPassport={setOpenPassportId}
          onClose={() => setOpenConflict(null)}
        />
      )}
      {openPassportId && (
        <DocumentPassport
          passportId={openPassportId}
          currentUser={currentUser}
          onClose={() => setOpenPassportId(null)}
        />
      )}
    </>
  )
}
