import { RunAgent } from './run-agent'

export class ChatController {
	constructor(private readonly _runAgent: RunAgent) {}

	public async stream(req: Request): Promise<Response> {
		try {
			const body = (await req.json()) as { messages?: unknown }
			const command = new RunAgent.Command({ messages: body.messages, abortSignal: req.signal })
			return await this._runAgent.execute(command)
		} catch (error) {
			const statusCode = (error as { statusCode?: number }).statusCode ?? 500
			console.error(
				`[ChatController] ${error instanceof Error ? (error.stack ?? error.message) : error}`
			)
			return Response.json({ message: (error as Error).message }, { status: statusCode })
		}
	}
}
