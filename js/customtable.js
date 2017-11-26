/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CustomTable = function(listColumnType, obj){
    
    this.listColumnType = listColumnType;
    this.listData = [];
    this.idObj = obj.attr("id");
};

CustomTable.prototype.getListColumnType = function(){
    return this.listColumnType;
};

CustomTable.prototype.getListData = function(){
    return this.listData;
};

CustomTable.prototype.retrieveAll = function(isDraw = true){
    var _thisObj = this;
    
    var ajax = $.ajax({
        method: 'POST',
        url: 'api/retrieveall.php',
        data: {}
    });
    ajax.done(function(respone){
        _thisObj.listData = $.parseJSON(respone);
        if(isDraw)
            _thisObj.draw();
    });
    ajax.fail(function( jqXHR, textStatus ) {
        alert("Request failed: " + textStatus );
    });
};

CustomTable.prototype.draw = function(query = ""){
    var html = '';
    
    if(query == ""){
        html += '<div id="' + this.idObj + '-divSearch"><input type="text" id="' + this.idObj + '-inputSearch" value=""/><div>';
    }
    html += '<div id="' + this.idObj + '-divTable">';
    html += '<table>';
            html += '<thead>';
                html += '<tr>';
    
    for(var _property in this.getListColumnType()){
        html += '<td>' + _property + '(' + this.getListColumnType()[_property] + ')' + '</td>';
    }
                html += '</tr>';
            html += '</thead>';
            html += '<tbody>';
    this.getListData().forEach(function(value, key){
        var _isDrawRow = false;
        var _tempHtml = '';
        _tempHtml += '<tr>';
            for(var _propertyValue in value){
                if(typeof (value[_propertyValue]) != "object"){
                    _tempHtml += '<td>' + value[_propertyValue] + '</td>';
                }
                else{
                    _tempHtml += '<td></td>';
                }
                
                if(query == "")
                    _isDrawRow = true;
                else if(typeof (value[_propertyValue]) != "object"){
                    var _tempValue = value[_propertyValue].toString();
                    if(_tempValue.match( new RegExp(query, 'i') )){
                        _isDrawRow = true;
                    }
                }
            }
        _tempHtml += '</tr>';
        if(_isDrawRow){
            html += _tempHtml;
        }
    });
            html += '</tbody>'
        html += '<table>';
    html += '</div>';
    
    if(query == ""){
        $('#' + this.idObj).html(html);
        initEventCustomTable(this);
    }
    else{
        $('#' + this.idObj + '-divTable').html(html);
    }
};

/*Event custom table*/
function initEventCustomTable(obj){
    $('#' + obj.idObj + '-inputSearch').keyup(function(e){
        var _input = $(this).val();
        obj.draw(_input);       
    });
}
/*Event custom table*/