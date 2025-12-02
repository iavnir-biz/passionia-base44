import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";
import { Calendar, Sparkles, RefreshCw, Trophy } from "lucide-react";
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import ActionOfTheDayCard from '@/components/dashboard/ActionOfTheDayCard';
import ProgressBar from '@/components/ui/ProgressBar';
import GlowButton from '@/components/ui/GlowButton';

export default function DailyActions() {
  const [user, setUser] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load plan steps for progress
      const steps = await base44.entities.PlanStep.filter({ created_by: currentUser.email });
      const completed = steps.filter(s => s.is_completed).length;
      setProgress(steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0);
      
      // Load today's actions
      const todayDate = new Date().toISOString().split('T')[0];
      const todayActions = await base44.entities.DailyAction.filter({ 
        created_by: currentUser.email,
        date: todayDate 
      });
      
      setActions(todayActions.sort((a, b) => (b.priority || 1) - (a.priority || 1)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAction = async (actionId) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;
    
    await base44.entities.DailyAction.update(actionId, {
      is_completed: !action.is_completed
    });
    
    setActions(actions.map(a => 
      a.id === actionId ? { ...a, is_completed: !a.is_completed } : a
    ));
  };
  
  const regenerateActions = async () => {
    setGenerating(true);
    
    try {
      // Delete current actions
      for (const action of actions) {
        await base44.entities.DailyAction.delete(action.id);
      }
      
      // Get user profile
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      const profile = profiles[0];
      
      // Generate new actions with AI
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un coach business. Génère 3 actions quotidiennes concrètes et réalisables pour quelqu'un qui:
- Travaille sur: ${profile?.passion || 'un projet en ligne'}
- Cible: ${profile?.target_audience || 'des clients potentiels'}
- Type de projet: ${profile?.project_type || 'mini-produit'}

Les actions doivent être:
1. Très concrètes et réalisables en moins de 30 minutes chacune
2. Progressives (de la plus importante à la moins importante)
3. Orientées vers la validation et les premières ventes

Réponds en JSON avec un tableau de 3 actions.`,
        response_json_schema: {
          type: "object",
          properties: {
            actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      // Create new actions
      const todayDate = new Date().toISOString().split('T')[0];
      const newActions = [];
      
      for (let i = 0; i < result.actions.length; i++) {
        const action = result.actions[i];
        const created = await base44.entities.DailyAction.create({
          title: action.title,
          description: action.description,
          date: todayDate,
          priority: 3 - i,
          is_completed: false
        });
        newActions.push(created);
      }
      
      setActions(newActions.sort((a, b) => (b.priority || 1) - (a.priority || 1)));
    } catch (error) {
      console.error('Error regenerating actions:', error);
    } finally {
      setGenerating(false);
    }
  };
  
  const calculateDailyProgress = () => {
    if (actions.length === 0) return 0;
    const completed = actions.filter(a => a.is_completed).length;
    return Math.round((completed / actions.length) * 100);
  };
  
  const allCompleted = actions.length > 0 && actions.every(a => a.is_completed);
  
  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="DailyActions" progress={progress} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Actions du jour" 
          subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
          user={user}
        />
        
        <main className="p-8">
          {/* Progress card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl border p-8 mb-8 ${
              allCompleted 
                ? 'bg-gradient-to-r from-[#61f7a2]/20 to-[#1b1b33] border-[#61f7a2]/30'
                : 'bg-[#1b1b33] border-[#2a2a45]'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  allCompleted ? 'bg-[#61f7a2]' : 'bg-[#61f7a2]/10'
                }`}>
                  {allCompleted ? (
                    <Trophy className={`w-7 h-7 ${allCompleted ? 'text-[#11112b]' : 'text-[#61f7a2]'}`} />
                  ) : (
                    <Calendar className="w-7 h-7 text-[#61f7a2]" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {allCompleted ? 'Bravo ! Journée complétée ! 🎉' : 'Tes actions du jour'}
                  </h2>
                  <p className="text-gray-400">
                    {allCompleted 
                      ? 'Tu as accompli toutes tes actions. Reviens demain !'
                      : `${actions.filter(a => a.is_completed).length} sur ${actions.length} actions complétées`
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="text-4xl font-bold text-[#61f7a2]">{calculateDailyProgress()}%</p>
                  <p className="text-gray-400 text-sm">aujourd'hui</p>
                </div>
                
                <GlowButton
                  variant="secondary"
                  onClick={regenerateActions}
                  loading={generating}
                  icon={RefreshCw}
                >
                  Régénérer
                </GlowButton>
              </div>
            </div>
            
            <ProgressBar value={calculateDailyProgress()} max={100} size="lg" />
          </motion.div>
          
          {/* Actions list */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#61f7a2] border-t-transparent rounded-full" />
              </div>
            ) : actions.length > 0 ? (
              actions.map((action, index) => (
                <ActionOfTheDayCard
                  key={action.id}
                  action={action}
                  onToggle={toggleAction}
                  index={index}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#1b1b33] mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 mb-4">Aucune action pour aujourd'hui</p>
                <GlowButton onClick={regenerateActions} loading={generating}>
                  Générer mes actions
                </GlowButton>
              </motion.div>
            )}
          </div>
          
          {/* Motivation */}
          {!allCompleted && actions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-[#1b1b33] border border-[#2a2a45] rounded-2xl p-6 text-center"
            >
              <p className="text-gray-400">
                💡 <span className="text-white font-medium">Conseil :</span> Commence par l'action la plus importante. 
                Les petites victoires quotidiennes construisent les grands succès.
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}