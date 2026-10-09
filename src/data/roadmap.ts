import { RoadmapItem } from '../types/roadmap';

export const roadmapMonths = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

export const roadmapItems: RoadmapItem[] = [
{ id: 'r1', title: 'Retake GRE, target 326+', detail: 'Quant is where the gap is. Six weeks of focused prep on data interpretation and geometry typically moves Quant 4–6 points.', start: 0, span: 2, priority: 'high', factor: 'gre', lever: { gre: 326 } },
{ id: 'r2', title: 'Rewrite SOP with program-specific paragraphs', detail: 'Resolve the open suggestions in SOP feedback, then write one paragraph per program naming a group or course.', start: 0, span: 1, priority: 'high', factor: 'sop', lever: { sopQuality: 80 } },
{ id: 'r3', title: 'Submit capstone as a workshop paper', detail: 'Your distributed-caching capstone fits the scope of systems workshops with January deadlines. One accepted paper is the single largest lever on your score.', start: 1, span: 4, priority: 'high', factor: 'research', lever: { publications: 1 } },
{ id: 'r4', title: 'Request LOR from research advisor', detail: 'Ask Prof. Rao early and share a one-page brief on the capstone results so the letter can be specific.', start: 1, span: 1, priority: 'medium', factor: 'lor', lever: { lorStrength: 4 } },
{ id: 'r5', title: 'Submit Target applications', detail: 'UMass Amherst, Northeastern and Edinburgh. Lock these in before the Reach applications.', start: 2, span: 1, priority: 'high', factor: 'strategy' },
{ id: 'r6', title: 'Retake TOEFL only if under 105', detail: 'Your 104 clears every minimum. Only worth it if a Reach program lists 105 as preferred.', start: 2, span: 1, priority: 'low', factor: 'toefl', lever: { toefl: 110 } },
{ id: 'r7', title: 'Lead a production ML project at work', detail: 'Ownership of an ML feature in production strengthens both your work-experience signal and the SOP narrative.', start: 3, span: 6, priority: 'medium', factor: 'work', lever: { workMonths: 30 } },
{ id: 'r8', title: 'Submit Consider and Reach applications', detail: 'Use the updated GRE score and paper status. Deadlines cluster in December and January.', start: 2, span: 2, priority: 'high', factor: 'strategy' },
{ id: 'r9', title: 'Second paper or arXiv preprint', detail: 'Extend the capstone with an evaluation on a production-scale trace. Useful for thesis-track and Spring-intake applications.', start: 4, span: 5, priority: 'medium', factor: 'research', lever: { publications: 2 } },
{ id: 'r10', title: 'Interviews, decisions and funding', detail: 'Prepare for program interviews, compare offers against total cost, and apply for assistantships.', start: 6, span: 5, priority: 'low', factor: 'strategy' }];