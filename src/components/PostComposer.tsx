import React, { useState } from 'react';
import { Member } from '../data';
import { 
  Image as ImageIcon, 
  Calendar, 
  FileText, 
  Smile, 
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Users,
  Award
} from 'lucide-react';
import { useMentions, MentionDropdown } from './Mentions';

interface PostComposerProps {
  currentUser: Member;
  onPost: (content: string, type: string, scheduledFor?: string) => void;
  members: Member[];
  standalone?: boolean;
  onClose?: () => void;
}

export function PostComposer({ currentUser, onPost, members, standalone = false, onClose }: PostComposerProps) {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState('connect');
  const [selectedTag, setSelectedTag] = useState('general');
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  const {
    showDropdown,
    mentionQuery,
    dropdownPosition,
    textareaRef,
    handleTextChange,
    selectMention,
    closeDropdown
  } = useMentions(members);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;
    onPost(content, selectedTag, isScheduling ? scheduledDate : undefined);
    setContent('');
    setIsExpanded(false);
    setIsScheduling(false);
    setScheduledDate('');
  };

  // Preset quick hashtags helper
  const addHashtag = (tag: string) => {
    if (!content.includes(`#${tag}`)) {
      setContent(prev => prev.trim() ? `${prev} #${tag}` : `#${tag}`);
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    handleTextChange(val);
  };

  if (standalone) {
    return (
      <div className="flex flex-col bg-white dark:bg-slate-900 overflow-hidden w-full">
        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 max-h-[60vh] text-left">
          {/* Profile details and custom dropdown tags */}
          <div className="flex gap-3">
            <div className="h-11 w-11 rounded-full bg-slate-100 overflow-hidden shrink-0 border-2 border-secondary/20 shadow-sm">
              {currentUser.avatar ? (
                <img src={currentUser.avatar || undefined} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-white font-black text-base flex items-center justify-center h-full w-full bg-primary">{currentUser.name[0]}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{currentUser.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {/* Share publicly dropdown */}
                <button type="button" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold transition-all">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Anyone</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {/* Post into Circle dropdown */}
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <select 
                    value={selectedCircle}
                    onChange={(e) => setSelectedCircle(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 p-0 text-[10px] font-bold cursor-pointer text-slate-600 dark:text-slate-300"
                  >
                    <option value="connect">🔌 Connect Circle</option>
                    <option value="learn">📚 Learn Circle</option>
                    <option value="earn">💼 Earn Circle</option>
                    <option value="thrive">💖 Thrive Circle</option>
                  </select>
                </div>

                {/* Category Selection dropdown */}
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50">
                  <select 
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 p-0 text-[10px] font-bold cursor-pointer text-slate-600 dark:text-slate-300"
                  >
                    <option value="general">📣 General Update</option>
                    <option value="win">🏆 Celebration Win</option>
                    <option value="question">💡 Sisterly Question</option>
                    <option value="Marketing">📈 Marketing</option>
                    <option value="Tech">💻 Tech</option>
                    <option value="Funding">💰 Funding</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Rich editor text input */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextAreaChange}
            autoFocus
            placeholder="What do you want to talk about, sister? Share updates, skills, or questions."
            className="w-full border-none resize-none text-[15px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 focus:outline-none min-h-[160px] py-2 bg-transparent"
          />

          {showDropdown && (
            <MentionDropdown
              members={members}
              query={mentionQuery}
              position={dropdownPosition}
              onSelect={(member) => selectMention(member, content, setContent)}
              onClose={closeDropdown}
            />
          )}

          {/* Instant template helpers */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Add sisterhood hashtags</p>
            <div className="flex flex-wrap gap-1.5">
              {['SisterhoodWins', 'WomenInBusiness', 'FinancialFreedom', 'TechGrants'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addHashtag(tag)}
                  className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-pink-50/30 hover:text-secondary border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold transition-all cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer toolbar */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          {/* Media tools shortcuts */}
          <div className="flex items-center gap-1.5">
            <button type="button" className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors" title="Add photo">
              <ImageIcon className="h-5 w-5 text-indigo-600" />
            </button>
            <button 
              type="button" 
              onClick={() => setIsScheduling(!isScheduling)}
              className={`p-2 rounded-xl transition-colors ${isScheduling ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'}`} 
              title="Schedule post"
            >
              <Calendar className={`h-5 w-5 ${isScheduling ? 'text-secondary' : 'text-slate-500'}`} />
            </button>
            <button type="button" className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors" title="Add template">
              <FileText className="h-5 w-5 text-amber-500" />
            </button>
            <button type="button" className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors" title="Add emoji">
              <Smile className="h-5 w-5 text-amber-500" />
            </button>
          </div>

          {/* Submit Post button */}
          <div className="flex items-center gap-2">
            {isScheduling && (
              <input 
                type="datetime-local" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="text-[10px] font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none text-slate-700 dark:text-slate-200"
              />
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!content.trim()}
              className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/10 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer"
            >
              Post to Feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isExpanded) {
    return (
      <div className="rounded-2xl border border-secondary/30 dark:border-secondary/50 bg-white dark:bg-slate-900 shadow-md mb-4 relative overflow-hidden transition-all duration-300 text-left animate-fade-in">
        {/* Subtle decorative top line using brand gradient */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-accent" />
        
        {/* Header with Close/Collapse button */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
            Create a sisterly post
          </h2>
          <button 
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Profile details and custom dropdown tags */}
          <div className="flex gap-3">
            <div className="h-11 w-11 rounded-full bg-slate-100 overflow-hidden shrink-0 border-2 border-secondary/20 shadow-sm">
              {currentUser.avatar ? (
                <img src={currentUser.avatar || undefined} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-white font-black text-base flex items-center justify-center h-full w-full bg-primary">{currentUser.name[0]}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{currentUser.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {/* Share publicly dropdown */}
                <button type="button" className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold transition-all">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Anyone</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {/* Post into Circle dropdown */}
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <select 
                    value={selectedCircle}
                    onChange={(e) => setSelectedCircle(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 p-0 text-[10px] font-bold cursor-pointer text-slate-600 dark:text-slate-300"
                  >
                    <option value="connect">🔌 Connect Circle</option>
                    <option value="learn">📚 Learn Circle</option>
                    <option value="earn">💼 Earn Circle</option>
                    <option value="thrive">💖 Thrive Circle</option>
                  </select>
                </div>

                {/* Category Selection dropdown */}
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/50">
                  <select 
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="bg-transparent border-none outline-none focus:ring-0 p-0 text-[10px] font-bold cursor-pointer text-slate-600 dark:text-slate-300"
                  >
                    <option value="general">📣 General Update</option>
                    <option value="win">🏆 Celebration Win</option>
                    <option value="question">💡 Sisterly Question</option>
                    <option value="Marketing">📈 Marketing</option>
                    <option value="Tech">💻 Tech</option>
                    <option value="Funding">💰 Funding</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Rich editor text input */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextAreaChange}
            autoFocus
            placeholder="What do you want to talk about, sister? Share updates, skills, or questions."
            className="w-full border-none resize-none text-[15px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 focus:outline-none min-h-[140px] py-2 bg-transparent"
          />

          {showDropdown && (
            <MentionDropdown
              members={members}
              query={mentionQuery}
              position={dropdownPosition}
              onSelect={(member) => selectMention(member, content, setContent)}
              onClose={closeDropdown}
            />
          )}

          {/* Instant template helpers */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Add sisterhood hashtags</p>
            <div className="flex flex-wrap gap-1.5">
              {['SisterhoodWins', 'WomenInBusiness', 'FinancialFreedom', 'TechGrants'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addHashtag(tag)}
                  className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-pink-50/30 hover:text-secondary border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold transition-all cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer toolbar */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-3 items-center justify-between">
          {/* Media tools shortcuts */}
          <div className="flex items-center gap-1">
            <button type="button" className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors" title="Add photo">
              <ImageIcon className="h-5 w-5 text-indigo-600" />
            </button>
            <button 
              type="button" 
              onClick={() => setIsScheduling(!isScheduling)}
              className={`p-2 rounded-xl transition-colors ${isScheduling ? 'bg-secondary/10 text-secondary' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500'}`} 
              title="Schedule post"
            >
              <Calendar className={`h-5 w-5 ${isScheduling ? 'text-secondary' : 'text-slate-500'}`} />
            </button>
            <button type="button" className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors" title="Add template">
              <FileText className="h-5 w-5 text-amber-500" />
            </button>
            <button type="button" className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors" title="Add emoji">
              <Smile className="h-5 w-5 text-amber-500" />
            </button>
          </div>

          {/* Submit / Cancel buttons */}
          <div className="flex items-center gap-2">
            {isScheduling && (
              <input 
                type="datetime-local" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="text-[10px] font-bold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none text-slate-700 dark:text-slate-200"
              />
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!content.trim()}
              className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/10 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer"
            >
              Post to Feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm mb-4 relative overflow-hidden group transition-all duration-300">
      {/* Subtle decorative top line using brand gradient */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-accent" />
      
      <div className="flex gap-4 items-center">
        {/* Interactive Avatar with elegant gradient ring */}
        <div className="relative shrink-0">
          <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-secondary/20 shadow-sm transition-transform duration-300 group-hover:scale-105">
            {currentUser.avatar ? (
              <img src={currentUser.avatar || undefined} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-full w-full bg-primary flex items-center justify-center text-white font-bold text-base">
                {currentUser.name[0]}
              </div>
            )}
          </div>
          {/* Online status indicator */}
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
        
        {/* Elegant Input Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex-1 text-left bg-slate-50 dark:bg-slate-800 hover:bg-pink-50/10 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-secondary/30 transition-all duration-300 rounded-full px-5 py-3 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center shadow-inner cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
            <span>Share a sisterly update, win, or question...</span>
          </span>
        </button>
      </div>

      {/* Action icons row (Brand-styled button components) */}
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 sm:gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button 
          type="button"
          onClick={() => { setIsExpanded(true); }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all group/btn text-xs font-bold"
        >
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover/btn:bg-indigo-100 dark:group-hover/btn:bg-indigo-900/50 transition-colors">
            <ImageIcon className="h-4 w-4 stroke-[2.5px]" />
          </div>
          <span>Add Media</span>
        </button>

        <button 
          type="button"
          onClick={() => { setIsExpanded(true); }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all group/btn text-xs font-bold"
        >
          <div className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/50 text-secondary dark:text-pink-400 group-hover/btn:bg-pink-100 dark:group-hover/btn:bg-pink-900/50 transition-colors">
            <Calendar className="h-4 w-4 stroke-[2.5px]" />
          </div>
          <span>Schedule Event</span>
        </button>

        <button 
          type="button"
          onClick={() => { setIsExpanded(true); }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all group/btn text-xs font-bold"
        >
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover/btn:bg-amber-100 dark:group-hover/btn:bg-amber-900/50 transition-colors">
            <Award className="h-4 w-4 stroke-[2.5px]" />
          </div>
          <span>Celebrate Win</span>
        </button>
      </div>
    </div>
  );
}
