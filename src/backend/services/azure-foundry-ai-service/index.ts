import { createAzure, type AzureOpenAIProvider } from '@ai-sdk/azure'
import type { LanguageModel } from 'ai'
import { SecretsService } from '@/backend/services/secrets-service'

export class AzureFoundryAiService {
	private readonly _provider: AzureOpenAIProvider

	constructor(secretsService: SecretsService) {
		this._provider = createAzure({
			baseURL: secretsService.getRequired('AZURE_OPENAI_BASE_URL'),
			apiKey: secretsService.getRequired('AZURE_OPENAI_API_KEY'),
			apiVersion: secretsService.getRequired('AZURE_OPENAI_API_VERSION'),
		})
	}

	// El deployment model-router no soporta /v1/responses, solo chat completions.
	public languageModel(modelId: string): LanguageModel {
		return this._provider.chat(modelId)
	}
}
