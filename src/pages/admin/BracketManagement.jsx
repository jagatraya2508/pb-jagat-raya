import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    ArrowLeft, Trophy, Users, Home, LogOut, BarChart3, Tag, ClipboardList,
    RefreshCw, Play, CheckCircle, X, ChevronRight, ChevronLeft, GitBranch, MapPin, Calendar, UserCog
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import './BracketManagement.css'

function BracketManagement() {
    const { logout } = useAuth()
    const [tournaments, setTournaments] = useState([])
    const [selectedTournament, setSelectedTournament] = useState(null)
    const [brackets, setBrackets] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [bracket, setBracket] = useState(null)
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [editingMatch, setEditingMatch] = useState(null)
    const [matchScores, setMatchScores] = useState({ player1_score: '', player2_score: '' })
    const [registrationCounts, setRegistrationCounts] = useState({})

    useEffect(() => {
        fetchTournaments()
    }, [])

    useEffect(() => {
        if (selectedTournament) {
            fetchBrackets()
            fetchRegistrationCounts()
        } else {
            setBrackets([])
            setSelectedCategory(null)
        }
    }, [selectedTournament])

    useEffect(() => {
        if (selectedCategory && selectedTournament) {
            fetchBracketDetail()
        } else {
            setBracket(null)
            setMatches([])
        }
    }, [selectedCategory])

    const fetchTournaments = async () => {
        try {
            const data = await api.tournaments.list()
            setTournaments(data || [])
        } catch (error) {
            console.error('Error fetching tournaments:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchBrackets = async () => {
        try {
            const data = await api.brackets.listByTournament(selectedTournament.id)
            setBrackets(data || [])
        } catch (error) {
            console.error('Error fetching brackets:', error)
        }
    }

    const fetchRegistrationCounts = async () => {
        try {
            const registrations = await api.registrations.listByTournament(selectedTournament.id)
            const counts = {}
            registrations.forEach(reg => {
                counts[reg.category] = (counts[reg.category] || 0) + 1
            })
            setRegistrationCounts(counts)
        } catch (error) {
            console.error('Error fetching registrations:', error)
        }
    }

    const fetchBracketDetail = async () => {
        try {
            const data = await api.brackets.getByCategory(selectedTournament.id, selectedCategory)
            setBracket(data.bracket)
            setMatches(data.matches || [])
        } catch (error) {
            console.error('Error fetching bracket:', error)
        }
    }

    const parseCategories = (categoriesData) => {
        if (!categoriesData) return []
        try {
            const parsed = JSON.parse(categoriesData)
            if (Array.isArray(parsed)) return parsed.map(c => c.name || c)
            return []
        } catch {
            return categoriesData.split(',').map(c => c.trim())
        }
    }

    const handleGenerateBracket = async (category) => {
        if (!selectedTournament || !category) return

        const existingBracket = brackets.find(b => b.category === category)
        if (existingBracket) {
            const confirm = window.confirm('Bracket sudah ada. Generate ulang akan menghapus semua data pertandingan. Lanjutkan?')
            if (!confirm) return
        }

        setGenerating(true)
        try {
            await api.brackets.generate({
                tournament_id: selectedTournament.id,
                category: category
            })
            await fetchBrackets()
            setSelectedCategory(category)
            alert('Bracket berhasil di-generate!')
        } catch (error) {
            alert(error.message || 'Gagal generate bracket')
        } finally {
            setGenerating(false)
        }
    }

    const handleUpdateMatch = async () => {
        if (!editingMatch) return

        try {
            await api.brackets.updateMatch(editingMatch.id, {
                player1_score: parseInt(matchScores.player1_score) || 0,
                player2_score: parseInt(matchScores.player2_score) || 0
            })
            await fetchBracketDetail()
            setEditingMatch(null)
            setMatchScores({ player1_score: '', player2_score: '' })
        } catch (error) {
            alert('Gagal update hasil pertandingan')
        }
    }

    const openScoreModal = (match) => {
        setEditingMatch(match)
        setMatchScores({
            player1_score: match.player1_score?.toString() || '',
            player2_score: match.player2_score?.toString() || ''
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

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const getBracketForCategory = (category) => {
        return brackets.find(b => b.category === category)
    }

    const categories = selectedTournament ? parseCategories(selectedTournament.categories) : []
    const matchesByRound = getMatchesByRound()
    const totalRounds = bracket?.total_rounds || 0

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Trophy size={24} />
                    </div>
                    <div className="sidebar-brand">
                        <span className="sidebar-brand-name">PB. JAGAT RAYA</span>
                        <span className="sidebar-brand-label">Admin Panel</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin" className="sidebar-link">
                        <BarChart3 size={20} />
                        Dashboard
                    </Link>
                    <Link to="/admin/members" className="sidebar-link">
                        <Users size={20} />
                        Anggota
                    </Link>
                    <Link to="/admin/categories" className="sidebar-link">
                        <Tag size={20} />
                        Kategori
                    </Link>
                    <Link to="/admin/tournaments" className="sidebar-link">
                        <Trophy size={20} />
                        Kejuaraan
                    </Link>
                    <Link to="/admin/registrations" className="sidebar-link">
                        <ClipboardList size={20} />
                        Pendaftar
                    </Link>
                    <Link to="/admin/brackets" className="sidebar-link active">
                        <GitBranch size={20} />
                        Bagan
                    </Link>
                    <Link to="/admin/users" className="sidebar-link">
                        <UserCog size={20} />
                        Pengguna
                    </Link>
                </nav>
                <div className="sidebar-footer">
                    <Link to="/" className="sidebar-link">
                        <Home size={20} />
                        Ke Website
                    </Link>
                    <button onClick={logout} className="sidebar-link sidebar-logout">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                {!selectedCategory ? (
                    <>
                        {/* Tournament Selection Header */}
                        <header className="admin-header">
                            <div className="admin-header-content">
                                <div className="header-title-group">
                                    <Link to="/admin" className="back-link">
                                        <ArrowLeft size={20} />
                                    </Link>
                                    <div>
                                        <h1>Bagan Kejuaraan</h1>
                                        <p>Kelola bagan pertandingan turnamen</p>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="admin-content">
                            {/* Tournament Selection */}
                            {!selectedTournament ? (
                                <div className="tournament-selection">
                                    <h2>Pilih Kejuaraan</h2>
                                    <div className="tournament-grid">
                                        {tournaments.map(t => (
                                            <div
                                                key={t.id}
                                                className="tournament-select-card"
                                                onClick={() => setSelectedTournament(t)}
                                            >
                                                <div className="tournament-select-icon">
                                                    <Trophy size={32} />
                                                </div>
                                                <div className="tournament-select-info">
                                                    <h3>{t.name}</h3>
                                                    <div className="tournament-select-meta">
                                                        {t.location && (
                                                            <span><MapPin size={14} /> {t.location}</span>
                                                        )}
                                                        <span><Calendar size={14} /> {formatDate(t.start_date)}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight size={24} className="chevron" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Tournament Header */}
                                    <div className="tournament-header-card">
                                        <button className="back-btn-small" onClick={() => setSelectedTournament(null)}>
                                            <ChevronLeft size={20} />
                                            Kembali
                                        </button>
                                        <div className="tournament-header-info">
                                            <div className="tournament-header-icon">
                                                <Trophy size={40} />
                                            </div>
                                            <div>
                                                <h2>{selectedTournament.name}</h2>
                                                <div className="tournament-header-meta">
                                                    {selectedTournament.location && (
                                                        <span><MapPin size={14} /> {selectedTournament.location}</span>
                                                    )}
                                                    <span><Calendar size={14} /> {formatDate(selectedTournament.start_date)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Categories / Draws Table */}
                                    <div className="draws-section">
                                        <h3>Draws</h3>
                                        <div className="table-container">
                                            <table className="table draws-table">
                                                <thead>
                                                    <tr>
                                                        <th>Draw</th>
                                                        <th>Size</th>
                                                        <th>Type</th>
                                                        <th>Stage</th>
                                                        <th>Status</th>
                                                        <th>Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categories.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="table-empty">
                                                                Belum ada kategori
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        categories.map((cat, idx) => {
                                                            const bracketData = getBracketForCategory(cat)
                                                            const regCount = registrationCounts[cat] || 0
                                                            return (
                                                                <tr
                                                                    key={idx}
                                                                    className={`draw-row ${bracketData ? 'has-bracket' : ''}`}
                                                                    onClick={() => bracketData && setSelectedCategory(cat)}
                                                                >
                                                                    <td className="draw-name">{cat}</td>
                                                                    <td>{bracketData?.total_rounds ? Math.pow(2, bracketData.total_rounds) : regCount}</td>
                                                                    <td>Elimination</td>
                                                                    <td>Main Draw</td>
                                                                    <td>
                                                                        {bracketData ? (
                                                                            <span className={`badge badge-${bracketData.status === 'completed' ? 'success' : bracketData.status === 'active' ? 'info' : 'warning'}`}>
                                                                                {bracketData.status === 'completed' ? 'Selesai' : bracketData.status === 'active' ? 'Berlangsung' : 'Draft'}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="badge badge-secondary">Belum dibuat</span>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        <div className="table-actions" onClick={e => e.stopPropagation()}>
                                                                            {bracketData ? (
                                                                                <button
                                                                                    className="action-btn view"
                                                                                    onClick={() => setSelectedCategory(cat)}
                                                                                    title="Lihat Bagan"
                                                                                >
                                                                                    <GitBranch size={16} />
                                                                                </button>
                                                                            ) : (
                                                                                <button
                                                                                    className="action-btn edit"
                                                                                    onClick={() => handleGenerateBracket(cat)}
                                                                                    disabled={generating || regCount < 2}
                                                                                    title={regCount < 2 ? 'Minimal 2 peserta' : 'Generate Bracket'}
                                                                                >
                                                                                    <RefreshCw size={16} className={generating ? 'spin' : ''} />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Bracket Detail View */}
                        <header className="admin-header">
                            <div className="admin-header-content">
                                <div className="header-title-group">
                                    <button className="back-link" onClick={() => setSelectedCategory(null)}>
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div>
                                        <h1>{selectedTournament.name}</h1>
                                        <p>Bagan {selectedCategory}</p>
                                    </div>
                                </div>
                                <div className="header-actions">
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => handleGenerateBracket(selectedCategory)}
                                        disabled={generating}
                                    >
                                        <RefreshCw size={18} className={generating ? 'spin' : ''} />
                                        Regenerate
                                    </button>
                                </div>
                            </div>
                        </header>

                        <div className="admin-content">
                            {bracket ? (
                                <div className="bracket-container">
                                    <div className="bracket-status-bar">
                                        <span className={`status-badge status-${bracket.status}`}>
                                            {bracket.status === 'active' ? 'Berlangsung' :
                                                bracket.status === 'completed' ? 'Selesai' : 'Draft'}
                                        </span>
                                        <span className="bracket-info">
                                            {Math.pow(2, totalRounds)} peserta • {totalRounds} babak
                                        </span>
                                    </div>

                                    <div className="bracket-view traditional">
                                        {Object.keys(matchesByRound).sort((a, b) => a - b).map((round, roundIdx) => (
                                            <div key={round} className="bracket-round" style={{ '--round': roundIdx }}>
                                                <div className="round-header">
                                                    {getRoundName(parseInt(round), totalRounds)}
                                                </div>
                                                <div className="round-matches">
                                                    {matchesByRound[round].map((match, matchIdx) => (
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
                                                            <div
                                                                className="match-box"
                                                                onClick={() => match.player1_name && match.player2_name && match.status !== 'completed' && openScoreModal(match)}
                                                            >
                                                                {/* Player 1 */}
                                                                <div className={`match-row ${match.winner_id === match.player1_id ? 'winner' : ''} ${match.winner_id && match.winner_id !== match.player1_id ? 'loser' : ''}`}>
                                                                    <span className="seed-number">{match.position * 2 - 1}</span>
                                                                    <div className="player-info">
                                                                        <span className="player-name">{match.player1_name || 'Bye'}</span>
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
                                                                        <span className="player-name">{match.player2_name || 'Bye'}</span>
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
                            ) : (
                                <div className="empty-state">
                                    <GitBranch size={64} />
                                    <h3>Bracket Belum Ada</h3>
                                    <p>Klik "Regenerate" untuk membuat bagan pertandingan.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Score Input Modal */}
            {editingMatch && (
                <div className="modal-overlay" onClick={() => setEditingMatch(null)}>
                    <div className="modal score-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Input Skor</h2>
                            <button className="modal-close" onClick={() => setEditingMatch(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="score-input-container">
                                <div className="score-player">
                                    <label>{editingMatch.player1_name}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={matchScores.player1_score}
                                        onChange={(e) => setMatchScores(prev => ({
                                            ...prev,
                                            player1_score: e.target.value
                                        }))}
                                        placeholder="0"
                                    />
                                </div>
                                <span className="vs">VS</span>
                                <div className="score-player">
                                    <label>{editingMatch.player2_name}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={matchScores.player2_score}
                                        onChange={(e) => setMatchScores(prev => ({
                                            ...prev,
                                            player2_score: e.target.value
                                        }))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-ghost" onClick={() => setEditingMatch(null)}>
                                Batal
                            </button>
                            <button className="btn btn-primary" onClick={handleUpdateMatch}>
                                <CheckCircle size={18} />
                                Simpan Hasil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BracketManagement
