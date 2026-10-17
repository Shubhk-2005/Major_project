import { Application } from '../types/application';

export const initialApplications: Application[] = [
  {
    id: 'app-umass',
    universityId: 'umass',
    universityName: 'UMass Amherst',
    program: 'MS in Computer Science',
    country: 'United States',
    tier: 'target',
    stage: 'preparing',
    deadline: '2026-12-15',
    docs: { sop: 'draft', lor1: 'final', lor2: 'draft', lor3: 'missing', transcript: 'final', resume: 'final' },
    fee: 75,
    note: 'Tailor the SOP to the Database Systems group before finalizing.'
  },
  {
    id: 'app-cmu',
    universityId: 'cmu',
    universityName: 'Carnegie Mellon University',
    program: 'MS in Computer Science',
    country: 'United States',
    tier: 'reach',
    stage: 'shortlisted',
    deadline: '2026-12-10',
    docs: { sop: 'missing', lor1: 'draft', lor2: 'missing', lor3: 'missing', transcript: 'final', resume: 'draft' },
    fee: 80,
    note: 'Reach. Only submit after the November GRE retake.'
  },
  {
    id: 'app-usc',
    universityId: 'usc',
    universityName: 'University of Southern California',
    program: 'MS in Computer Science',
    country: 'United States',
    tier: 'consider',
    stage: 'shortlisted',
    deadline: '2026-12-15',
    docs: { sop: 'missing', lor1: 'draft', lor2: 'missing', lor3: 'missing', transcript: 'final', resume: 'final' },
    fee: 90,
    note: 'Coursework-heavy program. Emphasize industry work in the SOP.'
  },
  {
    id: 'app-neu',
    universityId: 'northeastern',
    universityName: 'Northeastern University',
    program: 'MS in Data Science',
    country: 'United States',
    tier: 'target',
    stage: 'preparing',
    deadline: '2027-01-15',
    docs: { sop: 'draft', lor1: 'final', lor2: 'final', lor3: 'missing', transcript: 'final', resume: 'final' },
    fee: 100,
    note: 'Confirm co-op eligibility for the Data Science track.'
  },
  {
    id: 'app-edi',
    universityId: 'edinburgh',
    universityName: 'University of Edinburgh',
    program: 'MSc in Artificial Intelligence',
    country: 'United Kingdom',
    tier: 'consider',
    stage: 'submitted',
    deadline: '2027-03-31',
    docs: { sop: 'final', lor1: 'final', lor2: 'final', lor3: 'final', transcript: 'final', resume: 'final' },
    fee: 60,
    note: 'Submitted Sep 18. Decisions usually arrive in 6–8 weeks.'
  },
  {
    id: 'app-tum',
    universityId: 'tum',
    universityName: 'Technical University of Munich',
    program: 'MSc in Informatics',
    country: 'Germany',
    tier: 'target',
    stage: 'shortlisted',
    deadline: '2027-05-31',
    docs: { sop: 'missing', lor1: 'missing', lor2: 'missing', lor3: 'missing', transcript: 'final', resume: 'draft' },
    fee: 0,
    note: 'Requires an APS certificate. Start that process in November.'
  }
];