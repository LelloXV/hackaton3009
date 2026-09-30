import { useState } from 'react'
import { users, exampleAnswer } from './data/mockData'
import Login from './screens/Login'
import AnswerScreen from './screens/AnswerScreen'
import DocumentPassport from './screens/DocumentPassport'
import ConflictPanel from './screens/ConflictPanel'

export default function App() {
  const [userId, setUserId] = useState(null)
  const [openDocId, setOpenDocId] = useState(null)
  const [conflictOpen, setConflictOpen] = useState(false)

  const currentUser = users.find((u) => u.id === userId)

  if (!currentUser) {
    return <Login onLogin={setUserId} />
  }

  return (
    <>
      <AnswerScreen
        currentUser={currentUser}
        onOpenPassport={setOpenDocId}
        onOpenConflict={() => setConflictOpen(true)}
        onLogout={() => setUserId(null)}
      />
      {openDocId && (
        <DocumentPassport docId={openDocId} currentUser={currentUser} onClose={() => setOpenDocId(null)} />
      )}
      {conflictOpen && (
        <ConflictPanel
          conflitto={exampleAnswer.conflitto}
          onOpenPassport={setOpenDocId}
          onClose={() => setConflictOpen(false)}
        />
      )}
    </>
  )
}
