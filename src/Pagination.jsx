import React, { PropTypes } from 'react'
import classnames from 'classnames'
import BootstrapPagination from 'react-bootstrap/lib/Pagination'

import Constants from './constants'

export function getTotalPages(props) {
	const { pageSize, total } = props
	return Math.ceil(total / pageSize)
}

export function getActivePage(props) {
	const { activePage } = props
	const pageTotals = getTotalPages(props)
	return activePage < 1 ? 1 : ( activePage > pageTotals ? pageTotals : activePage )
}

class Pagination extends React.Component {

	static displayName = 'PaginationWapper';

	render() {
		const { ellipsis, boundaryLinks, maxButtons, showTotalText, align, onChangePage, ...otherProps } = this.props
		//TODO: 是否显示数据总数
		const totalPages = getTotalPages(otherProps)

		return totalPages > 1 ? (
			<div 
			  {...otherProps}
			  style={{textAlign: align}}
			  className='pagination-wapper'>
				<BootstrapPagination
				  first
	        last
	        prev
	        next
	        ellipsis={ellipsis}
	        boundaryLinks={boundaryLinks}
	        maxButtons={maxButtons}
	        items={totalPages}
	        activePage={getActivePage(otherProps)}
	        onSelect={this.props.onChangePage} />
			</div>
		) : null
	}
}

Pagination.propTypes = {
	/**
	 * 是否显示省略号按钮
	 */
	ellipsis: PropTypes.bool,
	/**
	 * 当ellipsis=true && boundaryLinks=true时，显示“第一页”、“最后一页”按钮
	 * @type {[type]}
	 */
	boundaryLinks: PropTypes.bool,
	/**
	 * 最多显示的分页按钮数
	 */
	maxButtons: PropTypes.number,
	/**
	 * 当前页
	 */
	activePage: PropTypes.number,
	/**
	 * 分页大小
	 */
	pageSize: PropTypes.number,
	/**
	 * 数据总数
	 */
	total: PropTypes.number,
	/**
	 * 是否显示数据总数
	 */
	showTotalText: PropTypes.bool,
	/**
	 * 分页按钮的对齐方式，right or left
	 */
	align: PropTypes.oneOf( Object.values(Constants.PAGINATION_ALIGN) ),
	/**
	 * 点击分页按钮时的回调事件
	 */
	onChangePage: PropTypes.func
}

Pagination.defaultProps = {
	ellipsis: true,
	boundaryLinks: false,
	maxButtons: 5,
	activePage: 1,
	pageSize: Constants.DEFAULT_PAGE_SIZE,
	total: 0,
	showTotalText: false,
	align: Constants.PAGINATION_ALIGN.RIGHT
}

export default Pagination