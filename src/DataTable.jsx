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
			pagination: !!props.pagination,
			currPage: currPage,
			pageSize: paginationProps.pageSize,
			remote: !!paginationProps.remote
		})
		this.state = {
			data: this.store.get(),
			currPage: currPage
		}
	}

	componentWillReceiveProps(nextProps) {
		const paginationProps = this.getPaginationProps(nextProps)
		const currPage = getActivePage(paginationProps)

		nextProps.data && this.store.set(nextProps.data)

		this.setState({
			data: this.store.setPage(currPage).get(),
			currPage: currPage
		})
	}

	render() {
		return (
			<div className="data-table-wapper">
				{this.renderDataTable()}
				{this.props.pagination ? this.renderPagination() : null}
			</div>
		)
	}

	renderDataTable() {
    const {striped, bordered, hover, serialNumber, dataFields, data, template, rowTemplate, children, ...otherProps} = this.props
    let classes = {
			'data-table': true,
      'table': true,
      'table-striped': striped,
      'table-bordered': bordered,
      'table-hover': hover
    }

    if(!dataFields || !Array.isArray(dataFields) || dataFields.length <= 0){
			throw 'Error. 属性 {dataFields} 必传，且为数组。'
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
		const {serialNumber, dataFields} = this.props

		return (
			<thead>
				<tr>
					{serialNumber ? <th key="no" width={50}>{this.props.serialNumberHead}</th> : null}
					{dataFields.map(field => 
						field.idField ? null : <th key={field.name || 'custom-column'}>{field.text}</th>
					)}
				</tr>
			</thead>
		)
	}

	renderTableBody() {
		const {serialNumber, dataFields, template, rowTemplate, emptyText} = this.props
		const data = this.state.data

		if(!data || !Array.isArray(data) || data.length <= 0){
			return this.renderEmptyText()
		}

		if(rowTemplate){
			return this.renderTableBodyForRowTemplate()
		}

		return (
			<tbody>
				{data.map((item, index) => 
					<tr key={'row' + index}>
						{serialNumber ? <td key="no">{++index}</td> : null}
						{dataFields.map(field => 
							field.idField ? null : <td key={field.name || 'custom-column'}>{item[field.name] || field.value || ''}</td>
						)}
					</tr>
				)}
			</tbody>
		)
	}

	renderEmptyText() {
		const { dataFields, serialNumber, emptyText } = this.props
		let cols = dataFields.length
			
		serialNumber && ++cols

		return (
			<tbody>
				<tr><td colSpan={cols} className="empty-text">{emptyText}</td></tr>
			</tbody>
		)
	}

	renderTableBodyForRowTemplate() {
		const { serialNumber, dataFields, rowTemplate } = this.props
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
					<tr key={'row' + rowIndex}>
						{serialNumber ? <td key="no">{++rowIndex}</td> : null}

						{dataFields.map((field, cellIndex) => {
							
							const { children, childrenNode, otherProps } = cells[cellIndex].props

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
		return (
			<Pagination
        {...this.props.pagination}
        activePage={this.state.currPage}
        onChangePage={this.onChangePage.bind(this)} />
		)
	}

	onChangePage(event, selectedEvent) {
		//TODO: 后台分页
		if(this.store.remote){

		}

		const currPage = selectedEvent.eventKey

    this.setState({
    	data: this.store.setPage(currPage).get(),
    	currPage: currPage
    })
	}

	getPaginationProps(props) {
		return (props || this.props).pagination || Pagination.defaultProps
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
   * 用于生成DataTable的模板（所有TBODY的行）
   */
  template: PropTypes.element,
  /**
   * 用于生成DataTable的行模板
   */
  rowTemplate: PropTypes.element,
  /**
   * 没有数据时，显示的提示信息
   */
  emptyText: PropTypes.string,
  /**
   * 是否添加分页
   */
  pagination: PropTypes.oneOfType([
  		PropTypes.bool,
  		PropTypes.object
  	])
}

DataTable.defaultProps = {
	striped: false,
	bordered: true,
	hover: false,
	serialNumber: false,
	serialNumberHead: Constants.SN_HEAD_TEXT,
	emptyText: Constants.EMPTY_TEXT,
	pagination: false
}

export default DataTable