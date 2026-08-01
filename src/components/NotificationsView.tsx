import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Filter, 
  Search, 
  Calendar, 
  Award, 
  MessageSquare, 
  Users,
  Settings,
  ChevronRight,
  MoreVertical,
  X,
  BellOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTimeAgo } from '../lib/utils';

interface Notification {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  read: boolean;
  type?: 'info' | 'success' | 'alert' | 'message' | 'event' | 'badge';
}

interface NotificationsViewProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onConfigureAlerts?: () => void;
}

export function NotificationsView({ notifications, setNotifications, onConfigureAlerts }: NotificationsViewProps) {
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedNotif, setSelectedNotif] = React.useState<Notification | null>(null);

  const handleViewDetails = (notif: Notification) => {
    markAsRead(notif.id);
    setSelectedNotif(notif);
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || !n.read;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'alert': return <Bell className="h-5 w-5 text-rose-500" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-slate-500" />;
      case 'event': return <Calendar className="h-5 w-5 text-amber-500" />;
      case 'badge': return <Award className="h-5 w-5 text-secondary" />;
      default: return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary ring-1 ring-primary/10">
            <Bell className="h-3 w-3" />
            <span>Member Updates</span>
          </div>
          <h1 className="text-4xl font-heading font-black text-primary uppercase tracking-tight">Notification <span className="text-secondary">Center</span></h1>
          <p className="text-sm font-medium text-slate-500 max-w-xl">Stay updated with circle activities, mentor matches, and your learning progress across the sisterhood.</p>
        </div>

        <div className="flex items-center gap-3">
           <button 
            onClick={markAllAsRead}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
           >
             <CheckCircle2 className="h-4 w-4" />
             Mark All Read
           </button>
           <button 
            onClick={clearAll}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2 shadow-sm"
           >
             <Trash2 className="h-4 w-4" />
             Clear All
           </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-slate-100 rounded-[1.5rem]">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-grow sm:flex-grow-0 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === 'all' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            All Updates
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-grow sm:flex-grow-0 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === 'unread' ? 'bg-white text-primary shadow-md' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Unread
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="ml-2 rounded-full bg-secondary px-1.5 py-0.5 text-[8px] text-white">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
        </div>

        <div className="relative w-full sm:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
           <input 
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl border border-slate-200 py-2.5 pl-9 pr-4 text-[10px] font-bold text-primary outline-none focus:border-secondary transition-all"
           />
        </div>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative rounded-[2rem] p-4 sm:p-6 border transition-all flex items-start gap-4 sm:gap-6 ${
                  notif.read 
                    ? 'bg-white border-slate-100 opacity-75 grayscale-[0.3]' 
                    : 'bg-white border-secondary/20 shadow-xl shadow-slate-200/40 ring-1 ring-secondary/5'
                }`}
              >
                {!notif.read && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-secondary rounded-r-full shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                )}

                <div className={`shrink-0 h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                  notif.read ? 'bg-slate-50 text-slate-400' : 'bg-secondary/10 text-secondary'
                }`}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-grow space-y-2 w-full overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <h3 className={`text-sm font-black uppercase tracking-tight break-words ${notif.read ? 'text-slate-500' : 'text-primary'}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        <span>{notif.timestamp ? formatTimeAgo(notif.timestamp) : ''}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.read ? (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-emerald-500"
                            title="Mark as read"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => markAsUnread(notif.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500"
                            title="Mark as unread"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-500"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className={`text-xs font-medium leading-relaxed max-w-2xl ${notif.read ? 'text-slate-400' : 'text-slate-600'}`}>
                    {notif.description || "You have a new update from the BIG community! Check your circle threads or learning dashboard for more details."}
                  </p>
                  
                  <div className="pt-2">
                    <button 
                      onClick={() => handleViewDetails(notif)}
                      className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors flex items-center gap-1"
                    >
                      View Details <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-32 text-center space-y-6 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <div className="mx-auto h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-xl">
                 <BellOff className="h-10 w-10 text-slate-300" />
               </div>
               <div className="space-y-1">
                 <h3 className="text-xl font-heading font-black text-primary uppercase tracking-tight">All Caught Up!</h3>
                 <p className="text-xs font-medium text-slate-500">No new notifications found matching your current filters.</p>
               </div>
               <button 
                onClick={() => {setFilter('all'); setSearchQuery('');}}
                className="rounded-full bg-white border border-slate-200 px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm hover:bg-slate-50 transition-all"
               >
                 Clear Filters
               </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* QUICK PREFERENCES CTA */}
      <div className="rounded-[2.5rem] bg-slate-900 p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <div className="h-64 w-64 rounded-full bg-secondary translate-x-20 -translate-y-20 blur-3xl group-hover:scale-110 transition-transform duration-1000" />
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto md:mx-0">
                <Settings className="h-6 w-6 text-secondary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-heading font-black uppercase tracking-tight">Notification Preferences</h2>
                <p className="text-xs font-medium text-slate-400 max-w-sm mx-auto md:mx-0">Manage how and when you receive updates across email, mobile, and web channels.</p>
              </div>
            </div>
            <button 
              onClick={onConfigureAlerts}
              className="w-full md:w-auto rounded-full bg-white px-8 sm:px-10 py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-xl hover:bg-secondary hover:text-white transition-all shrink-0"
            >
               Configure Alerts
            </button>
         </div>
      </div>

      {/* NOTIFICATION DETAILS MODAL */}
      <AnimatePresence>
        {selectedNotif && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    {getIcon(selectedNotif.type)}
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                      {selectedNotif.type || 'Notification'} Details
                    </span>
                    <h2 className="text-lg font-heading font-black text-primary uppercase tracking-tight">
                      {selectedNotif.title}
                    </h2>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNotif(null)}
                  className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6 flex-grow">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Description</span>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    {selectedNotif.description || "You have a new update from the BIG community! Check your circle threads or learning dashboard for more details."}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 p-4 rounded-2xl">
                  <Clock className="h-4 w-4 text-secondary" />
                  <span>Received {selectedNotif.timestamp ? formatTimeAgo(selectedNotif.timestamp) : 'Just now'}</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="rounded-full bg-primary text-white px-8 py-3.5 text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-md"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
