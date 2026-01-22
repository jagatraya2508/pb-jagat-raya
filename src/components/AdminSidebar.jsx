import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    BarChart3, Users, Tag, Trophy, ClipboardList, GitBranch,
    UserCog, Image, FileText, Home, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function AdminSidebar() {
    const location = useLocation();
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const handleLogout = async () => {
        if (signOut) {
            await signOut();
            navigate('/');
        }
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img src="/logo.png" alt="Logo" style={{ width: '120px', height: 'auto', objectFit: 'contain' }} />
                </div>
            </div>

            <nav className="sidebar-nav">
                <Link to="/admin" className={`sidebar-link ${isActive('/admin')}`}>
                    <BarChart3 size={20} />
                    Dashboard
                </Link>
                <Link to="/admin/members" className={`sidebar-link ${isActive('/admin/members')}`}>
                    <Users size={20} />
                    Anggota
                </Link>
                <Link to="/admin/categories" className={`sidebar-link ${isActive('/admin/categories')}`}>
                    <Tag size={20} />
                    Kategori
                </Link>
                <Link to="/admin/tournaments" className={`sidebar-link ${isActive('/admin/tournaments')}`}>
                    <Trophy size={20} />
                    Kejuaraan
                </Link>
                <Link to="/admin/registrations" className={`sidebar-link ${isActive('/admin/registrations')}`}>
                    <ClipboardList size={20} />
                    Pendaftar
                </Link>
                <Link to="/admin/brackets" className={`sidebar-link ${isActive('/admin/brackets')}`}>
                    <GitBranch size={20} />
                    Bagan
                </Link>
                <Link to="/admin/users" className={`sidebar-link ${isActive('/admin/users')}`}>
                    <UserCog size={20} />
                    Pengguna
                </Link>
                <Link to="/admin/slides" className={`sidebar-link ${isActive('/admin/slides')}`}>
                    <Image size={20} />
                    Kelola Slide
                </Link>
                <Link to="/admin/content" className={`sidebar-link ${isActive('/admin/content')}`}>
                    <FileText size={20} />
                    Konten
                </Link>
            </nav>

            <div className="sidebar-footer">
                <Link to="/" className="sidebar-link">
                    <Home size={20} />
                    Ke Website
                </Link>
                <button onClick={handleLogout} className="sidebar-link sidebar-logout">
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
}

export default AdminSidebar;
