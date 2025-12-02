import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { motion } from "framer-motion";
import { 
  Target, 
  Calendar, 
  FileText, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import Sidebar from '@/components/navigation/Sidebar';
import TopBar from '@/components/navigation/TopBar';
import ProgressBar from '@/components/ui/ProgressBar';
import ActionOfTheDayCard from '@/components/dashboard/ActionOfTheDayCard';
import PlanStepCard from '@/components/dashboard/PlanStepCard';
import GlowButton from '@/components/ui/GlowButton';
import { Link } from 'react-router-dom';

const planSteps = [
  { step_number: 1, title: "Trouver une idée", description: "Identifier ta passion rentable" },
  { step_number: 2, title: "Clarifier l'idée", description: "Définir précisément ton offre" },
  { step_number: 3, title: "Valider le marché", description: "Confirmer la demande" },
  { step_number: 4, title: "Créer le produit", description: "Développer ton offre" },
  { step_number: 5, title: "Créer l'offre + pricing", description: "Structurer et tarifer" },
  { step_number: 6, title: "Direction artistique", description: "Identité visuelle" },
  { step_number: 7, title: "Marketing + lancement", description: "Stratégie de lancement" },
  { step_number: 8, title: "Premières ventes", description: "Obtenir tes premiers clients" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dailyActions, setDailyActions] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load profile
      const profiles = await base44.entities.UserProfile.filter({ created_by: currentUser.email });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        
        // Check if paid, redirect if not
        if (!profiles[0].has_paid) {
          navigate(createPageUrl('Results'));
          return;
        }
      } else {
        navigate(createPageUrl('Welcome'));
        return;
      }
      
      // Load or create plan steps
      const existingSteps = await base44.entities.PlanStep.filter({ created_by: currentUser.email });
      if (existingSteps.length === 0) {
        // Create default steps
        for (const step of planSteps) {
          await base44.entities.PlanStep.create({
            ...step,
            checklist: [
              { id: '1', text: 'Tâche à définir', completed: false }
            ],
            is_completed: false
          });
        }
        const newSteps = await base44.entities.PlanStep.filter({ created_by: currentUser.email });
        setSteps(newSteps.sort((a, b) => a.step_number - b.step_number));
      } else {
        setSteps(existingSteps.sort((a, b) => a.step_number - b.step_number));
      }
      
      // Load or create daily actions
      const today = new Date().toISOString().split('T')[0];
      let todayActions = await base44.entities.DailyAction.filter({ 
        created_by: currentUser.email,
        date: today 
      });
      
      if (todayActions.length === 0) {
        // Generate daily actions
        const defaultActions = [
          { title: "Clarifie ton problème-client", description: "Identifie le problème principal que tu résous", priority: 3 },
          { title: "Écris un DM test", description: "Contacte une personne de ta cible", priority: 2 },
          { title: "Valide ton idée auprès de 2 personnes", description: "Obtiens des retours concrets", priority: 1 }
        ];
        
        for (const action of defaultActions) {
          await base44.entities.DailyAction.create({
            ...action,
            date: today,
            is_completed: false
          });
        }
        
        todayActions = await base44.entities.DailyAction.filter({ 
          created_by: currentUser.email,
          date: today 
        });
      }
      
      setDailyActions(todayActions.sort((a, b) => (b.priority || 1) - (a.priority || 1)));
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAction = async (actionId) => {
    const action = dailyActions.find(a => a.id === actionId);
    if (!action) return;
    
    await base44.entities.DailyAction.update(actionId, {
      is_completed: !action.is_completed
    });
    
    setDailyActions(dailyActions.map(a => 
      a.id === actionId ? { ...a, is_completed: !a.is_completed } : a
    ));
  };
  
  const calculateProgress = () => {
    if (steps.length === 0) return 0;
    const completed = steps.filter(s => s.is_completed).length;
    return Math.round((completed / steps.length) * 100);
  };
  
  const calculateDailyProgress = () => {
    if (dailyActions.length === 0) return 0;
    const completed = dailyActions.filter(a => a.is_completed).length;
    return Math.round((completed / dailyActions.length) * 100);
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#11112b]">
        <Sidebar currentPage="Dashboard" progress={0} />
        <div className="flex-1 ml-72">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin w-8 h-8 border-2 border-[#61f7a2] border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-[#11112b]">
      <Sidebar currentPage="Dashboard" progress={calculateProgress()} />
      
      <div className="flex-1 ml-72">
        <TopBar 
          title="Dashboard" 
          subtitle="Bienvenue dans ton espace membre"
          user={user}
        />
        
        <main className="p-8">
          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#61f7a2]/20 to-[#1b1b33] rounded-3xl p-8 mb-8 border border-[#61f7a2]/20"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#61f7a2] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#11112b]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Salut {user?.full_name?.split(' ')[0] || 'là'} ! 👋
                </h2>
                <p className="text-gray-400">Prêt à avancer sur ton projet ?</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-[#11112b]/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Progression globale</span>
                  <span className="text-[#61f7a2] font-bold">{calculateProgress()}%</span>
                </div>
                <ProgressBar value={calculateProgress()} max={100} size="sm" />
              </div>
              
              <div className="bg-[#11112b]/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Actions du jour</span>
                  <span className="text-[#61f7a2] font-bold">{calculateDailyProgress()}%</span>
                </div>
                <ProgressBar value={calculateDailyProgress()} max={100} size="sm" />
              </div>
              
              <div className="bg-[#11112b]/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Étape actuelle</span>
                  <span className="text-[#61f7a2] font-bold">
                    {steps.findIndex(s => !s.is_completed) + 1 || steps.length}/{steps.length}
                  </span>
                </div>
                <p className="text-white text-sm font-medium truncate">
                  {steps.find(s => !s.is_completed)?.title || "Toutes complétées !"}
                </p>
              </div>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Actions du jour */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#61f7a2]" />
                  Actions du jour
                </h3>
                <Link 
                  to={createPageUrl('DailyActions')}
                  className="text-[#61f7a2] text-sm hover:underline flex items-center gap-1"
                >
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-3">
                {dailyActions.slice(0, 3).map((action, index) => (
                  <ActionOfTheDayCard
                    key={action.id}
                    action={action}
                    onToggle={toggleAction}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
            
            {/* Plan d'action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#61f7a2]" />
                  Plan d'action IAVNIR
                </h3>
                <Link 
                  to={createPageUrl('PlanAction')}
                  className="text-[#61f7a2] text-sm hover:underline flex items-center gap-1"
                >
                  Voir tout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-3">
                {steps.slice(0, 4).map((step, index) => (
                  <PlanStepCard
                    key={step.id}
                    step={step}
                    index={index}
                    isUnlocked={index === 0 || steps[index - 1]?.is_completed}
                  />
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Quick access documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#61f7a2]" />
                Documents IA
              </h3>
              <Link 
                to={createPageUrl('Documents')}
                className="text-[#61f7a2] text-sm hover:underline flex items-center gap-1"
              >
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-[#1b1b33] rounded-2xl border border-[#2a2a45] p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Offre complète', 'Page de vente', 'Emails', 'Avatar client'].map((doc, index) => (
                  <Link
                    key={doc}
                    to={createPageUrl('Documents')}
                    className="bg-[#11112b] rounded-xl p-4 hover:bg-[#2a2a45] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#61f7a2]/10 flex items-center justify-center mb-3 group-hover:bg-[#61f7a2]/20 transition-all">
                      <FileText className="w-5 h-5 text-[#61f7a2]" />
                    </div>
                    <p className="text-white font-medium text-sm">{doc}</p>
                    <p className="text-gray-500 text-xs mt-1">Généré</p>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}