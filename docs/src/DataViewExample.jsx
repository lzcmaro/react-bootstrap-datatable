import React from 'react'

import DataTable from '../../src/DataTable'

import 'bootstrap/less/bootstrap.less'
import '../../src/less/data-table.less'

class DataViewExample extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      currPage: 1,
      data: []
    }
  }

  getDataForCurrPage(pageNumber) {
    let data = [];

    for (var i = 0; i < 101; i++) {
      data.push({id: pageNumber + '-' + i, name: ('Product-' + pageNumber + '-' + i), price: (100 + i), createDate: '2011-01-01'})
    }

    return data
  }

  componentDidMount() {
    // 模拟异步数据
    setTimeout(() => {
      this.setState({
        data: this.getDataForCurrPage(1)
      })
    }, 500)
  }

  render() {

    const { data } = this.state

  	const dataFields = [{
  		idField: true,
  		name: 'id'
  	}, {
  		name: 'name',
  		text: 'Product'
  	}, {
  		name: 'price',
  		text: () => {return (<span>Price</span>)}
  	}, {
  		name: 'createDate',
  		text: 'CreateDate'
  	}, {
      text: 'Custom Column'
    }];

		const rowTemplate = (
			<tr>
				<td>%id%</td>
				<td><span style={{color: 'red'}}>%name%</span></td>
				<td>%price%(%name%)</td>
				<td>%createDate%</td>
				<td childrenNode={(rowData) => this.renderCustomColumn(rowData)}></td>
			</tr>
		);

    const emptyText = (
      <p>没有数据，<a href="javascript:;" onClick={this.handleAdd}>马上添加</a></p>
    );
  	
    return (
    	<div style={{width: '700px', margin: '0 auto'}}>
    		<h2>Data Table.</h2>
        <div style={{marginBottom: '15px'}}><button onClick={this.handleGetSelectedDatas.bind(this)}>getSelectedDatas</button></div>
    		<DataTable
          ref="dataTable"
          striped 
          hover 
          serialNumber 
          serialNumberHead={'No.'}
          dataFields={dataFields} 
          data={data} 
          rowTemplate={rowTemplate} 
          emptyText={emptyText}
          pagination={{ 
            activePage: this.state.currPage, 
            pageSize: 10, 
            total: data.length, 
            showTotalText: true, 
            maxButtons: 5,
            local: true,
            onChangePage: this.handleChangePage.bind(this)
          }}
          selection={{
            mode: 'multiple',
            selected: ['1-1', '1-3', '1-7', 'aaa', 'bbb', '2-0', '2-8', '1-15'],
            clickToSelect: true,
            onSelect: this.handleSelect.bind(this),
            onSelectAll: this.handleSelectAll.bind(this)
          }} />
    	</div>      
    );
  }

  renderCustomColumn(rowData) {
  	return (
  		<a href="javascript:;" onClick={() => console.log('deleting', rowData.id)}>Delete</a>
  	)
  }

  handleGetSelectedDatas() {
    console.log('selectedDatas: ', this.refs.dataTable.getSelectedDatas())
  }

  /**
   * DataTable.pagination.local = true时，该事件不会被触发
   */
  handleChangePage(event, selectEvent) {
    const page = selectEvent.eventKey

    //模拟请求
    setTimeout(() => this.setState({
      data: this.getDataForCurrPage(page),
      currPage: page
    }), 500)
  }

  handleSelect(selected, rowData) {
    console.log('handleSelect: ', selected, rowData)
  }

  handleSelectAll(selected) {
    console.log('handleSelectAll: ', selected)
  }

  handleAdd(event) {
    console.log('handleAdd: ', event)
  }
}

export default DataViewExample;
