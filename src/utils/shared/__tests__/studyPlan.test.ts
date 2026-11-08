import fs from 'fs';
import path from 'path';
import catalog from 'content/resources/catalog.json';
import course from 'content/resources/course.json';
import { headingId } from '../headings';
import {
  buildStudyPlan,
  defaultPlanOptions,
  planMarkdown,
  restoreStudyPlan,
  studyTracks,
  StudyTrack,
} from '../studyPlan';
import { patternQuestions, quizResults } from '../patternQuiz';

describe('study scheduling', () => {
  it('respects every daily budget, teaches before practice, and only reviews previously practiced topics', () => {
    for (const track of Object.keys(studyTracks) as StudyTrack[])
      for (const days of [3, 7, 14, 60])
        for (const minutes of [30, 60, 90, 120]) {
          const plan = buildStudyPlan({ days, minutes, track });
          const learned = new Set<string>();
          const practiced = new Set<string>();
          const ids = new Set<string>();
          expect(plan.days).toHaveLength(days);
          for (const day of plan.days) {
            expect(day.sessions.reduce((sum, session) => sum + session.minutes, 0)).toBe(minutes);
            for (const session of day.sessions) {
              expect(ids.has(session.id)).toBe(false);
              ids.add(session.id);
              if (session.kind === 'learn') learned.add(session.module.id);
              else if (session.kind === 'practice') {
                expect(learned.has(session.module.id)).toBe(true);
                practiced.add(session.module.id);
              } else expect(practiced.has(session.module.id)).toBe(true);
            }
          }
          expect(plan.unfinished.map((module) => module.id)).toEqual(
            studyTracks[track].modules.filter((id) => !practiced.has(id)),
          );
          expect(plan.unstarted.map((module) => module.id)).toEqual(
            studyTracks[track].modules.filter((id) => !learned.has(id)),
          );
        }
  });

  it('does not pretend short schedules cover an entire track and rotates reviews after initial coverage', () => {
    const short = buildStudyPlan({ days: 3, minutes: 30, track: 'balanced' });
    expect(short.unfinished).toHaveLength(studyTracks.balanced.modules.length - 1);
    expect(short.unstarted).toHaveLength(studyTracks.balanced.modules.length - 2);
    const long = buildStudyPlan({ days: 60, minutes: 120, track: 'foundations' });
    expect(long.unfinished).toHaveLength(0);
    const tail = long.days
      .flatMap((day) => day.sessions)
      .slice(-studyTracks.foundations.modules.length);
    expect(tail.every((session) => session.kind === 'review')).toBe(true);
    expect(new Set(tail.map((session) => session.module.id)).size).toBe(
      studyTracks.foundations.modules.length,
    );
    expect(buildStudyPlan(defaultPlanOptions)).toEqual(buildStudyPlan(defaultPlanOptions));
  });

  it('rejects invalid and unbounded inputs', () => {
    for (const days of [0, 2, 61, 3.5, NaN, Infinity])
      expect(() => buildStudyPlan({ ...defaultPlanOptions, days })).toThrow(/study days/);
    expect(() => buildStudyPlan({ ...defaultPlanOptions, minutes: 45 })).toThrow(/minutes/);
    expect(() =>
      buildStudyPlan({ ...defaultPlanOptions, track: '__proto__' as StudyTrack }),
    ).toThrow(/track/);
    expect(() =>
      restoreStudyPlan(
        JSON.stringify({
          version: 1,
          options: { ...defaultPlanOptions, track: ['balanced'] },
        }),
      ),
    ).toThrow(/track/);
  });

  it('restores only legitimate completion marks and exports the current state on an independent host', () => {
    const plan = buildStudyPlan({ days: 3, minutes: 30, track: 'foundations' });
    const id = plan.days[0].sessions[0].id;
    const restored = restoreStudyPlan(
      JSON.stringify({
        version: 1,
        options: plan.options,
        completed: [id, id, 'missing', null, 4],
      }),
    );
    expect(restored.completed).toEqual([id]);
    expect(restored.plan).toEqual(plan);
    const output = planMarkdown(restored.plan, restored.completed, 'https://school.example');
    expect(output).toContain('- [x] learn:');
    expect(output).toContain('- [ ] practice:');
    expect(output).toContain('https://school.example/guides/big-o-time-space-complexity');
    expect(output).toContain('## Still to schedule');
    expect(output).not.toContain('https://skilled.dev');
    for (const raw of ['bad JSON', 'null', '{"version":2}', 'x'.repeat(100001)])
      expect(() => restoreStudyPlan(raw)).toThrow();
  });
});

describe('quiz contracts and published destinations', () => {
  it('gives every prompt four distinct choices, one valid answer, and a follow-up', () => {
    expect(new Set(patternQuestions.map((q) => q.id)).size).toBe(patternQuestions.length);
    for (const question of patternQuestions) {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices.map((choice) => choice.id)).size).toBe(4);
      expect(question.choices.filter((choice) => choice.id === question.answer)).toHaveLength(1);
      expect(question.choices.every((choice) => choice.title && choice.explanation)).toBe(true);
      expect(question.followUp.length).toBeGreaterThan(20);
    }
  });

  it('scores the chosen round and identifies exactly which prompts need retry', () => {
    const ids = patternQuestions.map((q) => q.id);
    const answers = Object.fromEntries(patternQuestions.map((q) => [q.id, q.answer]));
    expect(quizResults(ids, answers)).toEqual({
      correct: ids.length,
      total: ids.length,
      missed: [],
    });
    delete answers[ids[0]];
    answers[ids[2]] = 'wrong';
    expect(quizResults(ids, answers).missed).toEqual([ids[0], ids[2]]);
    expect(quizResults([ids[1]], answers)).toEqual({ correct: 1, total: 1, missed: [] });
    expect(() => quizResults(['missing'], {})).toThrow();
    expect(() => quizResults([ids[0], ids[0]], {})).toThrow();
  });

  it('connects every planner and quiz destination to a published route and real heading', () => {
    const publicRoutes = new Set([
      ...catalog.map((item) => `/${item.section}/${item.slug}`),
      ...course.lessons.map((lesson) => `/course/${lesson.slug}`),
    ]);
    const destinations = new Set(patternQuestions.map((q) => q.guide));
    for (const track of Object.keys(studyTracks) as StudyTrack[])
      for (const day of buildStudyPlan({ days: 60, minutes: 120, track }).days)
        for (const session of day.sessions) {
          destinations.add(session.module.read);
          destinations.add(session.module.practice);
        }
    for (const destination of destinations) {
      const [pathname, anchor] = destination.split('#');
      expect(publicRoutes.has(pathname)).toBe(true);
      if (anchor) {
        const source = fs.readFileSync(
          path.resolve(process.cwd(), 'src/content/resources', `${pathname.slice(1)}.mdx`),
          'utf8',
        );
        const headings = Array.from(source.matchAll(/^#{2,6} (.+)$/gm), (match) =>
          headingId(match[1].replace(/[`*_]/g, '')),
        );
        expect(headings).toContain(anchor);
      }
    }
  });
});
