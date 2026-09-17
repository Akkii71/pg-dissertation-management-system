import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  UserCheck,
  Shield,
  Mail,
  Calendar,
  LogOut,
  Sparkles,
  Layers,
  Database,
  CheckCircle2,
  Clock,
  Info
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const getRoleInfo = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return {
          title: 'Department / University Administrator',
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Shield,
          colorTheme: 'purple',
          description: 'Institutional management, ratio enforcement, final approval & result oversight'
        };
      case 'guide':
        return {
          title: 'PG Dissertation Guide / Supervisor',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: UserCheck,
          colorTheme: 'emerald',
          description: 'Supervising student research, reviewing milestone submissions & topic validations'
        };
      case 'student':
      default:
        return {
          title: 'Post-Graduate Student / Scholar',
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: GraduationCap,
          colorTheme: 'blue',
          description: 'Topic proposal submission, supervisor coordination & dissertation draft delivery'
        };
    }
  };

  const roleInfo = getRoleInfo(user?.role);
  const RoleIcon = roleInfo.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'Active Session';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Welcome Banner Card */}
      <div className="academic-card bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-lg border-none">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-medium border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Foundation Phase (Module 1)</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Welcome back, {user?.name || 'Academic Scholar'}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-1">
                {roleInfo.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-200 text-slate-200 text-sm font-medium backdrop-blur-md border border-white/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Information & Role Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="academic-card p-6 bg-white rounded-2xl border border-slate-200 shadow-xs md:col-span-1">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <RoleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">User Profile</h2>
              <p className="text-xs text-slate-500">Authenticated Credentials</p>
            </div>
          </div>

          <div className="space-y-3.5 text-sm">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Full Name
              </span>
              <span className="font-semibold text-slate-800">{user?.name}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Institutional Email
              </span>
              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Assigned Role
              </span>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleInfo.badgeColor}`}>
                  <RoleIcon className="w-3 h-3" />
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Member Since
              </span>
              <div className="flex items-center gap-1.5 text-slate-700 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Next Phase Placeholder Notice */}
        <div className="academic-card p-6 bg-white rounded-2xl border border-slate-200 shadow-xs md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">System Status</h2>
                  <p className="text-xs text-slate-500">Core Services & Database Status</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  System Online
                </span>
              </div>
            </div>

            {/* Core Placeholder Required by Scope */}
            <div className="my-6 p-5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3.5 text-indigo-900">
              <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm text-indigo-950">Module 1 Active: Project Foundation & Security</h3>
                <p className="text-xs text-indigo-800/90 mt-1 leading-relaxed">
                  More dissertation management features will be added in upcoming modules.
                </p>
              </div>
            </div>

            {/* Roadmap of Future Commits as Read-Only Preview */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Upcoming Dissertation Lifecycle Modules
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3 opacity-70">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                    02
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Topic Management & Portals</p>
                    <p className="text-[11px] text-slate-500">Commit 2 Roadmap</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3 opacity-70">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                    03
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Guide Allocation & Approvals</p>
                    <p className="text-[11px] text-slate-500">Commit 3 Roadmap</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3 opacity-70">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                    04
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Evaluation & Publications</p>
                    <p className="text-[11px] text-slate-500">Commit 4 Roadmap</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3 opacity-70">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                    05
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">UI Polish & Full Audit</p>
                    <p className="text-[11px] text-slate-500">Commit 5 Roadmap</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Ministry of AYUSH • Smart Education Domain</span>
            <span>Version 1.0.0-foundation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
