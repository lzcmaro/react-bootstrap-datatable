import { DEFAULT_PAGE_SIZE } from './constants'

export default class DataStore {
	constructor(data, options = {currPage: 1, pageSize: DEFAULT_PAGE_SIZE, pagination: true, remote: false}) {
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
	/**
	 * 设置当前页码
	 * @param  {number} nextPage
	 * @return {DataStore}          
	 */
	setPage(nextPage) {
		this.options.currPage = nextPage
		return this
	}

	getDataLength() {
		return this.data.length
	}

	isPagination() {
		return this.options.pagination
	}

}