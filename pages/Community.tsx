
import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { MessageSquare, Heart, Share2, Send, MoreHorizontal, Image as ImageIcon, Video, Copy, X, Lock, Flag, Trash2, Globe, Facebook, Linkedin, Twitter } from 'lucide-react';
import { Button, Card, Badge, Modal, useToast } from '../components/ui';
import { api } from '../services/mockApi';
import { Post, Member, Role } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<Member | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'Official' | 'Community'>('Official');
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string }[]>([]);
  
  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postToShare, setPostToShare] = useState<string | null>(null);
  
  // Feed Lock State
  const [isFeedLocked, setIsFeedLocked] = useState(false);

  const { language } = useLanguage();
  const t = translations[language];
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
    checkFeedStatus();
  }, []);

  const loadData = async () => {
    const [fetchedPosts, currentUser] = await Promise.all([
        api.getPosts(),
        api.getCurrentUser()
    ]);
    setPosts(fetchedPosts);
    setUser(currentUser);
  };

  const checkFeedStatus = async () => {
      const status = await api.getFeedStatus();
      setIsFeedLocked(status.isLocked);
  };

  const handlePost = async () => {
    if (!newPostContent.trim() || !user) return;
    setLoading(true);
    try {
        const type = activeTab === 'Official' ? 'Announcement' : 'Discussion';
        
        // RBAC: Only admin/lead can post Official
        if (type === 'Announcement' && ![Role.ADMIN, Role.PRESIDENT, Role.VICE_PRESIDENT, Role.COMMITTEE_LEAD].includes(user.role)) {
             addToast('Only Admins can post announcements', 'error');
             setLoading(false);
             return;
        }

        await api.addPost({
            authorId: user.id,
            authorName: user.fullName,
            authorRole: user.role,
            authorSemester: user.semester,
            authorMajor: user.major,
            content: newPostContent,
            type: type,
            media: selectedMedia
        });
        setNewPostContent('');
        setSelectedMedia([]);
        addToast('Post published successfully', 'success');
        await loadData();
    } catch (e: any) {
        addToast(e.message, 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    const updatedPost = await api.toggleLike(postId, user.id);
    setPosts(posts.map(p => p.id === postId ? updatedPost : p));
  };

  const handleDeletePost = async (postId: string) => {
      if (confirm(t.confirmDelete)) {
          await api.deletePost(postId);
          setPosts(posts.filter(p => p.id !== postId));
          addToast('Post deleted', 'info');
      }
  };

  const handleReportPost = async (postId: string) => {
      await api.reportPost(postId);
      addToast(t.postReported, 'success');
      // Optimistically update UI
      setPosts(posts.map(p => p.id === postId ? { ...p, isReported: true } : p));
  };

  const handleLockPost = async (postId: string) => {
      const newStatus = await api.toggleLockPost(postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, isLocked: newStatus } : p));
      addToast(newStatus ? 'Comments Locked' : 'Comments Unlocked', 'info');
  };

  const handleToggleFeedLock = async () => {
      await api.setFeedStatus(!isFeedLocked);
      setIsFeedLocked(!isFeedLocked);
      addToast(!isFeedLocked ? 'Feed Locked' : 'Feed Unlocked', 'info');
  };

  const handleMediaAttach = (type: 'image' | 'video') => {
      const mockUrl = type === 'image' 
        ? 'https://via.placeholder.com/600x400' 
        : 'https://www.w3schools.com/html/mov_bbb.mp4';
      
      setSelectedMedia([...selectedMedia, { type, url: mockUrl }]);
      addToast(`${type === 'image' ? 'Image' : 'Video'} attached`, 'info');
  };

  const openShare = (postId: string) => {
      setPostToShare(postId);
      setIsShareModalOpen(true);
  };

  const filteredPosts = posts.filter(p => activeTab === 'Official' ? p.type === 'Announcement' : p.type === 'Discussion');
  const isAdminOrLead = user && [Role.ADMIN, Role.PRESIDENT, Role.VICE_PRESIDENT, Role.COMMITTEE_LEAD].includes(user.role);
  const canPostOfficial = isAdminOrLead;
  // Can post community if feed is not locked OR if user is admin
  const canPostCommunity = (!isFeedLocked || isAdminOrLead);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.community}</h1>
            <p className="text-slate-500 dark:text-slate-400">Announcements, discussions, and updates.</p>
        </div>
        
        <div className="flex items-center gap-2">
            {/* Feed Lock Toggle for Admins */}
            {isAdminOrLead && activeTab === 'Community' && (
                <button 
                    onClick={handleToggleFeedLock} 
                    className={`p-2 rounded-lg border transition-colors ${isFeedLocked ? 'bg-red-100 text-red-600 border-red-200' : 'bg-white text-slate-500 border-slate-200'}`}
                    title={isFeedLocked ? t.unlockFeed : t.lockFeed}
                >
                    {isFeedLocked ? <Lock size={20} /> : <Globe size={20} />}
                </button>
            )}

            {/* Feed Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('Official')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'Official' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    {t.officialFeed}
                </button>
                <button 
                    onClick={() => setActiveTab('Community')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'Community' ? 'bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    {t.studentFeed}
                </button>
            </div>
        </div>
      </div>

      {/* Feed Locked Message */}
      {isFeedLocked && activeTab === 'Community' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-xl flex items-center gap-3 text-yellow-800 dark:text-yellow-200">
              <Lock size={20} />
              <span className="font-medium">{t.feedLockedMsg}</span>
          </div>
      )}

      {/* Create Post Input */}
      {((activeTab === 'Community' && canPostCommunity) || (activeTab === 'Official' && canPostOfficial)) && (
        <Card className="p-4">
            <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold flex-shrink-0">
                {user?.fullName.charAt(0)}
            </div>
            <div className="flex-1">
                <textarea 
                    className="w-full border-none focus:ring-0 resize-none text-slate-700 dark:text-slate-200 bg-transparent text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder={activeTab === 'Official' ? "Make an official announcement..." : "Start a discussion..."}
                    rows={2}
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                />
                
                {selectedMedia.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                        {selectedMedia.map((m, idx) => (
                            <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                {m.type === 'image' ? <ImageIcon size={20} className="text-slate-400"/> : <Video size={20} className="text-slate-400"/>}
                                <button onClick={() => setSelectedMedia(selectedMedia.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"><X size={12}/></button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-700 mt-2 pt-3 flex justify-between items-center">
                    <div className="text-xs text-slate-400 flex gap-2">
                        {canPostOfficial && (
                            <>
                                <button onClick={() => handleMediaAttach('image')} className="flex items-center gap-1 hover:text-blue-600 transition-colors"><ImageIcon size={16}/> Image</button>
                                <button onClick={() => handleMediaAttach('video')} className="flex items-center gap-1 hover:text-blue-600 transition-colors"><Video size={16}/> Video</button>
                            </>
                        )}
                    </div>
                    <Button size="sm" onClick={handlePost} disabled={!newPostContent.trim() || loading}>
                        {loading ? 'Posting...' : 'Post'} <Send size={14} className="ml-2 rtl:rotate-180" />
                    </Button>
                </div>
            </div>
            </div>
        </Card>
      )}

      {/* Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No posts in this feed yet.</div>
        ) : (
            filteredPosts.map(post => (
                <PostCard 
                    key={post.id} 
                    post={post} 
                    currentUser={user}
                    onLike={() => handleLike(post.id)} 
                    onShare={() => openShare(post.id)}
                    onDelete={() => handleDeletePost(post.id)}
                    onReport={() => handleReportPost(post.id)}
                    onLock={() => handleLockPost(post.id)}
                    t={t}
                />
            ))
        )}
      </div>

      {/* Enhanced Share Modal */}
      <Modal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title={t.share}>
         <div className="grid grid-cols-1 gap-3">
             <button onClick={() => { navigator.clipboard.writeText(`https://amis.local/community/${postToShare}`); addToast('Link copied', 'success'); setIsShareModalOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600">
                 <Copy className="text-slate-500" /> {t.copyLink}
             </button>
             <button onClick={() => window.open(`https://wa.me/?text=Check this post: https://amis.local/community/${postToShare}`)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                 <Share2 className="text-green-600" /> {t.shareWhatsapp}
             </button>
             <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=https://amis.local/community/${postToShare}`)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
                 <Facebook className="text-blue-600" /> {t.shareFacebook}
             </button>
             <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=https://amis.local/community/${postToShare}`)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
                 <Twitter className="text-sky-500" /> {t.shareTwitter}
             </button>
             <button onClick={() => window.open(`https://t.me/share/url?url=https://amis.local/community/${postToShare}`)} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400">
                 <Send className="text-cyan-500" /> {t.shareTelegram}
             </button>
         </div>
      </Modal>
    </div>
  );
};

const PostCard = ({ post, currentUser, onLike, onShare, onDelete, onReport, onLock, t }: any) => {
    const isAnnouncement = post.type === 'Announcement';
    const hasLiked = currentUser ? post.likedBy.includes(currentUser.id) : false;
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState(post.comments);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Dropdown State
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleComment = async () => {
        if (!commentText.trim() || !currentUser || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const newComment = await api.addComment(post.id, {
                authorId: currentUser.id,
                authorName: 'You', 
                content: commentText
            });
            setLocalComments([...localComments, newComment]);
            setCommentText('');
        } catch (e: any) {
            console.error(e);
            alert(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAdminOrLead = currentUser && [Role.ADMIN, Role.PRESIDENT, Role.VICE_PRESIDENT, Role.COMMITTEE_LEAD].includes(currentUser.role);
    const isAuthor = currentUser?.id === post.authorId;

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${isAnnouncement ? 'border-blue-200 dark:border-blue-900' : 'border-slate-200 dark:border-slate-700'} overflow-visible transition-all duration-300 relative`}>
            {/* Header */}
            <div className={`p-4 flex justify-between items-start ${isAnnouncement ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold overflow-hidden">
                        {/* Use Avatar or Initials */}
                         {post.authorName.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 dark:text-white">{post.authorName}</h3>
                            {isAnnouncement && <Badge variant="info" className="text-[10px] py-0">Official</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                             {post.authorRole} 
                             {(post.authorSemester || post.authorMajor) && ` • ${post.authorSemester || ''} ${post.authorMajor ? `- ${post.authorMajor}` : ''}`} 
                             <span> • {new Date(post.date).toLocaleString()}</span>
                        </p>
                    </div>
                </div>

                {/* Options Menu */}
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setShowMenu(!showMenu)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                        <MoreHorizontal size={20} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-10 overflow-hidden">
                            {(isAdminOrLead || isAuthor) && (
                                <button onClick={() => {onDelete(); setShowMenu(false)}} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                    <Trash2 size={16} /> {t.deletePost}
                                </button>
                            )}
                            {isAdminOrLead && (
                                <button onClick={() => {onLock(); setShowMenu(false)}} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                    <Lock size={16} /> {post.isLocked ? t.unlockComments : t.lockComments}
                                </button>
                            )}
                            <button onClick={() => {onReport(); setShowMenu(false)}} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                <Flag size={16} /> {t.reportPost}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                {post.media && post.media.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 gap-2">
                        {post.media.map((m: any, i: number) => (
                            <div key={i} className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                {m.type === 'image' ? (
                                    <img src={m.url} alt="Attachment" className="w-full h-auto max-h-[400px] object-cover" />
                                ) : (
                                    <div className="bg-black text-white p-10 text-center">Video Player Placeholder</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="px-4 py-2 border-t border-slate-50 dark:border-slate-700 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{post.likes} Likes</span>
                <span>{localComments.length} Comments</span>
            </div>

            {/* Actions */}
            <div className="px-2 py-1 border-t border-slate-100 dark:border-slate-700 flex">
                <button 
                    onClick={onLike}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${hasLiked ? 'text-red-500 font-medium' : 'text-slate-600 dark:text-slate-400'}`}
                >
                    <Heart size={18} fill={hasLiked ? "currentColor" : "none"} /> Like
                </button>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                >
                    <MessageSquare size={18} /> Comment
                </button>
                <button 
                    onClick={onShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                >
                    <Share2 size={18} /> Share
                </button>
            </div>

            {/* Comment Section */}
            {showComments && (
                <div className="bg-slate-50 dark:bg-slate-900 p-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="space-y-4 mb-4">
                        {localComments.map(c => (
                            <div key={c.id} className="flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-[10px] text-slate-700 dark:text-slate-300">{c.authorName[0]}</div>
                                <div className="bg-white dark:bg-slate-800 p-2 rounded-r-xl rounded-bl-xl border border-slate-200 dark:border-slate-700 text-sm">
                                    <span className="font-bold text-slate-900 dark:text-white block text-xs">{c.authorName}</span>
                                    <span className="text-slate-700 dark:text-slate-300">{c.content}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {post.isLocked ? (
                        <div className="text-center text-xs text-slate-500 italic bg-slate-100 dark:bg-slate-800 p-2 rounded">
                            {t.commentsLocked}
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                                        e.preventDefault(); // Prevent newline and double trigger
                                        handleComment();
                                    }
                                }}
                            />
                            <button onClick={handleComment} disabled={isSubmitting} className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 p-2 rounded-lg disabled:opacity-50">
                                <Send size={18} className="rtl:rotate-180" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Community;
