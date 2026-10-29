export interface IPlanogramRecord {
	[key: string]: unknown
}

export interface IGetPlanogramsByEan {
	request: { storeId: string; ean: string }
	response: IPlanogramRecord[]
}
