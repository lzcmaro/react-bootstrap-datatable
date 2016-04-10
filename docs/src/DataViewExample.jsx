import React, { Component } from 'react'

import DataTable from '../../src/DataTable'

import 'bootstrap/less/bootstrap.less'
import '../../src/less/data-table.less'

class DataViewExample extends Component {

  render() {

  	const dataField = [{
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

  	const products = [{
			id: 1,
			name: 'Product1',
			price: 101,
			createDate: '2011-01-01'
		}, {
			id: 2,
			name: 'Product2',
			price: 102,
			createDate: '2011-01-01'
		}, {
			id: 3,
			name: 'Product3',
			price: 103,
			createDate: '2011-01-01'
		}, {
			id: 4,
			name: 'Product4',
			price: 104,
			createDate: '2011-01-01'
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
    		<DataTable striped hover serialNumber serialNumberHead={'No.'} dataField={dataField} data={products} rowTemplate={rowTemplate} />
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
