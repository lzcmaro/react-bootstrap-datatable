import React, {PropTypes, cloneElement, createFactory, isValidElement} from 'react'
import classnames from 'classnames'

class DataView extends React.Component {
	constructor(props) {
		super(props)

	}

	render() {
		return (
			<div className="data-view-wapper">
				{this.renderDataView()}
			</div>
		)
	}

	renderDataView() {
    const {striped, bordered, hover, serialNumber, fields, data, template, rowTemplate, children, ...otherProps} = this.props
    let classes = {
			'data-view': true,
      'table': true,
      'table-striped': striped,
      'table-bordered': bordered,
      'table-hover': hover
    }

    if(!fields || !Array.isArray(fields) || fields.length <= 0){
			throw 'Error. 属性 {fields} 必传，且为数组。'
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
		const {serialNumber, fields} = this.props

		return (
			<thead>
				<tr>
					{serialNumber ? <th key="no">序号</th> : null}
					{fields.map(field => 
						field.idField ? null : <th key={field.name || 'custom-column'}>{field.text}</th>
					)}
				</tr>
			</thead>
		)
	}

	renderTableBody() {
		const {serialNumber, fields, data, template, rowTemplate, emptyText} = this.props

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
						{fields.map(field => 
							field.idField ? null : <td key={field.name || 'custom-column'}>{item[field.name] || 'aaa'}</td>
						)}
					</tr>
				)}
			</tbody>
		)
	}

	renderEmptyText() {
		let cols = this.props.fields.length
			
		serialNumber && ++cols

		return (
			<tbody>
				<tr><td colSpan={cols} className="empty-text">{emptyText}</td></tr>
			</tbody>
		)
	}

	renderTableBodyForRowTemplate() {
		const {serialNumber, fields, data, template, rowTemplate, emptyText} = this.props
		
		//校验模板是否为 <tr><td></td></tr> 格式
		if(rowTemplate.type !== 'tr'){
			throw 'Error. 行模板 {rowTemplate} 必须为<tr><td></td></tr>元素'
		}

		const tds = rowTemplate.props.children

		//校验模板中，其TD数量是否和fields长度一致
		if(!tds || tds.length !== fields.length){
			throw 'Error. 模板的列数必须和属性 {fields} 对应上'
		}

		tds.forEach(td => {
			if(td.type !== 'td'){
				throw 'Error. 行模板 {rowTemplate} 必须为<tr><td></td></tr>元素'
			}
		})

		//当TD的children为string时，把数据占位符%%替换成真实数据
		const getColumnChildren = (child, data) => {
			if(typeof child === 'string'){
				return child.replace(/%\w*%/g, (key) => {
						return data[key.replace(/%/g, '')] || ''
					})
			}
			return child
		}


		return (
			<tbody>
				{data.map((dataItem, rowIndex) => 
					<tr key={'row' + rowIndex}>
						{serialNumber ? <td key="no">{++rowIndex}</td> : null}
						{fields.map((field, colIndex) => { 
							
							const { children, childrenNode, otherProps } = tds[colIndex].props

							if(field.idField === true){ //idField为ID标识列，这里直接返回null，暂不作其它处理
								return null
							}

							if(childrenNode && typeof childrenNode !== 'function'){
								throw 'Error. TD的属性 {childrenNode} 必须为function'
							}

							//如果该列传递了childrenNode，直接调用它得到TD的children
							return (
								<td {...otherProps} key={field.name || 'custom-column'}>{childrenNode ? childrenNode(dataItem || {}) : getColumnChildren(children, dataItem || {})}</td>
							)

						})}
					</tr>
				)}
			</tbody>
		)
	}

	renderTableFoot() {
		return (
			<tfoot>
				<tr><td></td></tr>
			</tfoot>
		)
	}

}

DataView.propTypes = {
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
  // serialNumberText: PropTypes.string,
  /**
   * 用于解析data数据的field标识
   */
  fields: PropTypes.array.isRequired,
  /**
   * 用于生成DataView的源数据
   */
  data: PropTypes.array,
  /**
   * 用于生成DataView的模板（所有TBODY的行）
   */
  template: PropTypes.element,
  /**
   * 用于生成DataView的行模板
   */
  rowTemplate: PropTypes.element,
  /**
   * 没有数据时，显示的提示信息
   */
  emptyText: PropTypes.string
}

DataView.defaultProps = {
	striped: false,
	bordered: true,
	hover: false,
	serialNumber: false,
	emptyText: '没有可显示的数据'
}

export default DataView