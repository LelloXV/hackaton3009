// Mock data for the Handover Copilot POC.
// Shape here is the contract the whole team agreed on: passport fields must match
// what the RAG/backend teammates emit, so swapping this for a real API call later
// is a one-line change in dataSource.js.

export const currentUser = {
  id: 'u-sofie',
  name: 'Sofie Van Damme',
  role: 'consultant', // 'consultant' | 'owner'
  clients: ['client-atlas'],
}

export const users = [
  { id: 'u-sofie', name: 'Sofie Van Damme', role: 'consultant' },
  { id: 'u-marc', name: 'Marc Peeters', role: 'owner', expertise: ['BE payroll', 'ferie/vakantie'] },
  { id: 'u-anke', name: 'Anke Willems', role: 'owner', expertise: ['NL payroll'] },
  { id: 'u-tom', name: 'Tom Dekker', role: 'consultant (uscente)', expertise: ['Client Atlas SA'] },
]

export const documents = [
  {
    doc_id: 'proc-ferie-be-v3',
    titolo: 'Calcolo ferie – Belgio',
    tipo: 'procedura',
    proprietario: 'Marc Peeters',
    ultimo_aggiornamento: '2026-07-12',
    ultima_verifica: '2026-08-01',
    paese: 'BE',
    cliente: 'Client Atlas SA',
    stato: 'in vigore',
    sostituisce: 'proc-ferie-be-v2',
    contenuto: 'Le ferie maturano al 6% della retribuzione lorda annua, calcolate su base mensile. Per i nuovi assunti dopo il 2025, si applica la regola pro-rata dal mese di ingresso.',
  },
  {
    doc_id: 'proc-ferie-be-v2',
    titolo: 'Calcolo ferie – Belgio (vecchia versione)',
    tipo: 'procedura',
    proprietario: 'Marc Peeters',
    ultimo_aggiornamento: '2024-02-03',
    ultima_verifica: '2024-02-03',
    paese: 'BE',
    cliente: 'Client Atlas SA',
    stato: 'superato',
    sostituito_da: 'proc-ferie-be-v3',
    contenuto: 'Le ferie maturano al 6% della retribuzione lorda annua. I nuovi assunti maturano dal primo anno intero successivo all\'assunzione.',
  },
  {
    doc_id: 'email-ferie-question',
    titolo: 'Email: dubbio calcolo ferie nuovo assunto',
    tipo: 'email',
    proprietario: null,
    ultimo_aggiornamento: '2026-06-20',
    ultima_verifica: null,
    paese: 'BE',
    cliente: 'Client Atlas SA',
    stato: 'nessun proprietario',
    contenuto: 'Un collega chiede se per un assunto di aprile 2026 si applica il pro-rata o si aspetta l\'anno intero. Nessuna risposta definitiva nel thread.',
  },
  {
    doc_id: 'teams-export-ferie',
    titolo: 'Teams: discussione team payroll BE',
    tipo: 'chat',
    proprietario: null,
    ultimo_aggiornamento: '2026-05-15',
    ultima_verifica: null,
    paese: 'BE',
    cliente: 'Client Atlas SA',
    stato: 'informale',
    contenuto: 'Marc: "occhio che per Atlas usiamo ancora la v2, il cliente non ha approvato la v3 formalmente". Nessun aggiornamento successivo nel thread.',
  },
  {
    doc_id: 'proc-ferie-nl-v1',
    titolo: 'Calcolo ferie – Olanda',
    tipo: 'procedura',
    proprietario: 'Anke Willems',
    ultimo_aggiornamento: '2026-03-01',
    ultima_verifica: '2026-03-01',
    paese: 'NL',
    cliente: 'Client Atlas SA',
    stato: 'in vigore',
    contenuto: 'Le ferie maturano in base alle ore contrattuali settimanali, minimo legale 4 volte la settimana lavorativa.',
  },
  {
    doc_id: 'proc-onboarding-generic',
    titolo: 'Procedura onboarding dipendente (generica gruppo)',
    tipo: 'procedura',
    proprietario: 'Anke Willems',
    ultimo_aggiornamento: '2025-11-10',
    ultima_verifica: '2025-11-10',
    paese: 'ALL',
    cliente: null,
    stato: 'in vigore',
    contenuto: 'Checklist standard di onboarding valida per tutti i paesi del gruppo, non specifica per Client Atlas SA.',
  },
  {
    doc_id: 'note-handover-tom',
    titolo: 'Nota di passaggio di Tom Dekker',
    tipo: 'nota',
    proprietario: 'Tom Dekker',
    ultimo_aggiornamento: '2026-09-25',
    ultima_verifica: '2026-09-25',
    paese: 'BE',
    cliente: 'Client Atlas SA',
    stato: 'in vigore',
    contenuto: 'Attenzione: il cliente Atlas ha una clausola contrattuale non standard sul pagamento del tredicesimo. Vedi allegato contratto, non ancora digitalizzato.',
  },
  {
    doc_id: 'contratto-atlas-2023',
    titolo: 'Contratto quadro Client Atlas SA',
    tipo: 'contratto',
    proprietario: 'Marc Peeters',
    ultimo_aggiornamento: '2023-01-10',
    ultima_verifica: '2023-01-10',
    paese: 'BE',
    cliente: 'Client Atlas SA',
    stato: 'in vigore',
    contenuto: 'Clausola 4.2: il tredicesimo viene erogato in due tranche, a giugno e dicembre, difforme dalla prassi standard di erogazione unica.',
  },
]

