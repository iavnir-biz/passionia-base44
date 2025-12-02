import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';


export const PAGES = {
    "Welcome": Welcome,
    "Onboarding": Onboarding,
    "Results": Results,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
};