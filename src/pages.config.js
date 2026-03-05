/**
 * pages.config.js - Page routing configuration
 * Simplified: removed 26 static onboarding question pages (Q1–Q26).
 * The dynamic onboarding (OnboardingFirstName) handles all questions via Claude API.
 */
import AIResources from './pages/AIResources';
import Activation from './pages/Activation';
import AgentNoah from './pages/AgentNoah';
import BonneNouvelle from './pages/BonneNouvelle';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import GenerationProgress from './pages/GenerationProgress';
import LandingNoah2 from './pages/LandingNoah2';
import MyOffers from './pages/MyOffers';
import OnboardingDynamic from './pages/OnboardingDynamic';
import OnboardingFirstName from './pages/OnboardingFirstName';
import OnboardingTransition from './pages/OnboardingTransition';
import PlanAction from './pages/PlanAction';
import Register from './pages/Register';
import Results from './pages/Results';
import SalesMessages from './pages/SalesMessages';
import SalesPage from './pages/SalesPage';
import Settings from './pages/Settings';
import SetupProfile from './pages/SetupProfile';
import UpsellCoaching from './pages/UpsellCoaching';
import Welcome from './pages/Welcome';

export const PAGES = {
  "AIResources": AIResources,
  "Activation": Activation,
  "AgentNoah": AgentNoah,
  "BonneNouvelle": BonneNouvelle,
  "Booking": Booking,
  "Dashboard": Dashboard,
  "GenerationProgress": GenerationProgress,
  "LandingNoah2": LandingNoah2,
  "MyOffers": MyOffers,
  "OnboardingDynamic": OnboardingDynamic,
  "OnboardingFirstName": OnboardingFirstName,
  "OnboardingTransition": OnboardingTransition,
  "PlanAction": PlanAction,
  "Register": Register,
  "Results": Results,
  "SalesMessages": SalesMessages,
  "SalesPage": SalesPage,
  "Settings": Settings,
  "SetupProfile": SetupProfile,
  "UpsellCoaching": UpsellCoaching,
  "Welcome": Welcome,
};

export const pagesConfig = {
  mainPage: "LandingNoah2",
  Pages: PAGES,
};
