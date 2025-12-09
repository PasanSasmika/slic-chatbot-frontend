"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// --- 1. Zod Validation Schema ---
const uploadSchema = z.object({
  tableName: z.string().min(1, "Please select a target table"),
  file: z
    .any()
    .refine((files) => files?.length > 0, "A CSV file is required")
    .refine(
      (files) => files?.[0]?.type === "text/csv" || files?.[0]?.name.endsWith('.csv'),
      "Only CSV files are accepted"
    ),
});

type UploadFormData = z.infer<typeof uploadSchema>;

export default function AdminPage() {
  const {register,handleSubmit,watch,formState: { errors }, reset } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { tableName: 'insurance_plans' }
  });

  const selectedFile = watch('file');

  // --- 3. TanStack Query Mutation ---
  const { mutate, isPending, error, data } = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch('http://localhost:5000/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      reset(); // Clear form on success
    }
  });

  const onSubmit = (values: UploadFormData) => {
    const formData = new FormData();
    formData.append('file', values.file[0]);
    formData.append('tableName', values.tableName);
    mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold mb-8 text-blue-900 flex items-center gap-3">
          <Upload className="text-blue-600" /> Data Ingestion Panel
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Table Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Table</label>
           <select 
              {...register('tableName')}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <optgroup label="Knowledge & Products">
                <option value="insurance_plans">Insurance Plans (Products)</option>
                <option value="insurance_rates">Insurance Rates (Pricing)</option>
                <option value="knowledge_base">Knowledge Base (FAQ)</option>
                <option value="web_links">Web Resources (Links)</option>
              </optgroup>
              
              <optgroup label="Customer Data (Confidential)">
                <option value="customers">Customers (KYC)</option>
                <option value="customer_policies">Customer Policies (Active Plans)</option>
                <option value="claims">Claims History</option>
                <option value="policy_renewals">Renewal History</option>
              </optgroup>
            </select>
            {errors.tableName && <p className="text-red-500 text-xs mt-1">{errors.tableName.message}</p>}
          </div>

          {/* File Input UI */}
          <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition ${
            selectedFile?.[0] ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400'
          }`}>
            <input 
              type="file" 
              {...register('file')}
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload size={32} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                {selectedFile?.[0] ? selectedFile[0].name : "Click to select CSV"}
              </span>
            </div>
          </div>
          {errors.file && <p className="text-red-500 text-xs mt-1">{errors.file.message as string}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-700 text-white font-bold py-4 rounded-xl hover:bg-blue-800 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin" /> : "Start Ingestion"}
          </button>
        </form>

        {/* Mutation Status Feedback */}
        <div className="mt-6">
          {data?.success && (
            <div className="flex items-center gap-2 text-green-700 bg-green-100 p-4 rounded-xl border border-green-200">
              <CheckCircle size={20} /> Imported {data.details.count} rows successfully!
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-red-700 bg-red-100 p-4 rounded-xl border border-red-200">
              <AlertCircle size={20} /> {error.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}