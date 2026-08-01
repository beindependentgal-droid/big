import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Bookmark, 
  Share2, 
  Trash2, 
  Ban, 
  Lock, 
  MoreHorizontal,
  Globe,
  ThumbsUp,
  Repeat,
  Heart,
  X,
  Check,
  Flag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Member, Post } from '../data';
import { copyToClipboard, getSafeSrc, formatTimeAgo, formatDisplayDate } from '../lib/utils';
import { useMentions, MentionDropdown, MentionContent } from './Mentions';

// Define LinkedIn reaction types
const LINKEDIN_REACTIONS = [
  { id: 'like', emoji: '❤️', label: 'Like', color: 'text-rose-600' },
];

interface PostCardProps {
  key?: any;
  post: Post;
  currentUser: Member;
  isBookmarked: boolean;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onToggleMute: (userId: string) => void;
  onDelete: (id: string) => void;
  onEdit: (post: Post) => void;
  onShare: (title: string, customUrl?: string, shared?: boolean) => void;
  onViewProfile?: (id: string) => void;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (val: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  isMuted: boolean;
  onCommentSubmit: (postId: string, text: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onEditComment: (comment: any) => void;
  editingCommentId: string | null;
  editCommentContent: string;
  onEditCommentChange: (val: string) => void;
  onSaveCommentEdit: (postId: string, commentId: string) => void;
  onCancelCommentEdit: () => void;
  commentsDisabled?: boolean;
  onToggleCommentsDisabled: (postId: string) => void;
  onRepost?: (postId: string, thoughts?: string) => void;
  members?: Member[];
  onReportPost?: (postId: string) => void;
  onHidePost?: (postId: string) => void;
}

export function PostCard({
  post,
  currentUser,
  isBookmarked,
  onToggleLike,
  onToggleBookmark,
  onToggleMute,
  onDelete,
  onEdit,
  onShare,
  onViewProfile,
  isEditing,
  editContent,
  onEditContentChange,
  onSaveEdit,
  onCancelEdit,
  isMuted,
  onCommentSubmit,
  onDeleteComment,
  onEditComment,
  editingCommentId,
  editCommentContent,
  onEditCommentChange,
  onSaveCommentEdit,
  onCancelCommentEdit,
  commentsDisabled,
  onToggleCommentsDisabled,
  onRepost,
  members = [],
  onReportPost,
  onHidePost
}: PostCardProps) {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const {
    showDropdown,
    mentionQuery,
    dropdownPosition,
    inputRef: commentInputRef,
    handleTextChange,
    selectMention,
    closeDropdown
  } = useMentions(members);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCommentText(val);
    handleTextChange(val);
  };

  const hasUserLiked = Array.isArray(post.likes) ? post.likes.includes(currentUser.id) : !!post.liked;
  const likesCount = Array.isArray(post.likes) ? post.likes.length : (typeof post.likes === 'number' ? post.likes : 0);

  // Custom states for Repost dialogue
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [isQuoteRepost, setIsQuoteRepost] = useState(false);
  const [repostThoughts, setRepostThoughts] = useState('');
  
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isOwner = post.author.id === currentUser.id || post.author.name.includes('(You)');

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onCommentSubmit(post.id, commentText);
    setCommentText('');
    closeDropdown();
  };

  const handleDefaultLikeClick = () => {
    onToggleLike(post.id);
  };

