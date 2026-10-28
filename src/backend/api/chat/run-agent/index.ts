import { createAgentUIStreamResponse, type UIMessage } from 'ai'
import { InvalidError } from '@/backend/domain/errors'
import { ChatAgentService } from '@/backend/services/agents-service/chat-agent'
import { RunAgentCommand } from './command'

/**
 * PRECONDITIONS
 * - El command trae `messages` como un arreglo de UIMessage del AI SDK
 *
 * BUSINESS RULES
 * - La respuesta se transmite como stream de UI messages (SSE) del AI SDK
 * - Si el cliente corta la conexión, la ejecución del agente se aborta
 *
 * EXCEPTIONS
 * - [PRECONDITIONS] InvalidError si `messages` no es un arreglo
 */
export class RunAgent {
	public static readonly Command = RunAgentCommand

	constructor(private readonly _chatAgentService: ChatAgentService) {}

	public async execute(command: RunAgentCommand): Promise<Response> {
		this._assertMessages(command.messages)
		return createAgentUIStreamResponse({
			agent: this._chatAgentService.getAgent(),
			uiMessages: command.messages,
			abortSignal: command.abortSignal,
		})
	}

	private _assertMessages(messages: unknown): asserts messages is UIMessage[] {
		if (!Array.isArray(messages)) {
			throw new InvalidError('`messages` debe ser un arreglo de mensajes')
		}
	}
}
