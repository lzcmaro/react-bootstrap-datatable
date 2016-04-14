import React, {PropTypes, cloneElement, createFactory, isValidElement} from 'react'
import classnames from 'classnames'

import DataStore from './dataStore'
import Pagination, { getActivePage } from './Pagination'
import Constants from './constants'

class DataTable extends React.Component {
	
	constructor(props) {
		super(props)
		this.store = new DataStore()
		this.initOptions(true, props)
	}

	componentWillReceiveProps(nextProps) {
		this.initOptions(false, nextProps)
	}

	initOptions(init, props) {
		const { data, dataFields, selection } = props
		const paginationProps = this.getPaginationProps(props)
		const currPage = getActivePage(paginationProps)
		let selectedRows = []
		let keyField

		if(!dataFields || !Array.isArray(dataFields) || dataFields.length <= 0){
			throw 'Error. 属性 {dataFields} 必传，且不为空数组。'
		}

		dataFields.forEach(field => {
			if(field.idField){
				if(keyField){
					throw 'Error. 属性 {dataFields.idField} 只能设一个值。'
				}
				keyField = field.name
			}
		})

		if(!keyField){
			throw 'Error. 属性 {dataFields.idField} 需要设一个值。'
		}

		if(data.length > 0 && selection && selection.selected){

			switch(selection.mode){
				case Constants.SELECTION_MODE.SINGLE:
				  if(typeof selection.selected !== 'number' && typeof selection.selected !== 'string'){
						throw 'Error. 属性 {selection.mode} 为single时，{selection.selected} 的值须为 number || string'
					}
					selectedRows = [selection.selected]
					break;
				case Constants.SELECTION_MODE.MULTIPLE:
				  if(!Array.isArray(selection.selected)){
						throw 'Error. 属性 {selection.mode} 为multiple时，{selection.selected} 的值须为 array'
					}
					selectedRows = selection.selected
					break;
			}

			//如果传递了不存在的keyFieldValue，会导致selectedRows中有多余的数据，可能会出现全选无法正确的自动选上的问题，这里对selectedRows进行过滤
			selectedRows = selectedRows.filter(keyFieldValue => this.filterKeyFieldValue(keyField, keyFieldValue, data))
			
		}

		this.store.set(data).setOptions({
			pagination: props.pagination && props.pagination.local,
			currPage: currPage,
			pageSize: paginationProps.pageSize,
			keyField: keyField
		})

		let state = {
			data: this.store.setPage(currPage).get(),
			currPage: currPage,
			selectAll: false,
			selectedRows: selectedRows
		}

		init ? this.state = state : this.setState(state)
	}

	filterKeyFieldValue(keyField, keyFieldValue, data) {
		let result = false
		data.forEach(d => {
			if(d[keyField] === keyFieldValue){
				result = true
				return false
			}
		})
		return result
	}

	getKeyField() {
		return this.store.getKeyField()
	}

	render() {
		return (
			<div className="data-table-wapper">
				{this.renderDataTable()}
				{this.renderPagination()}
			</div>
		)
	}

	renderDataTable() {
    const {striped, bordered, hover, serialNumber, dataFields, data, rowTemplate, emptyText, pagination, selection, children, ...otherProps} = this.props
    let classes = {
			'data-table': true,
      'table': true,
      'table-striped': striped,
      'table-bordered': bordered,
      'table-hover': hover
    }

		return (
			<table 
				{...otherProps}
				ref="table"
				className={classnames(classes)}>
				{this.renderTableHead()}
				{this.renderTableBody()}
			</table>
		)
	}

	renderTableHead() {
		const { serialNumber, serialNumberHead, dataFields, selection } = this.props
		let selectionProps = selection || {}

		return (
			<thead>
				<tr>
				  {this.renderSelectionColumn(true, 'all')}
					{this.renderSerialNumberColumn(true, serialNumberHead)}
					{dataFields.map(field => 
						field.idField ? null : <th key={field.name || 'custom-column'}>{field.text}</th>
					)}
				</tr>
			</thead>
		)
	}

	renderSelectionColumn(isHead, key) {
		const { selection } = this.props
		let ElementType = isHead ? 'th' : 'td'
		let classes= 'cell-selection'
		let checked = isHead ? this.state.selectAll : this.state.selectedRows.indexOf(key) !== -1

		if(selection){

			switch(selection.mode){
				case Constants.SELECTION_MODE.SINGLE:
				  return (
				  		<ElementType className={classes}> {isHead ? null : <input key={key} type="radio" checked={checked} onChange={this.handleCheckInput.bind(this)} />}</ElementType>
				  	)
				case Constants.SELECTION_MODE.MULTIPLE:
				  return (
				  		<ElementType className={classes}><input key={key} type="checkbox" checked={checked} onChange={isHead ? this.handleSelectAll.bind(this) : this.handleCheckInput.bind(this)} /></ElementType>
				  	)
        default:
        	throw 'Error. 属性 {selection.mode} 必须为single || multiple.'
			}

		}

		return null
	}

