import React, { Component } from 'react'

import DataTable from '../../src/DataTable'

import 'bootstrap/less/bootstrap.less'
import '../../src/less/data-table.less'

class DataViewExample extends Component {

  render() {

  	const fields = [{
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
  		text: 'Custom Column'
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

		const template = null;

		const rowTemplate = (
			<tr>
				<td>%id%</td>
				<td><span>%name%</span></td>
				<td>%price%</td>
				<td>%createDate%</td>
				<td><a href="javascript:;" onClick={() => console.log('deleting')}>Delete</a></td>
			</tr>
		);
  	
    return (
    	<div style={{width: '700px', margin: '0 auto'}}>
    		<h2>Data Table.</h2>
    		<DataTable striped hover serialNumber fields={fields} data={products} template={template} rowTemplate={rowTemplate}>
    			
    		</DataTable>
    	</div>      
    );
  }
}

export default DataViewExample;
