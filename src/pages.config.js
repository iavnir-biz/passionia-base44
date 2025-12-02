import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import PlanAction from './pages/PlanAction';
import PlanStepDetail from './pages/PlanStepDetail';
import DailyActions from './pages/DailyActions';
import Documents from './pages/Documents';


export const PAGES = {
    "Welcome": Welcome,
    "Onboarding": Onboarding,
    "Results": Results,
    "Dashboard": Dashboard,
    "PlanAction": PlanAction,
    "PlanStepDetail": PlanStepDetail,
    "DailyActions": DailyActions,
    "Documents": Documents,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
};