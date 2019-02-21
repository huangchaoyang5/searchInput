# searchInput
=====================================================

1. using html5
2. tested jquery version is jquery-1.10.2.min.js and tested on chrom, firefox, and ie10+

```
<div id="companyDiv" style="float: left; position: relative"></div>
<div id="addressDiv" style="float: left; position: relative"></div>
<div id="notitleDiv" style="float: left; position: relative"></div>
    
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
</script>
```
