import { DEFAULT_PAGE_SIZE } from './constants'

export default class DataStore {
	constructor(data, options = {currPage: 1, pageSize: DEFAULT_PAGE_SIZE, pagination: true}) {
		this.data = data || []
		this.options = options
	}

	get() {
		const { pagination, currPage, pageSize } = this.options
		if(pagination){
			let start = pageSize * (currPage - 1), end = start + pageSize
			return this.getSliceData(start, end)
		}
		return this.data
	}

	getSliceData(start, end){
		return this.data.slice(start, end)
	}

	set(data) {
		this.data = data || []
	}
	
	setPage(nextPage) {
		this.options.currPage = nextPage
		return this
	}

	setKeyField(keyField) {
		this.options.keyField = keyField
	}

	getKeyField(){
		return this.options.keyField
	}

	getDataLength() {
		return this.data.length
	}

	isPagination() {
		return this.options.pagination
	}

}