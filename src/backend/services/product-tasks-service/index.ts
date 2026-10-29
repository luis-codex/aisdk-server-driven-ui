import { PRODUCT_TASK_CATEGORIES } from '@/backend/domain/product-tasks'

export class ProductTasksService {
	private readonly _managed = new Set<string>()

	public categories() {
		return PRODUCT_TASK_CATEGORIES.map(({ products, ...category }) => ({
			...category,
			count: products.filter((product) => !this._managed.has(product.id)).length,
		}))
	}

	public products(categoryId: string) {
		const category = PRODUCT_TASK_CATEGORIES.find((item) => item.id === categoryId)
		if (!category) return []
		return category.products.filter((product) => !this._managed.has(product.id))
	}

	public categoryIdForProduct(productId: string) {
		return PRODUCT_TASK_CATEGORIES.find((category) =>
			category.products.some((product) => product.id === productId)
		)?.id
	}

	public complete(productId: string) {
		this._managed.add(productId)
	}

	public isManaged(productId: string) {
		return this._managed.has(productId)
	}
}
