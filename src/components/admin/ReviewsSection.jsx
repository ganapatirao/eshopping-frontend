import { useState, useEffect } from 'react';
import { Star, Trash2, Check, X, MessageCircle, ThumbsUp, Filter, Search } from 'lucide-react';

const ReviewsSection = ({ reviews, onApprove, onDelete, onFilterChange }) => {
  const [filter, setFilter] = useState({ status: 'all', rating: 'all', search: '' });
  const [expandedReview, setExpandedReview] = useState(null);

  const filteredReviews = reviews.filter(review => {
    if (filter.status === 'pending' && review.isApproved) return false;
    if (filter.status === 'approved' && !review.isApproved) return false;
    if (filter.rating !== 'all' && review.rating !== parseInt(filter.rating)) return false;
    if (filter.search && !review.comment.toLowerCase().includes(filter.search.toLowerCase()) && 
        !review.userName.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  const handleFilterChange = (key, value) => {
    const newFilter = { ...filter, [key]: value };
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const toggleExpand = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={filter.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
            <select
              value={filter.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No reviews found</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                      {review.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{review.userName}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={16} fill={star <= review.rating} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {review.title && (
                    <h4 className="font-semibold text-gray-800 mb-1">{review.title}</h4>
                  )}
                  
                  <p className="text-gray-600 mb-2">{review.comment}</p>
                  
                  {review.color && (
                    <p className="text-sm text-gray-500 mb-2">
                      Variant: {review.color} {review.size && `| Size: ${review.size}`}
                    </p>
                  )}
                  
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      <Check size={10} />
                      Verified Purchase
                    </span>
                  )}
                  
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.map((image, idx) => (
                        <img 
                          key={idx} 
                          src={image} 
                          alt="Review image" 
                          className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </div>
                  )}
                  
                  {review.replies && review.replies.length > 0 && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Replies</p>
                      {review.replies.map((reply) => (
                        <div key={reply.id} className="text-sm text-gray-600 mb-1">
                          <span className="font-semibold">{reply.userName}:</span> {reply.comment}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {review.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-purple-600">
                    <ThumbsUp size={16} />
                    {review.helpfulCount} Helpful
                  </button>
                  <button 
                    onClick={() => toggleExpand(review.id)}
                    className="flex items-center gap-1 hover:text-purple-600"
                  >
                    {expandedReview === review.id ? 'Show Less' : 'Show More'}
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  {!review.isApproved && (
                    <button
                      onClick={() => onApprove(review.id, true)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  {review.isApproved && (
                    <button
                      onClick={() => onApprove(review.id, false)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Unapprove"
                    >
                      <X size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(review)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
