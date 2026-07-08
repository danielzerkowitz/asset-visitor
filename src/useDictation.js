import { useEffect, useRef, useState } from 'react'

// Dictation into a single text field. With VITE_OPENAI_API_KEY set, audio is
// recorded locally and transcribed by OpenAI Whisper (better accuracy, all
// browsers, handles mixed NL/FR/EN); otherwise falls back to the browser's
// built-in Web Speech API, which streams text live but is Chrome/Safari-only.
//
//   const dict = useDictation(applyNote, showError)
//   dict.supported  — whether any dictation path is available
//   dict.state      — 'idle' | 'listening' | 'transcribing'
//   dict.toggle()   — start / stop
//
// `apply` is called with (old → new) so a transcript appends to whatever is
// in the field by the time it lands.

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY
const SpeechRec = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null

const withSpace = (s) => (s.trim() ? s.replace(/\s+$/, '') + ' ' : '')

async function whisperTranscribe(blob) {
  const ext = blob.type.includes('mp4') ? 'm4a' : 'webm'
  const fd = new FormData()
  fd.append('file', blob, `note.${ext}`)
  fd.append('model', 'whisper-1')
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_KEY}` },
    body: fd,
  })
  if (!res.ok) throw new Error(`OpenAI transcription failed (${res.status})`)
  return ((await res.json()).text || '').trim()
}

export default function useDictation(apply, onError) {
  const [state, setState] = useState('idle')
  const speechRef = useRef(null)   // SpeechRecognition instance
  const mediaRef = useRef(null)    // MediaRecorder instance
  const chunksRef = useRef([])
  const cancelledRef = useRef(false)

  useEffect(() => () => {
    speechRef.current?.abort()
    if (mediaRef.current?.state === 'recording') {
      cancelledRef.current = true
      mediaRef.current.stop()
    }
  }, [])

  const startWhisper = async () => {
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      onError?.('Microphone access was denied')
      return
    }
    const mime = ['audio/webm', 'audio/mp4'].find((m) => MediaRecorder.isTypeSupported(m))
    const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
    chunksRef.current = []
    cancelledRef.current = false
    rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data) }
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop())
      mediaRef.current = null
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
      if (cancelledRef.current || blob.size === 0) {
        setState('idle')
        return
      }
      setState('transcribing')
      try {
        const text = await whisperTranscribe(blob)
        if (text) apply((old) => withSpace(old) + text)
      } catch (err) {
        console.error('atlas: dictation failed', err)
        onError?.('Transcription failed — check the OpenAI key and try again')
      }
      setState('idle')
    }
    mediaRef.current = rec
    rec.start()
    setState('listening')
  }

  const startWebSpeech = () => {
    const rec = new SpeechRec()
    rec.lang = navigator.language || 'en-US'
    rec.continuous = true
    rec.interimResults = true
    let base = null // captured from the field on the first result
    rec.onresult = (e) => {
      let text = ''
      for (const result of e.results) text += result[0].transcript
      apply((old) => {
        if (base === null) base = withSpace(old)
        return base + text
      })
    }
    rec.onend = () => { setState('idle'); speechRef.current = null }
    rec.onerror = () => { setState('idle'); speechRef.current = null }
    speechRef.current = rec
    rec.start()
    setState('listening')
  }

  const toggle = () => {
    if (state === 'transcribing') return
    if (state === 'listening') {
      speechRef.current?.stop()
      mediaRef.current?.stop()
      return
    }
    if (OPENAI_KEY) startWhisper()
    else if (SpeechRec) startWebSpeech()
  }

  // Whisper needs MediaRecorder + getUserMedia, present in every modern browser.
  const supported = OPENAI_KEY
    ? typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
    : !!SpeechRec

  return { supported, state, toggle }
}