	handleSelectAll(event) {
		const { selection } = this.props
		const checked = event.currentTarget.checked
		const keyField = this.getKeyField()

		this.setState({
			selectAll: checked,
			selectedRows: checked ? this.state.data.map(item => item[keyField]) : []
		})

		selection.onSelectAll && selection.onSelectAll(checked)
	}

	handleSelectRow(event) {
		const { selection } = this.props
		const keyField = this.getKeyField()
		
		if(selection && selection.clickToSelect === true){
			let rowIndex = event.currentTarget.rowIndex - 1,
				rowData = this.state.data[rowIndex],
				checked = this.state.selectedRows.indexOf(rowData[keyField]) === -1
			this.handleToggleInput(rowIndex, checked)
		}
	}

	handleCheckInput(event) {
		let target = event.currentTarget, 
			checked = target.checked,
			rowIndex = target.parentElement.parentElement.rowIndex - 1 //tr.rowIndex会把<thead><tr></tr></thead>的行也计算在内
			
		this.handleToggleInput(rowIndex, checked)
	}

	handleToggleInput(rowIndex, checked){
		const { selection } = this.props, data = this.state.data, rowData = data[rowIndex], keyField = this.getKeyField()
		let selectedRows = []
				
		if(selection.mode === Constants.SELECTION_MODE.SINGLE){
			selectedRows.push( rowData[keyField] )
		}else{
			selectedRows = this.state.selectedRows.slice()		
			checked ? selectedRows.push( rowData[keyField] ) : ( selectedRows = selectedRows.filter(item => item !== rowData[keyField]))
		}

		this.setState({
			selectAll: selectedRows.length === data.length,
			selectedRows: selectedRows
		})

		selection.onSelect && selection.onSelect(checked, rowData)
	}

	renderSerialNumberColumn(isHead, cellText) {
		let ElementType = isHead ? 'th' : 'td'
		return this.props.serialNumber ? (
				<ElementType key="no" className="cell-no">{cellText}</ElementType>
			) : null
	}

	renderTableBody() {
		const {serialNumber, dataFields, rowTemplate, emptyText, selection} = this.props
		const data = this.state.data

		if(!data || !Array.isArray(data) || data.length <= 0){
			return this.renderEmptyText()
		}

		if(rowTemplate){
			return this.renderTableBodyForRowTemplate()
		}

		let classes = {
			'row-selection': selection && selection.clickToSelect
		}

		const keyField = this.getKeyField()

		return (
			<tbody>
				{data.map((item, index) => 
					<tr className={classnames(classes)} key={'row' + index} onClick={this.handleSelectRow.bind(this)}>
						{this.renderSelectionColumn(false, item[keyField])}
						{this.renderSerialNumberColumn(false, ++index)}
						{dataFields.map(field => 
							field.idField ? null : <td key={field.name || 'custom-column'}>{item[field.name] || field.value || ''}</td>
						)}
					</tr>
				)}
			</tbody>
		)
	}

	renderEmptyText() {
		const { dataFields, serialNumber, selection, emptyText } = this.props
		let columns = dataFields.length
			
		serialNumber && ++columns
		selection && ++columns

		return (
			<tbody>
				<tr><td colSpan={columns} className="empty-text">{emptyText}</td></tr>
			</tbody>
		)
	}

