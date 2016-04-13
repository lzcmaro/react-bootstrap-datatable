import React, {PropTypes, cloneElement, createFactory, isValidElement} from 'react'
import classnames from 'classnames'

import DataStore from './dataStore'
import Pagination, { getActivePage } from './Pagination'
import Constants from './constants'

class DataTable extends React.Component {
	
	constructor(props) {
		super(props)

		const paginationProps = this.getPaginationProps(props)
		const currPage = getActivePage(paginationProps)

		this.store = new DataStore(props.data, {
			pagination: props.pagination && props.pagination.local,
			currPage: currPage,
			pageSize: paginationProps.pageSize
		})

		this.state = {
			data: this.store.get(),
			currPage: currPage,
			selectAll: false,
			selectedRows: []
		}
	}

	componentWillReceiveProps(nextProps) {
		const paginationProps = this.getPaginationProps(nextProps)
		const currPage = getActivePage(paginationProps)

		nextProps.data && this.store.set(nextProps.data)

		this.setState({
			data: this.store.setPage(currPage).get(),
			currPage: currPage,
			selectAll: false,
			selectedRows: []
		})
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
    const {striped, bordered, hover, serialNumber, dataFields, data, rowTemplate, children, ...otherProps} = this.props
    let classes = {
			'data-table': true,
      'table': true,
      'table-striped': striped,
      'table-bordered': bordered,
      'table-hover': hover
    }

    if(!dataFields || !Array.isArray(dataFields) || dataFields.length <= 0){
			throw 'Error. 属性 {dataFields} 必传，且不为空数组。'
		}

		let keyField

		dataFields.forEach(field => {
			if(field.idField){
				if(keyField){
					throw 'Error. 属性 {dataFields.idField} 只能设一个值。'
				}
				keyField = field.idField
			}
		})

		if(!keyField){
			throw 'Error. 属性 {dataFields.idField} 需要设一个值。'
		}

		//用来保存用户设置的idField值，方便后面使用以及获取相应数据
		this.store.setKeyField({keyField})

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

	renderSelectionColumn(isHead, key, rowData) {
		const { selection } = this.props
		let ElementType = isHead ? 'th' : 'td'
		let classes= 'cell-selection'

		let checked = isHead ? this.state.selectAll : this.state.selectedRows.indexOf(key) !== -1

		if(selection){

			switch(selection.mode){
				case Constants.SELECTION_MODE.SINGLE:
				  return (
				  		<ElementType className={classes}> {isHead ? null : <input key={key} type="radio" checked={checked} onClick={this.handleCheckInput.bind(this)} />}</ElementType>
				  	)
				case Constants.SELECTION_MODE.MULTIPLE:
				  return (
				  		<ElementType className={classes}><input key={key} type="checkbox" checked={checked} onClick={isHead ? this.handleSelectAll.bind(this) : this.handleCheckInput.bind(this)} /></ElementType>
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

		this.setState({
			selectAll: checked,
			selectedRows: checked ? this.state.data.map((item, index) => index) : []
		})

		selection.onSelectAll && selection.onSelectAll(checked)
	}

	handleSelectRow(event) {
		const { selection } = this.props
		
		if(selection && selection.clickToSelect === true){
			let rowIndex = event.currentTarget.rowIndex - 1,
				checked = this.state.selectedRows.indexOf(rowIndex) === -1
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
		const { selection } = this.props
		let selectedRows = []
				
		if(selection.mode === Constants.SELECTION_MODE.SINGLE){
			selectedRows.push( rowIndex )
		}else{
			selectedRows = this.state.selectedRows.slice()		
			checked ? selectedRows.push( rowIndex ) : ( selectedRows = selectedRows.filter(item => item !== rowIndex))
		}

		this.setState({
			selectAll: selectedRows.length === this.state.data.length,
			selectedRows: selectedRows
		})

		selection.onSelect && selection.onSelect(checked, this.state.data[rowIndex])
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

		return (
			<tbody>
				{data.map((item, index) => 
					<tr className={classnames(classes)} key={'row' + index} onClick={this.handleSelectRow.bind(this)}>
						{this.renderSelectionColumn(false, index)}
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

		return (
			<tbody>
				{data.map((dataItem, rowIndex) => 
					<tr className={classnames(classes)} key={'row' + rowIndex} onClick={this.handleSelectRow.bind(this)}>
						{this.renderSelectionColumn(false, rowIndex)}
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
    	currPage: currPage,
    	selectAll: false,
    	selectedRows: []
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
		const { selectedRows, data } = this.state
		return data.filter((item, index) => selectedRows.indexOf(index) !== -1)
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
   *   clickToSelect: bool,
   *   onSelect: func
   * }
   */
  selection: PropTypes.object
}

DataTable.defaultProps = {
	striped: false,
	bordered: true,
	hover: false,
	serialNumber: false,
	serialNumberHead: Constants.SN_HEAD_TEXT,
	emptyText: Constants.EMPTY_TEXT
}

export default DataTable