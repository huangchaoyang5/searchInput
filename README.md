# searchInput
=====================================================

1. using html5
2. tested jquery version is jquery-1.10.2.min.js and tested on chrom, firefox, and ie10+

```
<div id="companyDiv" style="float: left; position: relative"></div>
<div id="addressDiv" style="float: left; position: relative"></div>
<div id="notitleDiv" style="float: left; position: relative"></div>
<div id="editAddressDiv" style="position:relative;"></div>
    
<script type="text/javascript">
	$('#companyDiv').searchInput({
	   titleHtml: '公司別: ',
	   inputID: 'company',
	   inputName: 'company',
	   hasAjax: true,
	   ajaxUrl: '/API/getCompanyName.aspx?CompanyName='
	});
	
	$('#addressDiv').searchInput({
            titleHtml: '<div>姓名</div>',
            inputID: 'name',
            inputName: 'name',
	    inputValue: 'myName',  // inputValue: '' same as not declare
            inputResultStyle: 'max-height:300px;'
        });
	
	$('#notitleDiv').searchInput({
            titleHtml: '地址 ',
            inputPlaceholder: '城市和區域',
            inputID: 'address',
            inputName: 'address',
            inputStyle: 'width:500px;font-size:larger;padding:10px;',
            inputResultStyle: 'font-size:larger;',
            onSelectedColorCode: 'lightblue',
            taiwanCity: true
        });
	
	$('#notitleDiv').searchInput({
                inputPlaceholder: '地址提示只有顯示縣市和區',
                inputID: 'Address',
                inputName: 'Address',
                inputStyle: 'width:500px;padding:5px;background-color: #f0f0f0;',
                inputResultStyle: 'width:510px;left:13px;font-size: 11pt;background-color: #f0f0f0;',
                taiwanCity: true,
                ajaxUrl: '/API/getAddressByOrderAddress.aspx?address='
        });
	
	$('#editAddressDiv').searchInput({
            inputPlaceholder: '地址提示只有顯示縣市和區',
            inputID: 'editAddress',
            inputName: 'editAddress',
            inputValue: '{Address}',
            loadingSpanDisplayBlock: true,
            inputResultStyle: 'width:510px;left:0px;font-size: 11pt;background-color: #f0f0f0;',
            taiwanCity: true,
            ajaxUrl: '/API/getAddressByOrderAddress.aspx?address='
        });
</script>
```
