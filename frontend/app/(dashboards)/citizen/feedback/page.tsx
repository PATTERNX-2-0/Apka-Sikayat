"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Send, RefreshCcw } from 'lucide-react';

// ==========================================
// BACKEND TYPES
// ==========================================
interface FeedbackPayload {
  complaintId: string;
  rating: number;
  comments: string;
}

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState('CMP-1005');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert("Please provide a star rating.");
    
    setIsSubmitting(true);
    const payload: FeedbackPayload = { complaintId: selectedComplaint, rating, comments };
    
    // API TODO: await axios.post('/api/feedback', payload);
    setTimeout(() => {
      alert("Thank you for your feedback!");
      setIsSubmitting(false);
      setRating(0);
      setComments('');
    }, 1000);
  };

  const handleReopen = async () => {
    // API TODO: await axios.post(`/api/complaints/${selectedComplaint}/reopen`);
    alert(`Complaint ${selectedComplaint} has been requested for reopening.`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-[#1E3A8A]">Provide Feedback</h1>
        <p className="text-sm text-gray-500 mt-1">Help us improve by rating recently resolved issues.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Complaint */}
          <div>
            <label className="block text-sm font-bold text-[#1E3A8A] mb-2">Select Resolved Complaint</label>
            <select 
              value={selectedComplaint}
              onChange={(e) => setSelectedComplaint(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50 font-medium"
            >
              <option value="CMP-1005">CMP-1005: Streetlights not working</option>
              <option value="CMP-1003">CMP-1003: Sewer Line Blockage</option>
            </select>
          </div>

          {/* Star Rating */}
          <div className="py-4 border-y border-gray-50 text-center">
            <label className="block text-sm font-bold text-[#1E3A8A] mb-4">How satisfied are you with the resolution?</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating) 
                        ? 'fill-[#FF9933] text-[#FF9933]' 
                        : 'fill-transparent text-gray-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs font-bold text-[#FF9933] mt-3 uppercase tracking-wider">
                {['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'][rating - 1]}
              </p>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-bold text-[#1E3A8A] mb-2">Additional Comments</label>
            <textarea 
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting || rating === 0}
              className="flex-1 flex justify-center items-center py-3 bg-linear-to-r from-[#1E3A8A] to-[#2a4eab] text-white font-medium rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? "Submitting..." : <><Send className="w-4 h-4 mr-2" /> Submit Feedback</>}
            </button>
            
            {/* Show Reopen option only if rating is 1 or 2 */}
            {(rating === 1 || rating === 2) && (
              <button 
                type="button"
                onClick={handleReopen}
                className="flex-1 flex justify-center items-center py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition border border-red-100"
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Reopen Complaint
              </button>
            )}
          </div>

        </form>
      </div>
    </motion.div>
  );
}