// A pre-baked Q&A example driving the demo's main screen.
export const exampleAnswer = {
  domanda: 'Come si calcolano le ferie per un nuovo assunto belga di Client Atlas SA?',
  risposta:
    'Per i nuovi assunti belgi dopo il 2025 si applica la regola pro-rata dal mese di ingresso [1]. Attenzione però: una versione precedente della stessa procedura indica di aspettare l\'anno intero [2], e una discussione Teams recente suggerisce che Client Atlas potrebbe ancora seguire la versione vecchia, non approvata formalmente nella nuova forma [4].',
  fonti: [
    {
      doc_id: 'proc-ferie-be-v3',
      ref: 1,
      fiducia: 'alta',
      punteggio: 88,
      motivi: [
        { ok: true, testo: 'aggiornato 2 mesi fa' },
        { ok: true, testo: 'vale per il Belgio' },
        { ok: true, testo: 'proprietario assegnato: Marc Peeters' },
        { ok: false, testo: 'in conflitto con proc-ferie-be-v2' },
      ],
    },
    {
      doc_id: 'proc-ferie-be-v2',
      ref: 2,
      fiducia: 'bassa',
      punteggio: 25,
      motivi: [
        { ok: false, testo: 'superato da proc-ferie-be-v3' },
        { ok: false, testo: 'non aggiornato da oltre 2 anni' },
        { ok: true, testo: 'vale per il Belgio' },
      ],
    },
    {
      doc_id: 'email-ferie-question',
      ref: 3,
      fiducia: 'bassa',
      punteggio: 20,
      motivi: [
        { ok: false, testo: 'nessun proprietario' },
        { ok: false, testo: 'nessuna risposta definitiva nel thread' },
      ],
    },
    {
      doc_id: 'teams-export-ferie',
      ref: 4,
      fiducia: 'media',
      punteggio: 45,
      motivi: [
        { ok: false, testo: 'fonte informale, non un documento ufficiale' },
        { ok: true, testo: 'segnala un rischio reale non ancora risolto' },
      ],
    },
  ],
  conflitto: {
    titolo: 'Procedura ferie BE: versione nuova vs versione applicata dal cliente',
    fonte_a: { doc_id: 'proc-ferie-be-v3', estratto: 'Pro-rata dal mese di ingresso per i nuovi assunti dopo il 2025.' },
    fonte_b: { doc_id: 'proc-ferie-be-v2', estratto: 'Si aspetta l\'anno intero successivo all\'assunzione.' },
    nota: 'Il cliente Atlas potrebbe non aver approvato formalmente la v3 (vedi discussione Teams del 15/05/2026).',
    chi_chiarisce: { user_id: 'u-marc', motivo: 'proprietario di entrambe le versioni della procedura' },
  },
}
