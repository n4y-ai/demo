'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, Info, HelpCircle } from 'lucide-react';

interface TaskFormProps {
  onSubmit: (task: {
    description: string;
    fee: string;
    qiBudget: string;
  }) => void;
  disabled?: boolean;
}

export default function TaskForm({ onSubmit, disabled }: TaskFormProps) {
  const [description, setDescription] = useState('');
  const [qiBudget, setQiBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState('0.002');

  // Auto-calculate fee based on estimated gas costs
  useEffect(() => {
    // Simulate fee calculation based on task complexity and gas estimates
    const baseGas = 0.001; // Base transaction cost
    const complexityMultiplier = description.length > 100 ? 1.5 : 1.0;
    const qiComplexity = parseInt(qiBudget) > 50 ? 1.2 : 1.0;
    
    const calculated = (baseGas * complexityMultiplier * qiComplexity).toFixed(4);
    setEstimatedFee(calculated);
  }, [description, qiBudget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !qiBudget || disabled) return;

    setIsSubmitting(true);
    
    // Simulate submission delay
    setTimeout(() => {
      onSubmit({
        description: description.trim(),
        fee: estimatedFee,
        qiBudget,
      });
      
      // Reset form
      setDescription('');
      setQiBudget('');
      setIsSubmitting(false);
    }, 1000);
  };

  const canSubmit = description.trim() && qiBudget && !disabled && !isSubmitting;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Send className="w-5 h-5 mr-2 text-cyan-400" />
        Submit Task
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Task Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task you want your LOGOS to complete..."
            className="w-full h-24 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
            disabled={disabled || isSubmitting}
          />
        </div>
        
        <div className="space-y-4">
          {/* QI Budget Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
              QI Budget
              <div className="group relative ml-2">
                <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
                <div className="absolute bottom-6 left-0 bg-gray-800 text-white text-xs rounded-lg p-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity z-[9999] border border-gray-700">
                  <strong>QI Budget:</strong> Tokens for AI inference. 75% are burned immediately, 25% returned after task completion.
                </div>
              </div>
            </label>
            <input
              type="number"
              value={qiBudget}
              onChange={(e) => setQiBudget(e.target.value)}
              placeholder="25"
              min="1"
              max="1000"
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              disabled={disabled || isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 25-100 QI for most tasks</p>
          </div>

          {/* Auto-calculated Bounty Display */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center">
              Network Fee (Auto-calculated)
              <div className="group relative ml-2">
                <HelpCircle className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
                <div className="absolute bottom-6 left-0 bg-gray-800 text-white text-xs rounded-lg p-3 w-64 opacity-0 group-hover:opacity-100 transition-opacity z-[9999] border border-gray-700">
                  <strong>Network Fee:</strong> ETH for network operations (gas, storage). Platform claims 100% of this fee. Auto-calculated based on task complexity.
                </div>
              </div>
            </label>
            <div className="w-full bg-gray-800/30 border border-gray-700 rounded-lg px-3 py-2 text-white flex items-center justify-between">
              <span>{estimatedFee} ETH</span>
              <Info className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Includes gas fees + network operations</p>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-3">
          <h4 className="text-sm font-medium text-white mb-2">Total Estimated Cost</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">QI Energy (75% burned):</span>
              <span className="text-yellow-400">{qiBudget || '0'} QI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network Fee (platform):</span>
              <span className="text-blue-400">{estimatedFee} ETH</span>
            </div>
            <hr className="border-gray-600" />
            <div className="flex justify-between font-medium">
              <span className="text-white">You pay:</span>
              <span className="text-white">{qiBudget || '0'} QI + {estimatedFee} ETH</span>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
            canSubmit
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white transform hover:scale-105'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Task</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}