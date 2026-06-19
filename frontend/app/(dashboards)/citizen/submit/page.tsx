"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  FileText, MapPin, UploadCloud, Camera, Video, 
  Mic, ShieldAlert, ArrowRight, EyeOff, File
} from 'lucide-react';
import { complaintSchema, ComplaintFormValues, CATEGORIES, DISTRICTS } from '@/lib/validations/complaint';

// Dynamically import the map to prevent Next.js SSR errors
const LocationPicker = dynamic(() => import('@/components/maps/LocationPicker'), { ssr: false });

export default function SubmitComplaintPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: { priority: 'LOW', isAnonymous: false }
  });

  const isAnonymous = watch('isAnonymous');

  // Drag and Drop configuration
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [], 'video/*': [], 'audio/*': [] },
    onDrop: (acceptedFiles) => setFiles((prev) => [...prev, ...acceptedFiles])
  });

  const onSubmit = async (data: ComplaintFormValues) => {
    setIsSubmitting(true);
    // Mock API Call
    console.log("Submitting:", { ...data, files });
    setTimeout(() => {
      alert("Complaint Submitted Successfully!");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">File a New Complaint</h1>
        <p className="text-sm text-gray-500 mt-1">Please provide detailed information to help us resolve the issue quickly.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Core Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Basic Info */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center mb-5">
              <FileText className="w-5 h-5 mr-2 text-[#FF9933]" /> Issue Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Title</label>
                <input {...register('title')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] focus:border-[#87CEEB] transition-all bg-gray-50/50" placeholder="e.g., Severe waterlogging on Main Road" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select {...register('category')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50 appearance-none">
                    <option value="">Select Category...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity Priority</label>
                  <select {...register('priority')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50 appearance-none">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical / Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea {...register('description')} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50 resize-none" placeholder="Provide as much detail as possible..." />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          {/* Card 2: Location Mapping */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center mb-5">
              <MapPin className="w-5 h-5 mr-2 text-[#FF9933]" /> Geolocation
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select {...register('district')} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#87CEEB] bg-gray-50/50">
                  <option value="">Select your district...</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pinpoint exact location on map</label>
                <LocationPicker onLocationSelect={(lat, lng) => setValue('location', { lat, lng })} />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Media & Submission */}
        <div className="space-y-6">
          
          {/* Card 3: Media Upload */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#1E3A8A] flex items-center mb-5">
              <UploadCloud className="w-5 h-5 mr-2 text-[#FF9933]" /> Attach Evidence
            </h2>
            
            <div 
              {...getRootProps()} 
              className="border-2 border-dashed border-[#87CEEB]/50 rounded-xl p-6 text-center hover:bg-[#87CEEB]/5 transition-colors cursor-pointer group"
            >
              <input {...getInputProps()} />
              <div className="flex justify-center space-x-4 mb-3 text-gray-400 group-hover:text-[#1E3A8A] transition-colors">
                <Camera className="w-6 h-6" />
                <Video className="w-6 h-6" />
                <Mic className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-gray-600">Drag & drop files here</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse (Photos, Videos, Audio)</p>
            </div>

            {/* Display selected files */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center text-sm p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <File className="w-4 h-4 mr-2 text-[#FF9933]" />
                    <span className="truncate flex-1 text-gray-600">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Submission Settings */}
          <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2a4eab] p-6 rounded-2xl shadow-md text-white">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center">
                <EyeOff className="w-5 h-5 mr-2 text-[#FFC266]" />
                <span className="font-medium">File Anonymously</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('isAnonymous')} className="sr-only peer" />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF9933]"></div>
              </label>
            </div>
            
            <p className="text-xs text-blue-100 mb-6">
              {isAnonymous 
                ? "Your identity will be hidden from district officers. Only the CM office can verify it if required."
                : "Your identity will be visible to resolving officers for better follow-up."}
            </p>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-[#1E3A8A] bg-white hover:bg-gray-50 font-bold transition-all disabled:opacity-70 shadow-lg"
            >
              {isSubmitting ? "Processing..." : "Submit Grievance"} 
              {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
            </button>
          </div>

        </div>
      </form>
    </motion.div>
  );
}