import vm from 'vm';
import { outputQuestions } from '../javascriptOutputQuiz';
import { resources, resourcePath } from 'content/resources';

it('executes every published quiz snippet under its strict-function contract, including all promise jobs', async () => {
  for (const question of outputQuestions) {
    const lines: string[] = [];
    const completion = vm.runInNewContext(
      `(async function() { 'use strict';\n${question.code}\n})()`,
      {
        console: { log: (...args: unknown[]) => lines.push(args.map(String).join(' ')) },
      },
      { timeout: 1000 },
    );
    await completion;
    await new Promise<void>((resolve) => setImmediate(resolve));
    const correct = question.choices.find((choice) => choice.id === question.answer)!;
    expect({ id: question.id, output: lines.join('\n') }).toEqual({
      id: question.id,
      output: correct.output,
    });
  }
});

it('keeps quiz choices unambiguous and sends readers to published study resources', () => {
  const routes = resources.map(resourcePath);
  expect(new Set(outputQuestions.map((question) => question.id)).size).toBe(outputQuestions.length);
  for (const question of outputQuestions) {
    expect(question.choices.filter((choice) => choice.id === question.answer)).toHaveLength(1);
    expect(new Set(question.choices.map((choice) => choice.id)).size).toBe(question.choices.length);
    expect(new Set(question.choices.map((choice) => choice.output)).size).toBe(
      question.choices.length,
    );
    expect(question.choices.every((choice) => choice.reason.length > 0)).toBe(true);
    expect(routes).toContain(question.guide);
    expect(new URL(question.reference.url).protocol).toBe('https:');
  }
});
