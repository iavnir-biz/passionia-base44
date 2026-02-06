/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIResources from './pages/AIResources';
import Activation from './pages/Activation';
import AdCopies from './pages/AdCopies';
import AgentNoah from './pages/AgentNoah';
import AvatarClients from './pages/AvatarClients';
import BonneNouvelle from './pages/BonneNouvelle';
import Booking from './pages/Booking';
import CTAPAYWALL from './pages/CTAPAYWALL';
import ChooseYourPath from './pages/ChooseYourPath';
import ChooseYourPathNew from './pages/ChooseYourPathNew';
import DailyActions from './pages/DailyActions';
import Documents from './pages/Documents';
import DoneForYouElite from './pages/DoneForYouElite';
import DownsellSession from './pages/DownsellSession';
import EmailsMarketing from './pages/EmailsMarketing';
import EtComment from './pages/EtComment';
import GenerationProgress from './pages/GenerationProgress';
import Home from './pages/Home';
import MarketAnalysis from './pages/MarketAnalysis';
import MonetiserSavoir from './pages/MonetiserSavoir';
import MyOffers from './pages/MyOffers';
import NoahGeneration from './pages/NoahGeneration';
import NovaChat from './pages/NovaChat';
import NovaGeneration from './pages/NovaGeneration';
import OfferGenerationStart from './pages/OfferGenerationStart';
import OfferPetitExtra from './pages/OfferPetitExtra';
import OfferPremium from './pages/OfferPremium';
import OfferProductPrincipal from './pages/OfferProductPrincipal';
import OfferResume from './pages/OfferResume';
import OfferSuperieure from './pages/OfferSuperieure';
import OfferTaVieFuture from './pages/OfferTaVieFuture';
import Onboarding from './pages/Onboarding';
import OnboardingDynamic from './pages/OnboardingDynamic';
import OnboardingFirstName from './pages/OnboardingFirstName';
import OnboardingQ10TypicalMistake from './pages/OnboardingQ10TypicalMistake';
import OnboardingQ11ExtraDetail from './pages/OnboardingQ11ExtraDetail';
import OnboardingQ12AgeRange from './pages/OnboardingQ12AgeRange';
import OnboardingQ13Gender from './pages/OnboardingQ13Gender';
import OnboardingQ14Family from './pages/OnboardingQ14Family';
import OnboardingQ15CurrentIncome from './pages/OnboardingQ15CurrentIncome';
import OnboardingQ16TargetIncome from './pages/OnboardingQ16TargetIncome';
import OnboardingQ17TargetDelay from './pages/OnboardingQ17TargetDelay';
import OnboardingQ18LifeChange from './pages/OnboardingQ18LifeChange';
import OnboardingQ19Impact from './pages/OnboardingQ19Impact';
import OnboardingQ1CoreSkill from './pages/OnboardingQ1CoreSkill';
import OnboardingQ20Emotions from './pages/OnboardingQ20Emotions';
import OnboardingQ21Relatives from './pages/OnboardingQ21Relatives';
import OnboardingQ22Lifestyle from './pages/OnboardingQ22Lifestyle';
import OnboardingQ23Obstacles from './pages/OnboardingQ23Obstacles';
import OnboardingQ24IfNothingChanges from './pages/OnboardingQ24IfNothingChanges';
import OnboardingQ25Readiness from './pages/OnboardingQ25Readiness';
import OnboardingQ26DeliveryPreferences from './pages/OnboardingQ26DeliveryPreferences';
import OnboardingTransition from './pages/OnboardingTransition';
import PlanAction from './pages/PlanAction';
import PlanStepDetail from './pages/PlanStepDetail';
import ProtocoleQuickwin from './pages/ProtocoleQuickwin';
import Results from './pages/Results';
import SalesMessages from './pages/SalesMessages';
import SalesPage from './pages/SalesPage';
import Settings from './pages/Settings';
import SetupProfile from './pages/SetupProfile';
import SkoolAbonnement from './pages/SkoolAbonnement';
import SkoolComparaison from './pages/SkoolComparaison';
import SocialMedia from './pages/SocialMedia';
import UpsellCoaching from './pages/UpsellCoaching';
import Welcome from './pages/Welcome';
import WelcomeOpening from './pages/WelcomeOpening';
import Dashboard from './pages/Dashboard';


