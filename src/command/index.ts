import * as childProcess from "child_process";
import * as ProgressPromise from "p-progress";
import { ICancellationToken } from "./cancellation";

interface ICommand {
	execute(command: string, args?: string[], options?: ISpawnOptions): Promise<unknown>;
}

interface ISpawnOptions extends childProcess.SpawnOptions {
	input?: string;
	encoding?: string;
	log?: boolean;
	cancellationToken?: ICancellationToken;
	onSpawnStdout?: (chunk: Buffer) => void;
	onSpawnStderr?: (chunk: Buffer) => void;
}
export default class Command implements ICommand {
	progressPromise = () => {
		return new ProgressPromise((resolve, reject, progress) => {});
	};

	execute = (command: string, args: string[] = [], options: childProcess.ExecOptions) => {
		return new Promise((resolve, reject) => {
			if (!command || !options.cwd) {
				return reject(new Error(`Both command and working directory must be given`));
			}

			if (
				args &&
				!args.every(arg => {
					const type = typeof arg;
					return type === "boolean" || type === "string" || type === "number";
				})
			) {
				return reject(new Error("All arguments must be a boolean, string or number"));
			}

			let stdout: Buffer;
			let stderr: Buffer;

			const newOptions = { ...options };

			if (!options.onSpawnStdout)
				newOptions.onSpawnStdout = (chunk: Buffer) => {
					stdout = Buffer.from(chunk);
				};

			if (!options.onSpawnStderr)
				newOptions.onSpawnStderr = (chunk: Buffer) => {
					stderr = Buffer.from(chunk);
				};

			// TODO Delete
			// console.log('+', command, args.join(' '), '# in', newOptions.cwd);

			const proc = childProcess.spawn(command, args, this.options);

			proc.stdout!.on("data", newOptions.onSpawnStdout!);

			proc.stderr!.on("data", newOptions.onSpawnStderr!);

			proc.on("error", error =>
				reject(
					new Error(
						`${command} ${args.join(" ")} in ${newOptions.cwd} encountered error ${
							error.message
						}`,
					),
				),
			);

			proc.on("exit", code => {
				if (code !== 0) {
					reject(
						new Error(
							`${command} ${args.join(" ")} in ${
								newOptions.cwd
							} exited with code ${code}
            For Stack Trace: ${stderr}`,
						),
					);
				} else {
					resolve(stdout);
				}
			});
		});
	};
}
