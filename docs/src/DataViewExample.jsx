import React, { Component } from 'react'

import DataTable from '../../src/DataTable'

import 'bootstrap/less/bootstrap.less'
import '../../src/less/data-table.less'

class DataViewExample extends Component {

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
  		type: 'date',
  		dateFormat: 'YYYY-MM-DD'
  	}, {
  		text: 'Custom Column',
  		value: 'column'
  	}];

  	const products = [];

    for (var i = 0; i < 101; i++) {
      products.push({id: i, name: ('Product' + i), price: (100 + i), createDate: '2011-01-01'})
    };

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
    		<DataTable 
          striped 
          hover 
          serialNumber 
          serialNumberHead={'No.'} 
          dataFields={dataFields} 
          data={products} 
          rowTemplate={rowTemplate} 
          pagination={{remote: false, activePage: 1, pageSize: 10, total: products.length, showTotalText: true, maxButtons: 5}} />
    	</div>      
    );
  }

  renderCustomColumn(rowData) {
  	return (
  		<a href="javascript:;" onClick={() => console.log('deleting', rowData.id)}>Delete</a>
  	)
  }
}

export default DataViewExample;
