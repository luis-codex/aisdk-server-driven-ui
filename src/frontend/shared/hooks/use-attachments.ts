import type { FileUIPart } from 'ai'
import { useState } from 'react'

const MAX_FILES = 4

export interface IAttachment {
	id: string
	file: File
	previewUrl: string
}

/** Imágenes adjuntas al mensaje que se está escribiendo (solo `image/*`). */
export const useAttachments = () => {
	const [attachments, setAttachments] = useState<IAttachment[]>([])

	const add = (files: FileList | null) => {
		const images = Array.from(files ?? []).filter((file) => file.type.startsWith('image/'))
		setAttachments((current) => [
			...current,
			...images
				.slice(0, MAX_FILES - current.length)
				.map((file) => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) })),
		])
	}

	const remove = (id: string) => {
		setAttachments((current) => {
			current.filter((a) => a.id === id).forEach((a) => URL.revokeObjectURL(a.previewUrl))
			return current.filter((a) => a.id !== id)
		})
	}

	const clear = () => {
		attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl))
		setAttachments([])
	}

	const toFileParts = (): Promise<FileUIPart[]> =>
		Promise.all(
			attachments.map(async ({ file }) => ({
				type: 'file' as const,
				filename: file.name,
				mediaType: file.type,
				url: await _readAsDataUrl(file),
			}))
		)

	return { attachments, canAdd: attachments.length < MAX_FILES, add, remove, clear, toFileParts }
}

const _readAsDataUrl = (file: File): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = () => reject(reader.error)
		reader.readAsDataURL(file)
	})
