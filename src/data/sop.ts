import { SopRubricItem, SopSegment } from '../types/document';

export const sopRubric: SopRubricItem[] = [
{ type: 'Specificity', base: -4, explanation: 'Claims lack concrete outcomes, numbers, or named projects.' },
{ type: 'Program fit', base: -3, explanation: 'No named lab, research group, or course ties you to the program.' },
{ type: 'Clarity', base: -1.5, explanation: 'Self-descriptions appear without evidence to support them.' },
{ type: 'Structure', base: -1, explanation: 'The closing does not connect back to your opening motivation.' },
{ type: 'Grammar & tone', base: 1, explanation: 'Clean, professional prose with no errors detected.' },
{ type: 'Length', base: 0.5, explanation: 'Within the 800–1,000 word range most programs expect.' }];


export const sopSegments: SopSegment[] = [
{
  id: 's1',
  text: 'Ever since I was a child, I have been fascinated by computers and technology.',
  suggestion: {
    type: 'Specificity',
    note: 'Childhood fascination is the most common SOP opener, and readers skim past it. Open with a concrete moment from your own work.',
    replacement: 'Last spring, a query-planning bug I traced at Infosys cut a nightly batch job from four hours to thirty-eight minutes, and left me wanting to understand why the optimizer had failed in the first place.',
    impact: 2.5
  }
},
{ id: 's2', text: ' During my undergraduate studies at VIT Vellore, I completed coursework in data structures, operating systems and machine learning, ' },
{
  id: 's3',
  text: 'and I have always been a hard worker who is passionate about learning.',
  suggestion: {
    type: 'Clarity',
    note: '"Hard worker" and "passionate" carry no evidence. Replace them with an outcome the reader can verify.',
    replacement: 'and graduated with an 8.4 CGPA while leading a four-person capstone on distributed caching.',
    impact: 1.5
  }
},
{ id: 's4', text: '\n\nAfter graduating, I joined Infosys as a Systems Engineer, where I have spent eighteen months on a data platform team serving 40 million daily queries. ' },
{
  id: 's5',
  text: 'My work involved many different tasks related to databases.',
  suggestion: {
    type: 'Specificity',
    note: 'This sentence undersells the strongest part of your profile. Name what you owned and what changed because of it.',
    replacement: 'I owned the migration of three legacy ETL pipelines to Spark and wrote the cost model our team now uses to schedule them.',
    impact: 2.5
  }
},
{ id: 's6', text: '\n\n' },
{
  id: 's7',
  text: 'I want to pursue a Master’s in Computer Science because it is a great way to advance my career.',
  suggestion: {
    type: 'Program fit',
    note: 'Career advancement is true of every applicant. State the specific capability you want to build.',
    replacement: 'I am applying to master’s programs to move from using query engines to building them, with a focus on learned query optimization.',
    impact: 1.5
  }
},
{ id: 's8', text: ' ' },
{
  id: 's9',
  text: 'Your university is one of the best in the world and has excellent faculty.',
  suggestion: {
    type: 'Program fit',
    note: 'Generic praise signals a templated SOP. Name the group, faculty work, or course that connects to your goal.',
    replacement: 'At UMass Amherst, the Database Systems group’s work on adaptive query processing maps directly onto the problems I met at Infosys, and COMPSCI 645 would give me the formal grounding I currently lack.',
    impact: 2.5
  }
},
{ id: 's10', text: '\n\n' },
{
  id: 's11',
  text: 'In the future, I hope to work as a software engineer at a top technology company, where I can apply what I have learned.',
  suggestion: {
    type: 'Structure',
    note: 'The closing restates a generic goal. Tie it back to the problem you opened with to close the loop.',
    replacement: 'After graduating, I want to join a database infrastructure team where learned optimizers are moving from research into production, the same gap I first noticed debugging that batch job.',
    impact: 2
  }
}];