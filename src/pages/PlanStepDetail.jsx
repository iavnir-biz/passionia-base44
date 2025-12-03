import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useRequireAuth } from '@/components/hooks/useRequireAuth';
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Save,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import GlowButton from '@/components/ui/GlowButton';
import ProgressBar from '@/components/ui/ProgressBar';
import { Link } from 'react-router-dom';

export default function PlanStepDetail() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(null);
  const [allSteps, setAllSteps] = useState([]);
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  
  const urlParams = new URLSearchParams(window.location.search);
  const stepNumber = parseInt(urlParams.get('step')) || 1;
  
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [stepNumber, isAuthenticated]);
  
  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const steps = await base44.entities.PlanStep.filter({ created_by: currentUser.email });
      const sortedSteps = steps.sort((a, b) => a.step_number - b.step_number);
      setAllSteps(sortedSteps);
      
      const currentStep = sortedSteps.find(s => s.step_number === stepNumber);
      if (currentStep) {
        setStep(currentStep);
        setNotes(currentStep.notes || '');
        setChecklist(currentStep.checklist || []);
        setAiSuggestions(currentStep.ai_suggestions || '');
      }
    } catch (error) {
      console.error('Error loading step:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleChecklistItem = (itemId) => {
    setChecklist(checklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };
  
  const handleSave = async () => {
    if (!step) return;
    setSaving(true);
    
    try {
      const allCompleted = checklist.every(item => item.completed);
      
      await base44.entities.PlanStep.update(step.id, {
        notes,
        checklist,
        is_completed: allCompleted,
        ai_suggestions: aiSuggestions
      });
      
      // Reload to update UI
      await loadData();
    } catch (error) {
      console.error('Error saving step:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleAIImprove = async () => {
    if (!step) return;
    setAiLoading(true);
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un coach business expert. L'utilisateur travaille sur l'étape "${step.title}" de son plan d'action pour créer son activité en ligne.

Ses notes actuelles: ${notes || 'Aucune note pour le moment'}

Génère des suggestions personnalisées et concrètes pour l'aider à avancer sur cette étape. Sois pratique et actionnable. Donne 3-5 conseils spécifiques.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: { type: "string" }
          }
        }
      });
      
      setAiSuggestions(result.suggestions);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
    } finally {
      setAiLoading(false);
    }
  };
  
  const markAsComplete = async () => {
    if (!step) return;
    setSaving(true);
    
    try {
      await base44.entities.PlanStep.update(step.id, {
        is_completed: true,
        checklist: checklist.map(item => ({ ...item, completed: true }))
      });
      
      // Navigate to next step if available
      const nextStep = allSteps.find(s => s.step_number === stepNumber + 1);
      if (nextStep) {
        navigate(createPageUrl(`PlanStepDetail?step=${stepNumber + 1}`));
      } else {
        navigate(createPageUrl('PlanAction'));
      }
    } catch (error) {
      console.error('Error completing step:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const calculateProgress = () => {
    if (allSteps.length === 0) return 0;
    const completed = allSteps.filter(s => s.is_completed).length;
    return Math.round((completed / allSteps.length) * 100);
  };
  
  const checklistProgress = () => {
    if (checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };
  
  if (loading || !step) {
    return (
      <div className="flex min-h-screen bg-[#11112b]">
        <Sidebar currentPage="PlanAction" progress={0} />
        <div className="flex-1 ml-72 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#61f7a2] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="PlanAction" progress={calculateProgress()} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title={`Étape ${step.step_number}`}
          subtitle={step.title}
          user={user}
        />
        
        <main className="p-8">
          {/* Back button */}
          <Link 
            to={createPageUrl('PlanAction')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au plan d'action
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                    step.is_completed ? 'bg-[#61f7a2] text-[#11112b]' : 'bg-[#2a2a45] text-white'
                  }`}>
                    {step.is_completed ? <Check className="w-6 h-6" /> : step.step_number}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white">{step.title}</h2>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </div>
                
                <ProgressBar value={checklistProgress()} max={100} showLabel size="default" />
              </motion.div>
              
              {/* Checklist */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Checklist</h3>
                <div className="space-y-3">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(item.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                        item.completed 
                          ? 'bg-gradient-active border border-[#61f7a2]/30' 
                          : 'bg-[#11112b] border border-[#2a2a45] hover:border-[#61f7a2]/30'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.completed ? 'bg-[#61f7a2]' : 'border-2 border-[#2a2a45]'
                      }`}>
                        {item.completed && <Check className="w-4 h-4 text-[#11112b]" />}
                      </div>
                      <span className={`${item.completed ? 'text-[#61f7a2]' : 'text-white'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              {/* Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Tes notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Écris tes idées, réflexions, et progrès ici..."
                  rows={6}
                  className="w-full bg-[#11112b] border border-[#2a2a45] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#61f7a2] focus:ring-1 focus:ring-[#61f7a2]/20 transition-all resize-none"
                />
              </motion.div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Suggestions IA</h3>
                  <GlowButton
                    variant="outline"
                    size="sm"
                    onClick={handleAIImprove}
                    loading={aiLoading}
                    icon={Sparkles}
                  >
                    Améliorer
                  </GlowButton>
                </div>
                
                {aiSuggestions ? (
                  <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {aiSuggestions}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Clique sur "Améliorer" pour obtenir des suggestions personnalisées de l'IA
                  </p>
                )}
              </motion.div>
              
              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6 space-y-3"
              >
                <GlowButton
                  onClick={handleSave}
                  loading={saving}
                  icon={Save}
                  className="w-full"
                  variant="secondary"
                >
                  Sauvegarder
                </GlowButton>
                
                <GlowButton
                  onClick={markAsComplete}
                  loading={saving}
                  icon={Check}
                  className="w-full"
                >
                  Marquer comme terminé
                </GlowButton>
              </motion.div>
              
              {/* Navigation */}
              <div className="flex gap-3">
                {stepNumber > 1 && (
                  <Link
                    to={createPageUrl(`PlanStepDetail?step=${stepNumber - 1}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1b1b33] border border-[#2a2a45] text-gray-400 hover:text-white hover:border-[#61f7a2]/30 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </Link>
                )}
                {stepNumber < allSteps.length && (
                  <Link
                    to={createPageUrl(`PlanStepDetail?step=${stepNumber + 1}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1b1b33] border border-[#2a2a45] text-gray-400 hover:text-white hover:border-[#61f7a2]/30 transition-all"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}