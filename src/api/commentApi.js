import api from "./axios";

// Get all comments for a blog
export const getComments = (blogId) =>
    api.get(`/comments/blogs/${blogId}`);

// Add a new comment
export const addComment = (blogId, text) =>
    api.post(`/comments/blogs/${blogId}`, { text });
