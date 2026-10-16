/**
 * practiceQuestionsData.js
 * Aggregator — questions live in ./questions/grade-{e,d,c}-mod-N.js
 */
import { questions as qe1 } from './questions/grade-e-mod-1.js';
import { questions as qe2 } from './questions/grade-e-mod-2.js';
import { questions as qe3 } from './questions/grade-e-mod-3.js';
import { questions as qe4 } from './questions/grade-e-mod-4.js';
import { questions as qe5 } from './questions/grade-e-mod-5.js';
import { questions as qe6 } from './questions/grade-e-mod-6.js';
import { questions as qe7 } from './questions/grade-e-mod-7.js';
import { questions as qe8 } from './questions/grade-e-mod-8.js';
import { questions as qe9 } from './questions/grade-e-mod-9.js';
import { questions as qe10 } from './questions/grade-e-mod-10.js';
import { questions as qe11 } from './questions/grade-e-mod-11.js';
import { questions as qd1 } from './questions/grade-d-mod-1.js';
import { questions as qd2 } from './questions/grade-d-mod-2.js';
import { questions as qd3 } from './questions/grade-d-mod-3.js';
import { questions as qd4 } from './questions/grade-d-mod-4.js';
import { questions as qd5 } from './questions/grade-d-mod-5.js';
import { questions as qd6 } from './questions/grade-d-mod-6.js';
import { questions as qd7 } from './questions/grade-d-mod-7.js';
import { questions as qd8 } from './questions/grade-d-mod-8.js';
import { questions as qc1 } from './questions/grade-c-mod-1.js';
import { questions as qc2 } from './questions/grade-c-mod-2.js';
import { questions as qc3 } from './questions/grade-c-mod-3.js';
import { questions as qc4 } from './questions/grade-c-mod-4.js';
import { questions as qc5 } from './questions/grade-c-mod-5.js';
import { questions as qc6 } from './questions/grade-c-mod-6.js';
import { questions as qc7 } from './questions/grade-c-mod-7.js';
import { questions as qc8 } from './questions/grade-c-mod-8.js';

export const practiceQuestionsData = {
  E: [qe1, qe2, qe3, qe4, qe5, qe6, qe7, qe8, qe9, qe10, qe11].flat(),
  D: [qd1, qd2, qd3, qd4, qd5, qd6, qd7, qd8].flat(),
  C: [qc1, qc2, qc3, qc4, qc5, qc6, qc7, qc8].flat(),
};
