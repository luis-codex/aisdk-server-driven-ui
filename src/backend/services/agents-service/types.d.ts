import type { ToolLoopAgent, ToolSet } from 'ai'

export interface IAgentService {
	getAgent(): ToolLoopAgent<never, ToolSet>
}
