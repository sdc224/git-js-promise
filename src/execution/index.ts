import { SpawnOptions } from "child_process";

export interface IExec {
	execute(command: string, args?: string[], options?: SpawnOptions): Promise<unknown>;
}

export abstract class Exec implements IExec {
	constructor(protected exec: IExec) {}

	execute = async (command: string, args: string[] = [], options: SpawnOptions = {}) => {
		await this.exec.execute(command, args, options);
	};
}