  const copyPostLink = async () => {
    const link = `${window.location.origin}/posts/${post.id}`;
    await copyToClipboard(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareClick = async () => {
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    const shareData = {
      title: `Inspiration from ${post.author.name}`,
      text: post.content.substring(0, 100) + '...',
      url: postUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (onShare) {
          onShare(post.content, postUrl, true);
        }
        return;
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    }

    // Fallback: Copy link to clipboard
    const success = await copyToClipboard(postUrl);
    if (success) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
      if (onShare) {
        onShare(post.content, postUrl, false);
      }
    } else {
      console.error('Failed to copy link');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-200 bg-white shadow-sm mb-4 overflow-hidden relative"
    >
      <div className="p-4 sm:p-5">
        
        {/* Top Header Card Info */}
        <div className="flex items-start justify-between mb-3.5 gap-4">
          <div className="flex items-center gap-3">
            {/* Circular Avatar */}
            <div 
              onClick={() => onViewProfile?.(post.author.id || currentUser.id)}
              className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            >
              {getSafeSrc(post.author.avatar) ? (
                <img src={getSafeSrc(post.author.avatar)} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-white font-black text-base flex items-center justify-center w-full h-full bg-primary">{post.author.name[0]}</span>
              )}
            </div>
            
            {/* Name and Professional Subtitles */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 
                  onClick={() => onViewProfile?.(post.author.id || currentUser.id)}
                  className="text-sm font-bold text-slate-900 hover:text-secondary hover:underline transition-all cursor-pointer truncate"
                >
                  {post.author.name.replace(/\s*\(You\)/gi, '')}
                </h4>
                {isOwner && (
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md uppercase tracking-wider">You</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-normal line-clamp-1 mt-0.5 leading-tight">
                {post.author.rank || 'BIG Community Leader'} • Member of Be Independent Gal
              </p>
              <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                <span className="text-[10px] font-medium">
                  {post.status === 'scheduled' && post.scheduledFor 
                    ? `Scheduled for ${formatDisplayDate(post.scheduledFor)}` 
                    : formatTimeAgo(post.timestamp)}
                </span>
                <span className="text-[10px]">•</span>
                <Globe className="h-3 w-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Action menu buttons */}
          <div className="flex items-center gap-1 relative">
            <button 
              onClick={() => onToggleBookmark(post.id)}
              className={`p-2 rounded-full transition-all ${isBookmarked ? 'text-secondary bg-pink-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
              title="Save Post"
            >
              <Bookmark className={`h-4.5 w-4.5 ${isBookmarked ? 'fill-current' : 'stroke-[2px]'}`} />
            </button>

            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
              title="More options"
            >
              <MoreHorizontal className="w-4.5 h-4.5 stroke-[2px]" />
            </button>

            <AnimatePresence>
              {showOptionsMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20 flex flex-col"
                >
                  {isOwner ? (
                    <>
                      <button
                        onClick={() => { onEdit(post); setShowOptionsMenu(false); }}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left"
                      >
                        <MoreHorizontal className="w-4 h-4" /> Edit Post
                      </button>
                      <button
                        onClick={() => { onDelete(post.id); setShowOptionsMenu(false); }}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Post
                      </button>
                      <div className="h-[1px] bg-slate-100 w-full" />
                      <button
                        onClick={() => { onToggleCommentsDisabled(post.id); setShowOptionsMenu(false); }}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-amber-600 hover:bg-amber-50 transition-colors text-left"
                      >
                        {commentsDisabled ? <MessageSquare className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        {commentsDisabled ? "Enable Comments" : "Disable Comments"}
                      </button>
                    </>
                  ) : (
                    <>
                      {post.author.id && (
                        <button
                          onClick={() => { onToggleMute(post.author.id); setShowOptionsMenu(false); }}
                          className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors text-left ${isMuted ? 'text-amber-600 bg-amber-50' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <Ban className="w-4 h-4" /> {isMuted ? "Unmute User" : "Mute User"}
                        </button>
                      )}
                      {onHidePost && (
                        <button
                          onClick={() => { onHidePost(post.id); setShowOptionsMenu(false); }}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left"
                        >
                          <X className="w-4 h-4" /> Hide Post
                        </button>
                      )}
                      {onReportPost && (
                        <button
                          onClick={() => { onReportPost(post.id); setShowOptionsMenu(false); }}
                          className="flex items-center gap-2 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <Flag className="w-4 h-4" /> Report Post
                        </button>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-3">
          {isEditing ? (
            <div className="mb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <textarea
                value={editContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                className="w-full rounded-lg bg-slate-50 border border-slate-200 focus:border-secondary p-4 text-[14px] text-slate-700 resize-none min-h-[120px] focus:outline-none focus:ring-1 focus:ring-secondary"
                placeholder="Share updates with sisters..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={onCancelEdit}
                  className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSaveEdit(post.id)}
                  disabled={!editContent.trim()}
                  className="px-5 py-1.5 text-xs font-bold text-white bg-secondary hover:bg-secondary/90 disabled:opacity-50 rounded-lg shadow-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[14px] font-normal text-slate-800 leading-normal whitespace-pre-wrap">
                <MentionContent content={post.content.length > 280 && !isExpanded ? post.content.substring(0, 280) + '...' : post.content} />
              </p>
              {post.content.length > 280 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  {isExpanded ? 'Show less' : '...read more'}
                </button>
              )}
            </div>
          )}

          {/* Hashtags styled professionally in LinkedIn brand blue */}
          {post.tags && post.tags.length > 0 && !isEditing && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {post.tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="text-xs font-bold text-secondary hover:underline cursor-pointer transition-all"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Full Width Image */}
      {post.imageUrl && !isEditing && (
        <div className="border-t border-b border-slate-150 overflow-hidden bg-slate-50">
          <img 
            src={post.imageUrl} 
            className="w-full h-auto max-h-[400px] object-cover hover:opacity-95 transition-opacity duration-300" 
            alt="Embedded attachment" 
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Interaction Metrics Row */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 text-[11px] text-slate-500">
        {/* Left: Like indicator */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center -space-x-1">
            <Heart className={`h-4 w-4 ${hasUserLiked ? 'text-rose-500 fill-current' : 'text-slate-400'}`} />
          </div>
          <span className="hover:text-secondary hover:underline cursor-pointer font-medium ml-1" id={`likes-count-${post.id}`}>
            {likesCount > 0 ? (
              <>
                {(() => {
                  if (hasUserLiked) {
                    if (likesCount === 1) return <><span className="text-secondary font-bold mr-1">You</span> liked</>;
                    return <><span className="text-secondary font-bold mr-1">You</span> and {likesCount - 1} {likesCount - 1 === 1 ? 'other' : 'others'} liked</>;
                  }
                  return <>{likesCount} {likesCount === 1 ? 'person' : 'people'} liked</>;
                })()}
              </>
            ) : (
              <span>No likes yet</span>
            )}
          </span>
        </div>

        {/* Right: Comment & Repost stats */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowComments(!showComments)}
            className="hover:text-secondary hover:underline cursor-pointer"
          >
            {post.comments.length} comments
          </button>
          <span>•</span>
          <span className="hover:text-secondary hover:underline cursor-pointer">
            {post.repostsCount !== undefined ? post.repostsCount : 3} reposts
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="px-2 py-1 flex items-center justify-around relative">
        {/* Like Button */}
        <div className="relative">
          <button 
            onClick={handleDefaultLikeClick}
            className={`flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors ${
              hasUserLiked ? 'text-rose-600' : 'text-slate-500'
            }`}
            id={`like-btn-${post.id}`}
            title="Like"
          >
            <Heart className={`h-5 w-5 transition-transform duration-200 ${hasUserLiked ? 'fill-current text-rose-600' : 'text-slate-500'}`} />
          </button>
        </div>

        {/* Comment trigger */}
        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 transition-colors ${showComments ? 'text-secondary' : 'text-slate-500'}`}
          title="Comment"
        >
          <MessageSquare className="h-5 w-5" />
        </button>

        {/* Repost button */}
        <button 
          onClick={() => {
            setIsQuoteRepost(false);
            setRepostThoughts('');
            setShowRepostModal(true);
          }}
          className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 text-slate-500 transition-colors group"
          title="Repost"
        >
          <Repeat className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
        </button>

        {/* Share button */}
        <button 
          onClick={handleShareClick}
          className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          title="Share"
          id={`share-btn-${post.id}`}
        >
          {shareCopied ? (
            <Check className="h-5 w-5 text-emerald-500" />
          ) : (
            <Share2 className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Embedded Comments Section (Collapsible) */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-100 bg-slate-50/50 p-4"
          >
            {/* Direct Comment Input box */}
            {commentsDisabled ? (
              <div className="rounded-lg bg-slate-100 p-3 border border-slate-200 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold mb-4">
                <Lock className="h-4 w-4" />
                <span>Comments are disabled for this professional update</span>
              </div>
            ) : (
              <div className="flex gap-3 mb-4 items-start">
                <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                  {getSafeSrc(currentUser.avatar) ? (
                    <img src={getSafeSrc(currentUser.avatar)} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-white font-black text-sm flex items-center justify-center h-full w-full bg-primary">{currentUser.name[0]}</span>
                  )}
                </div>
                <div className="flex-1 relative">
                  <div className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all">
                    <input
                      ref={commentInputRef}
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={handleCommentChange}
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                      className="flex-1 bg-transparent border-none text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!commentText.trim()}
                      className="text-secondary disabled:text-slate-300 transition-all font-bold text-xs"
                      id={`post-comment-btn-${post.id}`}
                    >
                      Post Comment
                    </button>
                  </div>

                  {showDropdown && (
                    <MentionDropdown
                      members={members}
                      query={mentionQuery}
                      position={dropdownPosition}
                      onSelect={(member) => selectMention(member, commentText, setCommentText)}
                      onClose={closeDropdown}
                    />
                  )}
                </div>
              </div>
            )}

            {/* List of Comments */}
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5 items-start">
                  {/* Circle commenter avatar */}
                  <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                    {getSafeSrc(comment.author.avatar) ? (
                      <img src={getSafeSrc(comment.author.avatar)} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-slate-500 font-bold text-xs flex items-center justify-center h-full w-full bg-slate-100">{comment.author.name[0]}</span>
                    )}
                  </div>
                  
                  {/* Comment Bubble */}
                  <div className="flex-1 min-w-0">
                    <div className="rounded-r-xl rounded-bl-xl bg-slate-100 p-3 relative group/comment">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-bold text-slate-900 block leading-tight">
                              {comment.author.name.replace(/\s*\(You\)/gi, '')}
                            </span>
                            {(comment.author.id === currentUser.id || comment.author.name.includes('(You)')) && (
                              <span className="text-[8px] font-bold bg-slate-200/80 text-slate-600 px-1 rounded">You</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 block">BIG Community Member</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] text-slate-400 font-medium">{formatTimeAgo(comment.createdAt || comment.timestamp)}</span>
                          
                          {(comment.author.id === currentUser.id || comment.author.name.includes('(You)') || isOwner || currentUser.isSuperAdmin) && (
                            <div className="flex items-center gap-0.5 opacity-80 hover:opacity-100 transition-opacity">
                              {(comment.author.id === currentUser.id || comment.author.name.includes('(You)')) && (
                                <button 
                                  onClick={() => onEditComment(comment)}
                                  className="p-1 text-slate-400 hover:text-secondary transition-colors"
                                  title="Edit"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button 
                                onClick={() => setDeletingCommentId(comment.id)}
                                className={`p-1 transition-colors ${deletingCommentId === comment.id ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {deletingCommentId === comment.id ? (
                        <div className="mt-2 p-2 bg-rose-50 rounded-lg border border-rose-100 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-rose-700 font-semibold">Delete comment?</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setDeletingCommentId(null)}
                              className="px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-slate-200 rounded bg-white border border-slate-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => {
                                onDeleteComment(post.id, comment.id);
                                setDeletingCommentId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded shadow-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : editingCommentId === comment.id ? (
                        <div className="space-y-2 mt-2">
                          <textarea
                            value={editCommentContent}
                            onChange={(e) => onEditCommentChange(e.target.value)}
                            className="w-full rounded-lg bg-white border border-slate-300 p-2.5 text-xs text-slate-700 focus:outline-none focus:border-secondary"
                            rows={2}
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={onCancelCommentEdit}
                              className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:bg-slate-200 rounded-md"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => onSaveCommentEdit(post.id, comment.id)}
                              className="px-3 py-1 text-[10px] font-bold text-white bg-secondary rounded-md shadow-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 font-normal leading-normal">
                          <MentionContent content={comment.content} />
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Repost Interactive Modal */}
      {showRepostModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Repeat className="h-4.5 w-4.5 text-secondary" />
                Repost this inspiration
              </h3>
              <button 
                onClick={() => setShowRepostModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex gap-3 bg-pink-50/20 p-3 rounded-xl border border-secondary/10">
                <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-slate-100">
                  {getSafeSrc(post.author.avatar) ? (
                    <img src={getSafeSrc(post.author.avatar)} className="h-full w-full object-cover" alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-full w-full bg-primary flex items-center justify-center text-white font-bold text-sm">{post.author.name[0]}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800">{post.author.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{post.timestamp}</p>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 italic">"{post.content}"</p>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input 
                  type="checkbox" 
                  id="quote-check" 
                  checked={isQuoteRepost} 
                  onChange={(e) => setIsQuoteRepost(e.target.checked)}
                  className="rounded text-secondary focus:ring-secondary cursor-pointer h-4 w-4"
                />
                <label htmlFor="quote-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Add sisterly thoughts (Quote repost)
                </label>
              </div>

              {isQuoteRepost && (
                <textarea
                  value={repostThoughts}
                  onChange={(e) => setRepostThoughts(e.target.value)}
                  placeholder="Share what makes this special, sister! E.g. 'Highly recommend reading this amazing advice...'"
                  className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-700 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary resize-none min-h-[90px]"
                  autoFocus
                />
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowRepostModal(false)}
                className="px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onRepost) {
                    onRepost(post.id, isQuoteRepost ? repostThoughts : undefined);
                  }
                  setShowRepostModal(false);
                }}
                disabled={isQuoteRepost && !repostThoughts.trim()}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 disabled:opacity-50 text-xs font-bold shadow-md cursor-pointer"
              >
                {isQuoteRepost ? 'Post with thoughts' : 'Repost instantly'}
              </button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
