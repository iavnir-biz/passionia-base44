import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from "framer-motion";
import { Target, CheckCircle, ArrowRight } from "lucide-react";
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import PlanStepCard from '@/components/dashboard/PlanStepCard';
import ProgressBar from '@/components/ui/ProgressBar';

export default function PlanAction() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);
  
  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const existingSteps = await base44.entities.PlanStep.filter({ created_by: currentUser.email });
      setSteps(existingSteps.sort((a, b) => a.step_number - b.step_number));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateProgress = () => {
    if (steps.length === 0) return 0;
    const completed = steps.filter(s => s.is_completed).length;
    return Math.round((completed / steps.length) * 100);
  };
  
  const completedSteps = steps.filter(s => s.is_completed).length;
  
  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="PlanAction" progress={calculateProgress()} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Plan d'action" 
          subtitle="Méthode IAVNIR - 8 étapes vers le succès"
          user={user}
        />
        
        <main className="p-8">
          {/* Progress overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1b1b33] rounded-3xl border border-[#2a2a45] p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#61f7a2]/10 flex items-center justify-center">
                  <Target className="w-7 h-7 text-[#61f7a2]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Ta progression</h2>
                  <p className="text-gray-400">
                    {completedSteps} étapes complétées sur {steps.length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-[#61f7a2]">{calculateProgress()}%</p>
                <p className="text-gray-400 text-sm">complété</p>
              </div>
            </div>
            
            <ProgressBar value={calculateProgress()} max={100} size="lg" />
            
            {/* Milestones */}
            <div className="flex justify-between mt-4">
              {[0, 25, 50, 75, 100].map((milestone) => (
                <div 
                  key={milestone}
                  className={`flex flex-col items-center ${
                    calculateProgress() >= milestone ? 'text-[#61f7a2]' : 'text-gray-500'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${
                    calculateProgress() >= milestone ? 'bg-[#61f7a2]' : 'bg-[#2a2a45]'
                  }`}>
                    {calculateProgress() >= milestone && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs mt-1">{milestone}%</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((step, index) => (
              <PlanStepCard
                key={step.id}
                step={step}
                index={index}
                isUnlocked={index === 0 || steps[index - 1]?.is_completed}
              />
            ))}
          </div>
          
          {/* Motivation message */}
          {completedSteps > 0 && completedSteps < steps.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-gradient-active border border-[#61f7a2]/20 rounded-2xl p-6 text-center"
            >
              <p className="text-white text-lg">
                🎉 Bravo ! Tu as déjà complété {completedSteps} étape{completedSteps > 1 ? 's' : ''}. 
                Continue comme ça !
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}