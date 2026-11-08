// Author verification only. Runs repository-owned examples with local compilers;
// this is never a backend for executing visitor code.
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { Program } from 'services/server/runner/program';
import { runOnSystem } from 'services/server/runner/backends/system';
import { runInDocker } from 'services/server/runner/backends/docker';
import { RunOutcome } from 'services/server/runner/verdict';

const execute = (command: string, args: string[], cwd: string, stdin = '', env = process.env) =>
  new Promise<{ stdout: Buffer; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, { cwd, env });
    const output: Buffer[] = [];
    let stderr = '';
    let bytes = 0;
    const timer = setTimeout(() => child.kill('SIGKILL'), 90000);
    child.stdout.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > 8 * 1024 * 1024) child.kill('SIGKILL');
      else output.push(chunk);
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr = (stderr + chunk).slice(-20000);
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error(`${command} exited ${code || signal}: ${stderr}`));
      else resolve({ stdout: Buffer.concat(output), stderr });
    });
    child.stdin.on('error', () => undefined);
    child.stdin.end(stdin);
  });

export async function runPublished(program: Program): Promise<RunOutcome> {
  const { runtime, assembled, stdin, limits } = program;
  const language = runtime.language.toLowerCase();
  if (['javascript', 'typescript', 'python'].includes(language))
    return runOnSystem(runtime, assembled.source, stdin, limits);
  if (
    ['cpp', 'swift', 'rust', 'go'].includes(language) &&
    !(language === 'swift' && process.env.FOUNDATION_SWIFTC)
  ) {
    const image = process.env[`WALKTHROUGH_${language.toUpperCase()}_IMAGE`];
    const compiler =
      language === 'go'
        ? {
            compile: 'go build -p=1 -o main main.go',
            compileMemoryKb: 2048000,
            env: { ...runtime.docker.env, GOMAXPROCS: '2' },
          }
        : {};
    // Generated suites contain many more cases than an interactive lesson.
    // Leave room for their protocol output and per-case error reservations.
    return runInDocker(
      { ...runtime, docker: { ...runtime.docker, ...compiler, ...(image ? { image } : {}) } },
      assembled.source,
      stdin,
      { ...limits, maxFileSizeKb: 16 * 1024 },
    );
  }
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'skilled-published-'));
  try {
    await fs.writeFile(path.join(dir, runtime.docker.sourceFile), assembled.source);
    let command: string;
    let args: string[];
    let env = process.env;
    const javaHome = process.env.WALKTHROUGH_JAVA_HOME;
    const java = javaHome ? path.join(javaHome, 'bin/java') : 'java';
    if (language === 'java') {
      await execute(
        javaHome ? path.join(javaHome, 'bin/javac') : 'javac',
        ['-encoding', 'UTF-8', 'Main.java'],
        dir,
      );
      command = java;
      args = ['-Xss8m', '-cp', dir, 'Main'];
    } else if (language === 'kotlin') {
      const kotlinc = process.env.WALKTHROUGH_KOTLINC || 'kotlinc';
      env = { ...process.env, ...(javaHome ? { JAVA_HOME: javaHome } : {}) };
      await execute(
        kotlinc,
        ['-nowarn', '-include-runtime', '-d', 'Main.jar', 'Main.kt'],
        dir,
        '',
        env,
      );
      command = java;
      args = ['-Xss8m', '-jar', 'Main.jar'];
    } else if (language === 'swift') {
      await execute(
        process.env.FOUNDATION_SWIFTC!,
        ['-swift-version', '5', '-Onone', '-suppress-warnings', 'main.swift', '-o', 'main'],
        dir,
      );
      command = path.join(dir, 'main');
      args = [];
    } else if (language === 'csharp') {
      command = process.env.WALKTHROUGH_DOTNET || 'dotnet';
      env = {
        ...process.env,
        DOTNET_CLI_TELEMETRY_OPTOUT: '1',
        DOTNET_NOLOGO: '1',
        DOTNET_SKIP_FIRST_TIME_EXPERIENCE: '1',
      };
      await fs.writeFile(
        path.join(dir, 'NuGet.Config'),
        '<configuration><packageSources><clear /></packageSources></configuration>',
      );
      await fs.writeFile(
        path.join(dir, 'Main.csproj'),
        '<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><StartupObject>__SkilledDriver.Program</StartupObject><EnableDefaultCompileItems>true</EnableDefaultCompileItems></PropertyGroup></Project>',
      );
      await execute(command, ['build', '--nologo', '-v:q', '-o', 'out'], dir, '', env);
      args = ['out/Main.dll'];
    } else throw new Error(`No author verification backend for ${language}`);
    const result = await execute(command, args, dir, stdin, env);
    return {
      statusId: 3,
      statusDescription: 'Accepted',
      stdout: result.stdout,
      stderr: result.stderr,
      compileOutput: '',
      message: '',
      timeSeconds: null,
      memoryKb: null,
    };
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}
