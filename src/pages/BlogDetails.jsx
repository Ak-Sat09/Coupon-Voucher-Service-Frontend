import { useEffect, useState, useCallback } from "react";
import { useParams,  Link } from "react-router-dom";
import { getBlogById } from "../api/blogApi";
import { toggleLike, getLikeCount } from "../api/likeApi";
import { getComments, addComment } from "../api/commentApi";
import "./styles.css";

export default function BlogDetail() {
  const { id } = useParams();
  

  const [blog, setBlog] = useState(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [showShareBox, setShowShareBox] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const shareUrl = `${window.location.origin}/blogs/${id}`;

  const loadLikes = useCallback(async () => {
    try {
      const res = await getLikeCount(id);
      setLikes(res.data.likes);
    } catch (err) {
      console.error("Error loading likes:", err);
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    try {
      const res = await getComments(id);
      setComments(res.data.comments.content || []);
    } catch (err) {
      console.error("Error loading comments:", err);
      setComments([]);
    }
  }, [id]);

  const loadBlog = useCallback(async () => {
    try {
      const res = await getBlogById(id);
      setBlog(res.data);
      await loadLikes();
      await loadComments();
    } catch (err) {
      console.error("Error loading blog:", err);
    } finally {
      setLoading(false);
    }
  }, [id, loadLikes, loadComments]);

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  const handleLike = async () => {
    setIsLiked((prev) => !prev);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    try {
      await toggleLike(id);
      await loadLikes();
    } catch (err) {
      // Revert on error
      setIsLiked((prev) => !prev);
      setLikes((prev) => (isLiked ? prev + 1 : prev - 1));
      console.error("Error toggling like:", err);
    }
  };

 const handleAddComment = async () => {
  if (!commentText.trim()) return; // prevent empty comment

  setIsSubmittingComment(true);

  try {
    // Send comment text to backend
    await addComment(id, commentText); // just pass text

    setCommentText("");        // clear input
    await loadComments();      // reload comments list
  } catch (err) {
    console.error("Error adding comment:", err);
  } finally {
    setIsSubmittingComment(false); // re-enable button
  }
};


  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const calculateReadTime = (content) => {
    if (!content) return "5 min read";
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-page">
        <div className="error-state">
          <div className="error-icon">📖</div>
          <h2 className="error-title">Story Not Found</h2>
          <p className="error-message">The story you're looking for doesn't exist or has been removed.</p>
          <Link to="/blogs" className="back-button">
            ← Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  const readTime = calculateReadTime(blog.content);
  const publishDate = formatDate(blog.createdAt || blog.publishedAt);

  return (
    <div className="blog-detail-page">
      {/* Article Header */}
      <article className="article-container">
        <header className="article-header">
          <Link to="/blogs" className="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            All Stories
          </Link>

          <div className="article-meta">
            <span className="article-category">Story</span>
            <span className="meta-divider">•</span>
            <span className="article-read-time">{readTime}</span>
            <span className="meta-divider">•</span>
            <span className="article-date">{publishDate}</span>
          </div>

          <h1 className="article-title">{blog.title}</h1>

          <div className="article-author">
            <div className="author-avatar">
              {blog.author?.name?.charAt(0).toUpperCase() || blog.title?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="author-details">
              <div className="author-name">{blog.author?.name || "Anonymous"}</div>
              <div className="author-meta">{publishDate}</div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="article-content">
          <div className="content-body">
            {blog.content.split('\n').map((paragraph, index) => 
              paragraph.trim() ? (
                <p key={index}>{paragraph}</p>
              ) : null
            )}
          </div>
        </div>

        {/* Article Footer Actions */}
        <footer className="article-footer">
          <div className="footer-actions">
            <button
              className={`action-button ${isLiked ? "action-button--active" : ""}`}
              onClick={handleLike}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>{likes}</span>
            </button>

            <button
              className="action-button"
              onClick={() => setShowShareBox(!showShareBox)}
              aria-label="Share"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>Share</span>
            </button>

            <button className="action-button" aria-label="Bookmark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>

          {/* Share Box */}
          {showShareBox && (
            <div className="share-box">
              <div className="share-header">
                <h4 className="share-title">Share this story</h4>
                <button 
                  className="share-close"
                  onClick={() => setShowShareBox(false)}
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="share-link-container">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="share-input"
                />
                <button 
                  className={`copy-button ${copySuccess ? "copy-button--success" : ""}`}
                  onClick={copyLink}
                >
                  {copySuccess ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              <div className="share-socials">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button social-button--twitter"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                  </svg>
                  Twitter
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' - ' + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button social-button--whatsapp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-button social-button--facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                  Facebook
                </a>
              </div>
            </div>
          )}
        </footer>
      </article>

      {/* Comments Section */}
      <section className="comments-section">
        <div className="comments-container">
          <div className="comments-header">
            <h3 className="comments-title">
              Conversation
              <span className="comments-count">({comments.length})</span>
            </h3>
          </div>

          {/* Add Comment Form */}
          <div className="add-comment-form">
            <div className="comment-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="comment-input-wrapper">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                className="comment-input"
                rows="3"
                disabled={isSubmittingComment}
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim() || isSubmittingComment}
                className="submit-comment-button"
              >
                {isSubmittingComment ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="no-comments">
                <div className="no-comments-icon">💬</div>
                <p className="no-comments-text">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <div key={comment.id || index} className="comment-item">
                  <div className="comment-avatar">
                    {comment.author?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.author?.name || "Anonymous"}
                      </span>
                      <span className="comment-date">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}