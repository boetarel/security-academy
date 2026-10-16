/**
 * officialExamsData.js
 * Aggregator — exam papers live in ./exams/grade-{e,d,c}.js
 */
import { exam as examE } from './exams/grade-e.js';
import { exam as examD } from './exams/grade-d.js';
import { exam as examC } from './exams/grade-c.js';

export const officialExamsData = {
  E: examE,
  D: examD,
  C: examC,
};
