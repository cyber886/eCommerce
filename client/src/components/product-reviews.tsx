import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Review } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Star, StarHalf, StarOff, User, Calendar, Send, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // Fetch reviews for the product
  const { data: reviews, isLoading, isError } = useQuery({
    queryKey: ['/api/products', productId, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
  });

  // Fetch average rating
  const { data: ratingData } = useQuery({
    queryKey: ['/api/products', productId, 'rating'],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/rating`);
      if (!response.ok) {
        throw new Error('Failed to fetch rating');
      }
      return response.json();
    },
  });

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to submit a review",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/reviews", {
        productId,
        rating,
        comment: newReview.trim() || null,
      });

      // Reset form and refresh data
      setNewReview("");
      setRating(0);
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'rating'] });

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditReview = async (id: number) => {
    if (!editText.trim() && editingReviewId) {
      setEditingReviewId(null);
      return;
    }

    try {
      await apiRequest("PUT", `/api/reviews/${id}`, {
        comment: editText.trim() || null,
      });

      setEditingReviewId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'reviews'] });

      toast({
        title: "Review updated",
        description: "Your review has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/reviews/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'rating'] });

      toast({
        title: "Review deleted",
        description: "Your review has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startEditingReview = (review: Review & { username: string }) => {
    setEditingReviewId(review.id);
    setEditText(review.comment || "");
  };

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} className="fill-yellow-400 text-yellow-400 w-5 h-5" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalf key={i} className="fill-yellow-400 text-yellow-400 w-5 h-5" />);
      } else {
        stars.push(<StarOff key={i} className="text-gray-300 w-5 h-5" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading reviews...</div>;
  }

  if (isError) {
    return <div className="text-red-500 p-4">Error loading reviews.</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Ratings & Reviews</h2>
      
      {/* Average Rating */}
      <div className="flex items-center mb-6">
        <div className="mr-4">
          <span className="text-3xl font-bold">
            {ratingData?.averageRating ? ratingData.averageRating.toFixed(1) : "0.0"}
          </span>
          <span className="text-sm text-gray-500">/5</span>
        </div>
        <div className="flex">
          {renderStars(ratingData?.averageRating || 0)}
        </div>
        <div className="ml-3 text-sm text-gray-500">
          {reviews?.length || 0} {reviews?.length === 1 ? "review" : "reviews"}
        </div>
      </div>

      {/* Review Form */}
      {user && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Write a Review</h3>
          
          <div className="flex items-center mb-3">
            <div className="mr-2">Your Rating:</div>
            <div className="flex cursor-pointer">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  {star <= (hoveredRating || rating) ? (
                    <Star className="fill-yellow-400 text-yellow-400 w-5 h-5" />
                  ) : (
                    <StarOff className="text-gray-300 w-5 h-5" />
                  )}
                </span>
              ))}
            </div>
          </div>
          
          <Textarea
            placeholder="Share your thoughts about this product (optional)"
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            className="min-h-[100px] mb-3"
          />
          
          <Button onClick={handleSubmitReview} className="flex items-center">
            <Send className="w-4 h-4 mr-2" /> Submit Review
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map((review: Review & { username: string }) => (
            <div key={review.id} className="border p-4 rounded-lg">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <div className="bg-gray-200 p-2 rounded-full mr-3">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium">{review.username}</div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              {editingReviewId === review.id ? (
                <div className="mt-3">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[80px] mb-2"
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleEditReview(review.id)}>
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingReviewId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  {review.comment ? (
                    <p className="text-gray-700">{review.comment}</p>
                  ) : (
                    <p className="text-gray-500 italic">No comment provided</p>
                  )}
                  
                  {user && user.id === review.userId && (
                    <div className="flex mt-2 space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => startEditingReview(review)}
                        className="flex items-center text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteReview(review.id)}
                        className="flex items-center text-xs text-red-500 hover:text-red-700"
                      >
                        <Trash className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
}