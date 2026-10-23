import { Profile } from '../types/profile';

// Showcase profile used on marketing landing page previews
export const sampleProfile: Profile = {
  name: 'Aarav Mehta',
  email: 'aarav.mehta@gmail.com',
  undergrad: 'VIT Vellore',
  degree: 'B.Tech, Computer Science',
  institutionTier: 3,
  targetProgram: 'MS Computer Science',
  intake: 'Fall 2027',
  targetCountries: ['United States', 'United Kingdom', 'Canada'],
  gpa: 8.4,
  gre: 318,
  toefl: 104,
  publications: 0,
  workMonths: 18,
  internships: 2,
  lorStrength: 3,
  sopQuality: 62,
  isOnboarded: true
};

// Clean starting profile for un-onboarded new applicants
export const initialProfile: Profile = {
  name: '',
  email: '',
  undergrad: '',
  degree: '',
  institutionTier: 3,
  targetProgram: 'MS Computer Science',
  intake: 'Fall 2027',
  targetCountries: ['all'],
  gpa: 0,
  gre: 0,
  toefl: 0,
  publications: 0,
  workMonths: 0,
  internships: 0,
  lorStrength: 0,
  sopQuality: 0,
  isOnboarded: false
};