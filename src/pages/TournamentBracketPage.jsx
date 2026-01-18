import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Trophy, Calendar, MapPin, Users, ChevronRight, CheckCircle } from 'lucide-react'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './TournamentBracketPage.css'

function TournamentBracketPage() {
    const { tournamentId } = useParams()
    const [tournament, setTournament] = useState(null)
    const [brackets, setBrackets] = useState([])
    const [selectedCategory, setSelectedCategory] = useState('')
    const [bracket, setBracket] = useState(null)
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTournamentData()
    }, [tournamentId])

    useEffect(() => {
        if (selectedCategory && tournamentId) {
            fetchBracket()
        }
    }, [selectedCategory])

    const fetchTournamentData = async () => {
        try {
            const tournaments = await api.tournaments.list()
            const t = tournaments.find(t => t.id === tournamentId)
            setTournament(t || null)

            if (t) {
                const bracketsData = await api.brackets.listByTournament(tournamentId)
                setBrackets(bracketsData || [])

                // Auto-select first category with bracket
                if (bracketsData && bracketsData.length > 0) {
                    setSelectedCategory(bracketsData[0].category)
                }
            }
        } catch (error) {
            console.error('Error fetching tournament:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchBracket = async () => {
        try {
            const data = await api.brackets.getByCategory(tournamentId, selectedCategory)
            setBracket(data.bracket)
            setMatches(data.matches || [])
        } catch (error) {
            console.error('Error fetching bracket:', error)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const getRoundName = (round, totalRounds) => {
        const roundsFromEnd = totalRounds - round + 1
        if (roundsFromEnd === 1) return 'Final'
        if (roundsFromEnd === 2) return 'Semi Final'
        if (roundsFromEnd === 3) return 'Quarter Final'
        return `Babak ${round}`
    }

    const getMatchesByRound = () => {
        const rounds = {}
        matches.forEach(match => {
            if (!rounds[match.round]) {
                rounds[match.round] = []
            }
            rounds[match.round].push(match)
        })
        return rounds
    }

    const matchesByRound = getMatchesByRound()
    const totalRounds = bracket?.total_rounds || 0

    if (loading) {
        return (
            <div className="bracket-page">
                <Navbar />
                <main className="bracket-main">
                    <div className="container">
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Memuat data bagan...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (!tournament) {
        return (
            <div className="bracket-page">
                <Navbar />
                <main className="bracket-main">
                    <div className="container">
                        <div className="empty-state">
                            <Trophy size={64} />
                            <h2>Turnamen Tidak Ditemukan</h2>
                            <p>Turnamen yang Anda cari tidak tersedia.</p>
                            <Link to="/kejuaraan" className="btn btn-primary">
                                Kembali ke Kejuaraan
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="bracket-page">
            <Navbar />

            <main className="bracket-main">
                <div className="container">
                    <div className="bracket-page-header">
                        <Link to="/kejuaraan" className="back-btn">
                            <ArrowLeft size={20} />
                            Kembali
                        </Link>
                        <div className="tournament-info-header">
                            <Trophy size={32} className="title-icon" />
                            <div>
                                <h1>{tournament.name}</h1>
                                <div className="tournament-meta">
                                    {tournament.location && (
                                        <span><MapPin size={14} /> {tournament.location}</span>
                                    )}
                                    <span><Calendar size={14} /> {formatDate(tournament.start_date)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    {brackets.length > 0 ? (
                        <>
                            <div className="category-tabs">
                                {brackets.map(b => (
                                    <button
                                        key={b.id}
                                        className={`category-tab ${selectedCategory === b.category ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(b.category)}
                                    >
                                        {b.category}
                                        {b.status === 'completed' && <CheckCircle size={14} />}
                                    </button>
                                ))}
                            </div>

                            {/* Bracket Display */}
                            {bracket && (
                                <div className="bracket-display">
                                    <div className="bracket-display-header">
                                        <h2>Bagan Pertandingan - {selectedCategory}</h2>
                                        <span className={`status-badge status-${bracket.status}`}>
                                            {bracket.status === 'active' ? 'Berlangsung' :
                                                bracket.status === 'completed' ? 'Selesai' : 'Draft'}
                                        </span>
                                    </div>

                                    <div className="bracket-scroll">
                                        <div className="bracket-tree">
                                            {Object.keys(matchesByRound).sort((a, b) => a - b).map(round => (
                                                <div key={round} className="round-column">
                                                    <div className="round-title">
                                                        {getRoundName(parseInt(round), totalRounds)}
                                                    </div>
                                                    <div className="round-matches">
                                                        {matchesByRound[round].map(match => (
                                                            <div key={match.id} className={`match-card ${match.status}`}>
                                                                <div className={`match-team ${match.winner_id === match.player1_id ? 'winner' : ''}`}>
                                                                    <span className="team-name">{match.player1_name || 'TBD'}</span>
                                                                    {match.player1_score !== null && (
                                                                        <span className="team-score">{match.player1_score}</span>
                                                                    )}
                                                                </div>
                                                                <div className={`match-team ${match.winner_id === match.player2_id ? 'winner' : ''}`}>
                                                                    <span className="team-name">{match.player2_name || 'TBD'}</span>
                                                                    {match.player2_score !== null && (
                                                                        <span className="team-score">{match.player2_score}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {bracket.status === 'completed' && (
                                        <div className="champion-banner">
                                            <Trophy size={40} className="champion-trophy" />
                                            <div className="champion-info">
                                                <span className="champion-label">JUARA</span>
                                                <span className="champion-name">
                                                    {matches.find(m => m.round === totalRounds)?.winner_name || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="empty-state">
                            <Trophy size={64} />
                            <h2>Bagan Belum Tersedia</h2>
                            <p>Bagan pertandingan untuk turnamen ini belum dibuat oleh panitia.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default TournamentBracketPage
