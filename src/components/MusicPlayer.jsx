import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsRight, ChevronsLeft, Music2, Pause, Play, Repeat2, Volume2, VolumeX } from 'lucide-react'

const TRACKS = [
  { name: 'Music 1', src: `${import.meta.env.BASE_URL}audio/music1.mp3` },
  { name: 'Music 2', src: `${import.meta.env.BASE_URL}audio/music2.mp3` },
  { name: 'Music 3', src: `${import.meta.env.BASE_URL}audio/music3.mp3` },
]
const DEFAULT_VOLUME = 0.3

function readStoredNumber(key, fallback) {
  const storedValue = Number.parseFloat(localStorage.getItem(key))
  return Number.isFinite(storedValue) ? Math.min(1, Math.max(0, storedValue)) : fallback
}

function MusicPlayer({ language = 'en' }) {
  const audioRef = useRef(null)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [volume, setVolume] = useState(() => readStoredNumber('music-volume', DEFAULT_VOLUME))
  const [muted, setMuted] = useState(() => localStorage.getItem('music-muted') === 'true')
  const [enabled, setEnabled] = useState(() => localStorage.getItem('music-enabled') === 'true')
  const [loopEnabled, setLoopEnabled] = useState(() => localStorage.getItem('music-loop') !== 'false')
  const [playing, setPlaying] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('music-collapsed') === 'true')
  const [trackAvailability, setTrackAvailability] = useState(() => TRACKS.map(() => true))
  const [previousVolume, setPreviousVolume] = useState(() => readStoredNumber('music-volume', DEFAULT_VOLUME))
  const available = trackAvailability[currentTrack]

  const labels = language === 'ar'
    ? { player: 'مشغل الموسيقى', volume: 'مستوى صوت الموسيقى', play: 'تشغيل الموسيقى', pause: 'إيقاف الموسيقى مؤقتاً', previous: 'الأغنية السابقة', next: 'الأغنية التالية', loopOn: 'إيقاف التكرار', loopOff: 'تشغيل التكرار', mute: 'كتم الموسيقى', unmute: 'إلغاء كتم الموسيقى', unavailable: 'ملف الموسيقى غير متاح' }
    : { player: 'Music player', volume: 'Music volume', play: 'Play music', pause: 'Pause music', previous: 'Previous song', next: 'Next song', loopOn: 'Disable loop', loopOff: 'Enable loop', mute: 'Mute music', unmute: 'Unmute music', unavailable: 'Music file unavailable' }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = TRACKS[currentTrack].src
    audio.load()
  }, [currentTrack])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = loopEnabled
    audio.volume = volume
    audio.muted = muted
  }, [loopEnabled, muted, volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !trackAvailability[0]) return

    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [trackAvailability])

  useEffect(() => {
    localStorage.setItem('music-volume', String(volume))
    localStorage.setItem('music-muted', String(muted))
    localStorage.setItem('music-enabled', String(enabled))
    localStorage.setItem('music-loop', String(loopEnabled))
    localStorage.setItem('music-track', String(currentTrack))
  }, [currentTrack, enabled, loopEnabled, muted, volume])

  const selectTrack = (trackIndex) => {
    if (trackIndex === currentTrack) return
    const audio = audioRef.current
    const shouldPlay = playing
    setCurrentTrack(trackIndex)
    setPlaying(false)
    if (!audio || !trackAvailability[trackIndex]) return
    audio.src = TRACKS[trackIndex].src
    audio.load()
    if (shouldPlay) {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  const selectPreviousTrack = () => selectTrack((currentTrack - 1 + TRACKS.length) % TRACKS.length)
  const selectNextTrack = () => selectTrack((currentTrack + 1) % TRACKS.length)

  const handleTrackEnded = () => {
    if (!loopEnabled) selectNextTrack()
  }

  const handleAudioError = () => {
    setTrackAvailability((previousAvailability) => previousAvailability.map((isAvailable, index) => index === currentTrack ? false : isAvailable))
    setPlaying(false)
  }

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio || !available) return

    if (playing) {
      audio.pause()
      setPlaying(false)
      return
    }

    try {
      await audio.play()
      setEnabled(true)
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  const toggleMute = () => {
    if (muted) {
      const restoredVolume = previousVolume > 0 ? previousVolume : DEFAULT_VOLUME
      setVolume(restoredVolume)
      setMuted(false)
      return
    }

    setPreviousVolume(volume > 0 ? volume : DEFAULT_VOLUME)
    setMuted(true)
  }

  const handleVolumeChange = (event) => {
    const nextVolume = Number.parseFloat(event.target.value)
    setVolume(nextVolume)
    setPreviousVolume(nextVolume > 0 ? nextVolume : previousVolume)
    setMuted(nextVolume === 0)
  }

  const toggleLoop = () => setLoopEnabled((isLooping) => !isLooping)
  const toggleCollapsed = () => setCollapsed((isCollapsed) => { localStorage.setItem('music-collapsed', String(!isCollapsed)); return !isCollapsed })

  return <aside className={`music-player${playing ? ' is-playing' : ''}${available ? '' : ' is-unavailable'}${collapsed ? ' is-collapsed' : ''}`} aria-label={labels.player}>
    <audio ref={audioRef} loop={loopEnabled} preload="metadata" onEnded={handleTrackEnded} onError={handleAudioError} />
    <span className="music-player-icon" aria-hidden="true"><Music2 size={16} /></span>
    {!collapsed && <>
      <span className="music-player-indicator" aria-hidden="true"><i /><i /><i /></span>
      <span className="music-player-track" aria-live="polite">{available ? TRACKS[currentTrack].name : labels.unavailable}</span>
      <button className="music-player-button" type="button" onClick={selectPreviousTrack} disabled={TRACKS.length < 2} aria-label={labels.previous} title={labels.previous}><ChevronLeft size={16} /></button>
      <button className="music-player-button" type="button" onClick={togglePlayback} disabled={!available} aria-label={playing ? labels.pause : labels.play} title={playing ? labels.pause : labels.play}>{playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button>
      <button className="music-player-button" type="button" onClick={selectNextTrack} disabled={TRACKS.length < 2} aria-label={labels.next} title={labels.next}><ChevronRight size={16} /></button>
      <button className={`music-player-button${loopEnabled ? ' is-active' : ''}`} type="button" onClick={toggleLoop} aria-label={loopEnabled ? labels.loopOn : labels.loopOff} title={loopEnabled ? labels.loopOn : labels.loopOff} aria-pressed={loopEnabled}><Repeat2 size={16} /></button>
      <button className="music-player-button music-player-volume-button" type="button" onClick={toggleMute} disabled={!available} aria-label={muted ? labels.unmute : labels.mute} title={muted ? labels.unmute : labels.mute}>{muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
      <input className="music-player-volume" type="range" min="0" max="1" step="0.01" value={muted ? 0 : volume} onChange={handleVolumeChange} disabled={!available} aria-label={labels.volume} title={labels.volume} />
    </>}
    <button className="music-player-button music-player-toggle" type="button" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand player' : 'Collapse player'} title={collapsed ? 'Expand player' : 'Collapse player'}>{collapsed ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}</button>
  </aside>
}

export default MusicPlayer