export const PAGES = {
    "AIResources": AIResources,
    "Activation": Activation,
    "AdCopies": AdCopies,
    "AgentNoah": AgentNoah,
    "AvatarClients": AvatarClients,
    "BonneNouvelle": BonneNouvelle,
    "Booking": Booking,
    "CTAPAYWALL": CTAPAYWALL,
    "ChooseYourPath": ChooseYourPath,
    "ChooseYourPathNew": ChooseYourPathNew,
    "DailyActions": DailyActions,
    "Documents": Documents,
    "DoneForYouElite": DoneForYouElite,
    "DownsellSession": DownsellSession,
    "EmailsMarketing": EmailsMarketing,
    "EtComment": EtComment,
    "GenerationProgress": GenerationProgress,
    "Home": Home,
    "MarketAnalysis": MarketAnalysis,
    "MonetiserSavoir": MonetiserSavoir,
    "MyOffers": MyOffers,
    "NoahGeneration": NoahGeneration,
    "NovaChat": NovaChat,
    "NovaGeneration": NovaGeneration,
    "OfferGenerationStart": OfferGenerationStart,
    "OfferPetitExtra": OfferPetitExtra,
    "OfferPremium": OfferPremium,
    "OfferProductPrincipal": OfferProductPrincipal,
    "OfferResume": OfferResume,
    "OfferSuperieure": OfferSuperieure,
    "OfferTaVieFuture": OfferTaVieFuture,
    "Onboarding": Onboarding,
    "OnboardingDynamic": OnboardingDynamic,
    "OnboardingFirstName": OnboardingFirstName,
    "OnboardingQ10TypicalMistake": OnboardingQ10TypicalMistake,
    "OnboardingQ11ExtraDetail": OnboardingQ11ExtraDetail,
    "OnboardingQ12AgeRange": OnboardingQ12AgeRange,
    "OnboardingQ13Gender": OnboardingQ13Gender,
    "OnboardingQ14Family": OnboardingQ14Family,
    "OnboardingQ15CurrentIncome": OnboardingQ15CurrentIncome,
    "OnboardingQ16TargetIncome": OnboardingQ16TargetIncome,
    "OnboardingQ17TargetDelay": OnboardingQ17TargetDelay,
    "OnboardingQ18LifeChange": OnboardingQ18LifeChange,
    "OnboardingQ19Impact": OnboardingQ19Impact,
    "OnboardingQ1CoreSkill": OnboardingQ1CoreSkill,
    "OnboardingQ20Emotions": OnboardingQ20Emotions,
    "OnboardingQ21Relatives": OnboardingQ21Relatives,
    "OnboardingQ22Lifestyle": OnboardingQ22Lifestyle,
    "OnboardingQ23Obstacles": OnboardingQ23Obstacles,
    "OnboardingQ24IfNothingChanges": OnboardingQ24IfNothingChanges,
    "OnboardingQ25Readiness": OnboardingQ25Readiness,
    "OnboardingQ26DeliveryPreferences": OnboardingQ26DeliveryPreferences,
    "OnboardingTransition": OnboardingTransition,
    "PlanAction": PlanAction,
    "PlanStepDetail": PlanStepDetail,
    "ProtocoleQuickwin": ProtocoleQuickwin,
    "Results": Results,
    "SalesMessages": SalesMessages,
    "SalesPage": SalesPage,
    "Settings": Settings,
    "SetupProfile": SetupProfile,
    "SkoolAbonnement": SkoolAbonnement,
    "SkoolComparaison": SkoolComparaison,
    "SocialMedia": SocialMedia,
    "UpsellCoaching": UpsellCoaching,
    "Welcome": Welcome,
    "WelcomeOpening": WelcomeOpening,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
};