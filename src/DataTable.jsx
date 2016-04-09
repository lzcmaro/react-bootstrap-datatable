import React, {PropTypes, cloneElement, createFactory} from 'react'
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
		
		if(rowTemplate.type !== 'tr'){
			throw 'Error. 行模板 {rowTemplate} 必须为<tr><td></td></tr>元素'
		}

		const tds = rowTemplate.props.children

		if(tds && tds.length > 0){

			if(tds.length !== fields.length){
				throw 'Error. 模板的列数必须和属性 {fields} 对应上'
			}

			tds.forEach(td => {
				if(td.type !== 'td'){
					throw 'Error. 行模板 {rowTemplate} 必须为<tr><td></td></tr>元素'
				}
			})

		}


		return (
			<tbody>
				{data.map((item, rowIndex) => 
					<tr key={'row' + rowIndex}>
						{serialNumber ? <td key="no">{++rowIndex}</td> : null}
						{fields.map((field, colIndex) => { 
							
							const { children, otherProps } = tds[colIndex].props

							//TODO: children可能会是个element，这里需要遍历children，直到它是string，然后把数据占位符%name%替换成真实数据后，再放回到td中

							return field.idField ? null : <td {...otherProps} key={field.name || 'custom-column'}>{children}</td>
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