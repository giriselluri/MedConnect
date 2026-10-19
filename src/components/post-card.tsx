'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { Post, Comment } from '@/types';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
  UserCheck,
  Compass,
  Globe,
  Repeat,
  Edit2,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { SpecialtyBadge } from './specialty-badge';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
}

export function PostCard({ post, onPostDeleted }: PostCardProps) {
  const { currentUser, toggleBookmark } = useApp();
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [repostsCount, setRepostsCount] = useState(post.reposts_count || 0);
  const [isLiked, setIsLiked] = useState(Boolean(post.is_liked));
  const [isBookmarked, setIsBookmarked] = useState(Boolean(post.is_bookmarked));
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Repost modal
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);
  const [quoteComment, setQuoteComment] = useState('');
  const [isReposting, setIsReposting] = useState(false);

  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState('');

  const isAuthor = currentUser?.id === post.author_id;
  const isAdmin = Boolean(currentUser?.is_admin || currentUser?.role === 'admin');
  const canDelete = isAuthor || isAdmin;

  const handleToggleLike = async () => {
    // Optimistic toggle
    const newIsLiked = !isLiked;
    const newCount = newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(newIsLiked);
    setLikesCount(newCount);

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.likes_count);
        setIsLiked(data.is_liked);
      }
    } catch (e) {
      // Revert if failed
      setIsLiked(!newIsLiked);
      setLikesCount(likesCount);
    }
  };

  const handleToggleBookmark = async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    await toggleBookmark('post', post.id, {
      title: `${post.author.full_name}: ${post.content.slice(0, 60)}...`,
      summary: post.content,
    });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments([...comments, data.comment]);
        setNewComment('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this clinical post?')) return;
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      if (res.ok) {
        onPostDeleted?.(post.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRepost = async () => {
    setIsReposting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/repost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote_comment: quoteComment.trim() || undefined }),
      });
      if (res.ok) {
        setRepostsCount((c) => c + 1);
        setIsRepostModalOpen(false);
        setQuoteComment('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsReposting(false);
    }
  };

  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.content);
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!editedCommentText.trim()) return;
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: commentId, content: editedCommentText.trim() }),
      });
      if (res.ok) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, content: editedCommentText.trim() } : c))
        );
        setEditingCommentId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await fetch(`/api/posts/${post.id}/comments?comment_id=${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/#${post.id}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <article className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 sm:p-5 transition hover:border-slate-300 relative">
      {/* Repost attribution bar if this post is a repost */}
      {post.repost_of && (
        <div className="flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50/80 px-2.5 py-1 rounded-lg mb-3 font-semibold border border-teal-200/60">
          <Repeat className="w-3.5 h-3.5 text-teal-600" />
          <span>{post.author.full_name} reposted:</span>
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 group min-w-0">
          <img
            src={post.author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.full_name)}&background=0d9488&color=fff`}
            alt={post.author.full_name}
            className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 group-hover:text-teal-700 transition text-sm">
                {post.author.full_name}
              </span>
              {post.author.is_verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              )}
              {post.author.is_admin && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-amber-100 text-amber-800 rounded">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 line-clamp-1 leading-snug">
              {post.author.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 flex-wrap">
              <span>{post.author.institution}</span>
              <span>•</span>
              <span>{formatTimeAgo(post.created_at)}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-500 font-medium capitalize" title={`Visible to: ${post.visibility || 'everyone'}`}>
                {post.visibility === 'connections' && <Users className="w-3 h-3 text-teal-600" />}
                {post.visibility === 'followers' && <UserCheck className="w-3 h-3 text-teal-600" />}
                {post.visibility === 'group' && <Compass className="w-3 h-3 text-teal-600" />}
                {(!post.visibility || post.visibility === 'everyone') && <Globe className="w-3 h-3 text-slate-400" />}
                <span>
                  {post.visibility === 'connections'
                    ? 'Connections'
                    : post.visibility === 'followers'
                    ? 'Followers'
                    : post.visibility === 'group'
                    ? 'Group'
                    : 'Everyone'}
                </span>
              </span>
            </div>
          </div>
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0 relative">
          {post.specialty && (
            <SpecialtyBadge id={post.specialty.id} name={post.specialty.name} size="sm" />
          )}

          {canDelete && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20">
                  <button
                    onClick={handleDeletePost}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Post</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content (Quote comment or original post text) */}
      {post.content && (
        <div className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line mb-3 font-normal">
          {post.content}
        </div>
      )}

      {/* Embedded Original Post Card for Reposts */}
      {post.repost_of && (
        <div className="mb-3.5 p-3.5 rounded-xl border border-slate-200 bg-slate-50/90 space-y-2">
          <div className="flex items-center gap-2">
            <img
              src={post.repost_of.author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.repost_of.author.full_name)}&background=0d9488&color=fff`}
              alt={post.repost_of.author.full_name}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0">
              <Link href={`/profile/${post.repost_of.author.id}`} className="font-bold text-xs text-slate-900 hover:text-teal-700 truncate block">
                {post.repost_of.author.full_name}
              </Link>
              <p className="text-[10px] text-slate-500 truncate">{post.repost_of.author.title}</p>
            </div>
          </div>
          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
            {post.repost_of.content}
          </p>
          {post.repost_of.article_url && (
            <a
              href={post.repost_of.article_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-medium pt-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{post.repost_of.article_title || post.repost_of.article_url}</span>
            </a>
          )}
        </div>
      )}

      {/* Topic Tags */}
      {post.topic_tags && post.topic_tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.topic_tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium text-teal-800 hover:text-teal-950 bg-teal-50 px-2 py-0.5 rounded transition cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Attached Scientific Article Link Preview */}
      {post.article_url && !post.repost_of && (
        <a
          href={post.article_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3.5 block p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100/90 hover:border-teal-300 transition group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded inline-block mb-1">
                {post.article_source || 'Journal Publication'}
              </span>
              <h5 className="font-semibold text-slate-900 group-hover:text-teal-800 text-xs sm:text-sm line-clamp-2">
                {post.article_title || post.article_url}
              </h5>
              <p className="text-[11px] text-slate-500 truncate mt-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-slate-400" />
                {post.article_url}
              </p>
            </div>
          </div>
        </a>
      )}

      {/* Interaction Counters Bar */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 py-2 border-y border-slate-100 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded-full bg-rose-50 text-rose-600">
            <Heart className="w-3 h-3 fill-rose-500" />
          </span>
          <span>{likesCount} {likesCount === 1 ? 'Endorsement' : 'Endorsements'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{comments.length} Comments</span>
          <span>{repostsCount} {repostsCount === 1 ? 'Repost' : 'Reposts'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between text-slate-600 text-xs pt-1">
        <button
          onClick={handleToggleLike}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition ${
            isLiked ? 'text-rose-600 font-bold bg-rose-50/50' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
          <span>{isLiked ? 'Endorsed' : 'Endorse'}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition ${
            showComments ? 'text-teal-700 font-semibold bg-teal-50' : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        <button
          onClick={() => setIsRepostModalOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-slate-100 font-medium transition text-slate-600 hover:text-teal-700"
          title="Repost to your network"
        >
          <Repeat className="w-4 h-4" />
          <span>Repost</span>
        </button>

        <button
          onClick={handleShare}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-slate-100 font-medium transition text-slate-600"
        >
          <Share2 className="w-4 h-4" />
          <span>{shareCopied ? 'Link Copied!' : 'Share'}</span>
        </button>

        <button
          onClick={handleToggleBookmark}
          className={`px-3 py-1.5 rounded-lg transition ${
            isBookmarked ? 'text-teal-700 bg-teal-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          title="Save to bookmarks"
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-teal-700' : ''}`} />
        </button>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          {/* Add Comment input */}
          <form onSubmit={handleAddComment} className="flex gap-2.5 items-start">
            <img
              src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&q=80&w=100'}
              alt={currentUser?.full_name || 'User'}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name || 'User')}&background=0d9488&color=fff&bold=true`;
              }}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a clinical observation or peer comment..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <Send className="w-3 h-3" />
                <span>Reply</span>
              </button>
            </div>
          </form>

          {/* Comments list */}
          <div className="space-y-2.5 pt-1">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-2">
                No comments yet. Start the clinical discussion.
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5 items-start bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <img
                    src={comment.author.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.full_name)}&background=0d9488&color=fff`}
                    alt={comment.author.full_name}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <Link href={`/profile/${comment.author.id}`} className="font-semibold text-slate-900 text-xs hover:text-teal-700 truncate">
                        {comment.author.full_name}
                      </Link>
                      <span className="text-[10px] text-slate-400">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{comment.author.title}</p>

                    {/* Inline Comment Editing Form */}
                    {editingCommentId === comment.id ? (
                      <div className="mt-1.5 space-y-1.5">
                        <textarea
                          rows={2}
                          value={editedCommentText}
                          onChange={(e) => setEditedCommentText(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEditComment(comment.id)}
                            className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded text-[11px] font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-800 mt-1 whitespace-pre-line leading-relaxed">
                        {comment.content}
                      </p>
                    )}

                    {/* Comment author/admin actions */}
                    {(currentUser?.id === comment.author_id || isAdmin) && editingCommentId !== comment.id && (
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <button
                          onClick={() => handleStartEditComment(comment)}
                          className="hover:text-teal-700 hover:underline inline-flex items-center gap-0.5"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="hover:text-red-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Repost Modal */}
      {isRepostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                <Repeat className="w-4 h-4 text-teal-600" />
                <span>Repost to Your Feed</span>
              </div>
              <button
                onClick={() => setIsRepostModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Add your clinical perspective, or repost instantly with original attribution to {post.author.full_name}.
            </p>

            <textarea
              rows={3}
              placeholder="Add your clinical commentary (optional)..."
              value={quoteComment}
              onChange={(e) => setQuoteComment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-500 rounded-xl p-3 text-xs text-slate-800 focus:outline-hidden mb-3"
            />

            {/* Snippet of original post */}
            <div className="p-2.5 bg-slate-100/70 rounded-lg border border-slate-200 text-xs text-slate-600 line-clamp-2 mb-4">
              <strong>{post.author.full_name}:</strong> {post.content}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRepostModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRepost}
                disabled={isReposting}
                className="px-4 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isReposting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{quoteComment.trim() ? 'Quote & Repost' : 'Instant Repost'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
