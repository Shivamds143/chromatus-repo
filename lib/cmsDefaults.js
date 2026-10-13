import { home } from '@/data/content/home';
import {
  aboutOverview,
  ourStory,
  leadershipTeam,
  valuesCulture,
  awardsRecognitions,
  ourApproach
} from '@/data/content/about';
import {
  servicesOverview,
  strategyTransformation,
  technologyConsulting,
  dataAnalytics,
  cloudDigitalSolutions,
  managedServices,
  engagementModels,
  locationFeasibilityStudy,
  baselineEndlineStudy,
  governmentSurveys,
  marketAssessment,
  newProductLaunch,
  consumerBehaviour,
  priceBenchmarking,
  satisfactionStudies,
  brandManagement
} from '@/data/content/services';
import {
  industriesOverview,
  energyPower,
  healthcare,
  automotiveTransportation,
  foodBeverages,
  telecomIt,
  aerospaceDefense,
  semiconductorsElectronics,
  chemicalsMaterials,
  beyondTheseEight
} from '@/data/content/industries';
import { insightsOverview } from '@/data/content/insights';
import { careers, chromatusPro, contact, legal, faq } from '@/data/content/misc';
import {
  openPositions,
  lifeAtChromatus,
  careersBenefits,
  diversityEquityInclusion,
  earlyCareers,
  whoWeLookFor
} from '@/data/content/careersExtra';
import { contactFormPage, officeLocations, generalInquiries } from '@/data/content/contactExtra';

const DEFAULTS = {
  home,
  aboutOverview,
  ourStory,
  leadershipTeam,
  valuesCulture,
  awardsRecognitions,
  ourApproach,
  servicesOverview,
  strategyTransformation,
  technologyConsulting,
  dataAnalytics,
  cloudDigitalSolutions,
  managedServices,
  engagementModels,
  locationFeasibilityStudy,
  baselineEndlineStudy,
  governmentSurveys,
  marketAssessment,
  newProductLaunch,
  consumerBehaviour,
  priceBenchmarking,
  satisfactionStudies,
  brandManagement,
  industriesOverview,
  energyPower,
  healthcare,
  automotiveTransportation,
  foodBeverages,
  telecomIt,
  aerospaceDefense,
  semiconductorsElectronics,
  chemicalsMaterials,
  beyondTheseEight,
  insightsOverview,
  careers,
  whoWeLookFor,
  openPositions,
  lifeAtChromatus,
  careersBenefits,
  diversityEquityInclusion,
  earlyCareers,
  chromatusPro,
  contact,
  contactFormPage,
  officeLocations,
  generalInquiries,
  faq,
  legal_privacy: legal.privacy,
  legal_terms: legal.terms,
  legal_cookies: legal.cookies
};

export function getDefaultForKey(key) {
  return DEFAULTS[key] ?? null;
}
