export class RunAgentCommand {
	public readonly messages: unknown
	public readonly abortSignal: AbortSignal

	constructor(data: IConstructor) {
		this.messages = data.messages
		this.abortSignal = data.abortSignal
	}
}

interface IConstructor {
	messages: unknown
	abortSignal: AbortSignal
}
