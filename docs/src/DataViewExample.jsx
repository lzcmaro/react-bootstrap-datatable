import React from 'react'

import DataTable from '../../src/DataTable'

import 'bootstrap/less/bootstrap.less'
import '../../src/less/data-table.less'

class DataViewExample extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      currPage: 1,
      data: this.getDataForCurrPage(1)
    }
  }

  getDataForCurrPage(pageNumber) {
    let data = [];

    for (var i = 0; i < 10; i++) {
      data.push({id: pageNumber + '-' + i, name: ('Product-' + pageNumber + '-' + i), price: (100 + i), createDate: '2011-01-01'})
    }

    return data
  }

  render() {

  	const dataFields = [{
  		idField: true,
  		name: 'id'
  	}, {
  		name: 'name',
  		text: 'Product'
  	}, {
  		name: 'price',
  		text: 'Price'
  	}, {
  		name: 'createDate',
  		text: 'CreateDate',
  		dataFormat: 'YYYY-MM-DD'
  	}, {
  		text: 'Custom Column',
  		dataFormat: this.renderCustomColumn.bind(this)
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
          data={this.state.data} 
          rowTemplate={rowTemplate} 
          pagination={{ 
            activePage: this.state.currPage, 
            pageSize: 10, 
            total: 101, 
            showTotalText: true, 
            maxButtons: 5,
            onChangePage: this.handleChangePage.bind(this)
          }}
          selection={{
            mode: 'multiple',
            selected: ['1-1', '1-3', '1-7', 'aaa', 'bbb', '2-0', '2-8'],
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
}

export default DataViewExample;
