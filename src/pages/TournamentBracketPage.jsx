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
                                <div className="bracket-container">
                                    <div className="bracket-status-bar">
                                        <span className={`status-badge status-${bracket.status}`}>
                                            {bracket.status === 'active' ? 'Berlangsung' :
                                                bracket.status === 'completed' ? 'Selesai' : 'Draft'}
                                        </span>
                                        <span className="bracket-info">
                                            {bracket.total_rounds ? Math.pow(2, bracket.total_rounds) : 0} peserta • {bracket.total_rounds} babak
                                        </span>
                                    </div>

                                    <div className="bracket-view traditional">
                                        {Object.keys(matchesByRound).sort((a, b) => a - b).map((round, roundIdx) => (
                                            <div key={round} className="bracket-round" style={{ '--round': roundIdx }}>
                                                <div className="round-header">
                                                    {getRoundName(parseInt(round), totalRounds)}
                                                </div>
                                                <div className="round-matches">
                                                    {matchesByRound[round].map((match) => (
                                                        <div
                                                            key={match.id}
                                                            className={`bracket-matchup ${match.status}`}
                                                        >
                                                            {/* Connector lines */}
                                                            {parseInt(round) < totalRounds && (
                                                                <div className="connector-right"></div>
                                                            )}
                                                            {parseInt(round) > 1 && (
                                                                <div className="connector-left"></div>
                                                            )}

                                                            {/* Match box */}
                                                            <div className="match-box">
                                                                {/* Player 1 */}
                                                                <div className={`match-row ${match.winner_id === match.player1_id ? 'winner' : ''} ${match.winner_id && match.winner_id !== match.player1_id ? 'loser' : ''}`}>
                                                                    <span className="seed-number">{match.position * 2 - 1}</span>
                                                                    <div className="player-info">
                                                                        <span className="player-name">
                                                                            {match.player1_name || (parseInt(round) === 1 ? 'Bye' : '-')}
                                                                            {match.player1_rank > 0 && <span className="player-rank">#{match.player1_rank}</span>}
                                                                        </span>
                                                                    </div>
                                                                    {match.winner_id === match.player1_id && (
                                                                        <span className="winner-dot"></span>
                                                                    )}
                                                                    <div className="score-display">
                                                                        {match.player1_score !== null && (
                                                                            <span className="score">{match.player1_score}</span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Player 2 */}
                                                                <div className={`match-row ${match.winner_id === match.player2_id ? 'winner' : ''} ${match.winner_id && match.winner_id !== match.player2_id ? 'loser' : ''}`}>
                                                                    <span className="seed-number">{match.position * 2}</span>
                                                                    <div className="player-info">
                                                                        <span className="player-name">
                                                                            {match.player2_name || (parseInt(round) === 1 ? 'Bye' : '-')}
                                                                            {match.player2_rank > 0 && <span className="player-rank">#{match.player2_rank}</span>}
                                                                        </span>
                                                                    </div>
                                                                    {match.winner_id === match.player2_id && (
                                                                        <span className="winner-dot"></span>
                                                                    )}
                                                                    <div className="score-display">
                                                                        {match.player2_score !== null && (
                                                                            <span className="score">{match.player2_score}</span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Match time/court info */}
                                                                {match.match_time && (
                                                                    <div className="match-time">
                                                                        <Calendar size={12} />
                                                                        {new Date(match.match_time).toLocaleString('id-ID', {
                                                                            weekday: 'short',
                                                                            day: 'numeric',
                                                                            month: 'short',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {bracket.status === 'completed' && (
                                        <div className="champion-section">
                                            <Trophy size={48} className="champion-icon" />
                                            <h3>Juara</h3>
                                            <p className="champion-name">
                                                {matches.find(m => m.round === totalRounds)?.winner_name || '-'}
                                            </p>
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
