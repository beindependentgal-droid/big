import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Member } from '../data';

interface MentionDropdownProps {
  members: Member[];
  query: string;
  onSelect: (member: Member) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function MentionDropdown({ members, query, onSelect, onClose, position }: MentionDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % filteredMembers.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + filteredMembers.length) % filteredMembers.length);
      e.preventDefault();
    } else if (e.key === 'Enter' && filteredMembers[selectedIndex]) {
      onSelect(filteredMembers[selectedIndex]);
      e.preventDefault();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filteredMembers, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (filteredMembers.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed z-[100] w-64 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-2 max-h-60 overflow-y-auto">
        {filteredMembers.map((member, index) => (
          <button
            key={member.id}
            onClick={() => onSelect(member)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
              index === selectedIndex ? 'bg-slate-100' : 'hover:bg-slate-50'
            }`}
          >
            <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-slate-100">
              {member.avatar ? (
                <img src={member.avatar || null} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-full w-full bg-primary flex items-center justify-center text-white text-[10px] font-bold">
                  {member.name[0]}
                </div>
              )}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{member.title}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function useMentions(members: Member[]) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const handleTextChange = useCallback((text: string) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const lastAtSign = textBeforeCursor.lastIndexOf('@');

    if (lastAtSign !== -1) {
      const query = textBeforeCursor.substring(lastAtSign + 1);
      // Ensure no spaces between @ and cursor
      if (!query.includes(' ')) {
        setMentionQuery(query);
        setShowDropdown(true);

        // Calculate position (rough approximation)
        if (inputRef.current) {
          const { top, left, height } = inputRef.current.getBoundingClientRect();
          setDropdownPosition({ top: top + 40, left: left + 20 });
        }
        return;
      }
    }
    setShowDropdown(false);
  }, []);

  const selectMention = useCallback((member: Member, currentText: string, setText: (t: string) => void) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = currentText.substring(0, cursorPosition);
    const textAfterCursor = currentText.substring(cursorPosition);
    const lastAtSign = textBeforeCursor.lastIndexOf('@');

    const newText = 
      textBeforeCursor.substring(0, lastAtSign) + 
      `@${member.name} ` + 
      textAfterCursor;

    setText(newText);
    setShowDropdown(false);
    
    // Set focus back to input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = lastAtSign + member.name.length + 2;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, []);

  return {
    showDropdown,
    mentionQuery,
    dropdownPosition,
    textareaRef: inputRef, // Keep name for compatibility or rename to inputRef
    inputRef,
    handleTextChange,
    selectMention,
    closeDropdown: () => setShowDropdown(false)
  };
}

export function MentionContent({ content }: { content: string }) {
  // Regex to match @Name followed by space or end of string
  // Note: Names can contain spaces, but our simple implementation uses the full name from selection.
  // In a real app, we'd use IDs. Here we'll match @ followed by words until it matches a member name pattern.
  // For simplicity, let's highlight anything starting with @ and ending at a boundary.
  
  const parts = content.split(/(@[\w\s]+?)(?=\s|$|[.,!?;])/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <span key={i} className="text-secondary font-bold hover:underline cursor-pointer">
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}