	renderTableBodyForRowTemplate() {
		const { serialNumber, dataFields, rowTemplate, selection } = this.props
		const data = this.state.data
		
		//校验模板是否为 <tr><td></td></tr> 格式
		if(rowTemplate.type !== 'tr'){
			throw 'Error. 行模板 {rowTemplate} 必须为<tr><td></td></tr>元素'
		}

		const cells = rowTemplate.props.children

		//校验模板中，其TD数量是否和dataFields长度一致
		if(!cells || cells.length !== dataFields.length){
			throw 'Error. 模板的列数必须和属性 {dataFields} 对应上'
		}

		cells.forEach(cell => {
			if(cell.type !== 'td'){
				throw 'Error. 行模板 {rowTemplate} 必须为<tr><td></td></tr>元素'
			}
		})

		let classes = {
			'row-selection': selection && selection.clickToSelect
		}

		const renderChildrenNode = (parent, child, data) => {
			if(typeof child === 'string'){
				//当children为string时，把数据占位符%%替换成真实数据
				return child.replace(/%\w*%/g, (key) => {
						return data[key.replace(/%/g, '')] || ''
					})			
			}else if(isValidElement(child)){
				//child为element时，递归调用renderChildrenNode，对所有children的%%数据占位符替换成真实数据。然后return clone后的element
				let node = renderChildrenNode(child, child.props.children, data)
				return cloneElement(child, {children: node})
			}

			return child	
		}

		const keyField = this.getKeyField()

		return (
			<tbody>
				{data.map((dataItem, rowIndex) => 
					<tr className={classnames(classes)} key={'row' + rowIndex} onClick={this.handleSelectRow.bind(this)}>
						{this.renderSelectionColumn(false, dataItem[keyField])}
						{this.renderSerialNumberColumn(false, ++rowIndex)}
						{dataFields.map((field, cellIndex) => {
							
							const { children, childrenNode, ...otherProps } = cells[cellIndex].props

							if(field.idField === true){ //idField为ID标识列，这里直接返回null，暂不作其它处理
								return null
							}

							if(childrenNode && typeof childrenNode !== 'function'){
								throw 'Error. TD的属性 {childrenNode} 必须为function'
							}

							let column = (<td {...otherProps} key={field.name || 'custom-column'}></td>)
							
							//如果该列传递了childrenNode，直接调用它得到TD的children
							let columnChildren = childrenNode ? childrenNode(dataItem || {}) : renderChildrenNode(column, children, dataItem || {})

							return cloneElement(column, {children: columnChildren})
						})}
					</tr>
				)}
			</tbody>
		)
	}

	renderPagination() {
		const { pagination } = this.props
		return pagination ? (
			<Pagination
        {...pagination}
        activePage={this.state.currPage}
        onChangePage={pagination.local ? this.handleChangePage.bind(this) : pagination.onChangePage} />
		) : null
	}

	handleChangePage(event, selectedEvent) {
		const currPage = selectedEvent.eventKey

    this.setState({
    	data: this.store.setPage(currPage).get(),
    	currPage: currPage
    })
	}

	getPaginationProps(props) {
		return (props || this.props).pagination || Pagination.defaultProps
	}

	/**
	 * 获取当前页已选择的行数据
	 * 该方法如果在this.props.selection.onSelect()中即时调用，由于state还没更新，这里的数据将会是历史的脏数据
	 */
	getSelectedDatas() {
		const { selectedRows } = this.state
		const keyField = this.getKeyField()
		return this.store.getAllData().filter(item => selectedRows.indexOf(item[keyField]) !== -1)
	}

}

DataTable.propTypes = {
	/**
	 * 是否隔行着色
	 */
	striped: PropTypes.bool,
	/**
	 * 是否显示border
	 */
  bordered: PropTypes.bool,
  /**
   * 是否在hover时，改变行背景色
   */
  hover: PropTypes.bool,
  /**
   * 是否添加序号列
   */
  serialNumber: PropTypes.bool,
  /**
   * 序号列头显示的TEXT
   */
  serialNumberHead: PropTypes.string,
  /**
   * 用于解析data数据的field标识
   */
  dataFields: PropTypes.array.isRequired,
  /**
   * 用于生成DataTable的源数据
   */
  data: PropTypes.array,
  /**
   * 用于生成DataTable的行模板，格式为 <tr><td></td></tr>
   */
  rowTemplate: PropTypes.element,
  /**
   * 没有数据时，显示的提示信息
   */
  emptyText: PropTypes.string,
  /**
   * 是否添加分页条
   * 
   * pagination: {
   *   ellipsis: bool,
   *   boundaryLinks: bool,
   *   maxButtons: number,
   *   activePage: number,
   *   pageSize: number,
   *   total: number,
   *   showTotalText: bool,
   *   align: 'right' || 'left',
   *   local: bool,
   *   onChangePage: func
   * }
   */
  pagination: PropTypes.object,
  /**
   * 是否添加行选择，single或multiple
   * 
   * selection: {
   *   mode: 'single' || 'multiple',
   *   selected: number || string || array,
   *   clickToSelect: bool,
   *   onSelect: func,
   *   onSelectAll: func
   * }
   */
  selection: PropTypes.object
}

DataTable.defaultProps = {
	data: [],
	striped: false,
	bordered: true,
	hover: false,
	serialNumber: false,
	serialNumberHead: Constants.SN_HEAD_TEXT,
	emptyText: Constants.EMPTY_TEXT
}

export default DataTable