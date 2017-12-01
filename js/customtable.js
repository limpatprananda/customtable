/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CustomTable = function(listColumnType, listUrl, obj){
    this.listColumnType = listColumnType;
    this.listData = [];
    this.listUrl = listUrl;
    
    this.idObj = obj.attr("id");
    this.countDrawing = 0;
    this.isStillEdit = false;
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
        url: _thisObj.listUrl.retrieveUrl,
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
    var idObj = this.idObj;
    var totalDrawData = 0;
    
    if(this.countDrawing == 0){
        html += '<div class="row">';
            html += '<div class="col-sm-8">';
                html += '<div><button id="' + this.idObj + '-btnInsert" class="btn btn-outline-primary">Insert new</button></div>';
            html += '</div>';
            html += '<div class="col-sm-4">';
                html += '<div id="' + this.idObj + '-divSearch"><input type="text" id="' + this.idObj + '-inputSearch" class="form-control" value="" placeholder="Search..."/></div>';
            html += '</div>';
        html += '</div>';
        
    }
    html += '<br>';
    html += '<div class="row">';
    html += '<div id="' + this.idObj + '-divTable" class="col-sm-12">';
    html += '<table class="table table-bordered">';
            html += '<thead>';
                html += '<tr>';
    
    for(var _property in this.getListColumnType()){
        html += '<th>' + _property + '</th>';
    }
                    html += '<th>action</th>';
                html += '</tr>';
            html += '</thead>';
            html += '<tbody id="' + this.idObj + '-tbody">';
    this.getListData().forEach(function(value, key){
        var _isDrawRow = false;
        var _tempHtml = '';
        _tempHtml += '<tr id="' + idObj + '-row-' + key + '" data-row="' + key + '">';
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
            _tempHtml += '<td><button class="btn-event-edit btn btn-outline-success">edit</button>&nbsp;';
            _tempHtml +=      '<button class="btn-event-delete btn btn-outline-danger">delete</button></td>';
        _tempHtml += '</tr>';
        if(_isDrawRow){
            html += _tempHtml;
            totalDrawData++;
        }
    });
            html += '</tbody>'
        html += '<table>';
        html += totalDrawData + ' of total ' + this.getListData().length + ' records';
    html += '</div>';
    html += '</div>';
    
    if(this.countDrawing == 0){
        $('#' + this.idObj).html(html);
        initEventCustom(this);
    }
    else{
        $('#' + this.idObj + '-divTable').html(html);
    }
    this.countDrawing++;
};

/*Event search table*/
function initEventCustom(obj){
    $('#' + obj.idObj + '-inputSearch').keyup(function(e){
        var _input = $(this).val();
        obj.draw(_input);       
    });
    $('#' + obj.idObj).delegate('.btn-event-edit', 'click', function(e){
        if(obj.isStillEdit){
            return;
        }
        else{
            obj.isStillEdit = true;
        }
        var rowElement = $(this).parent().parent();
        var row = parseInt(rowElement.attr('data-row'));
        var oldHtml = rowElement.html();
        var cellElement = rowElement.children(":first");
        
        var html = '';
        for(var _property in obj.getListColumnType()){
            var columnType = obj.getListColumnType()[_property];
            var columnValue = cellElement.html();
            
            html += '<td>';
                html += '<div class="form-group">';
                    html += '<label for="">' + columnType + '</label>';
                    html += '<input id="' + _property + '" type="text" value="' + columnValue + '" class="form-control"/>';
                html += '</div>'
            html += '</td>';
            
            cellElement = cellElement.next();
        }
        html += '<td class="align-middle"><button id="activeCellSave" class="btn btn-outline-primary">save</button>&nbsp;';
        html +=     '<button id="activeCellCancel" class="btn btn-outline-warning">cancel</button></td>';
        rowElement.html(html);
        
        $('#activeCellSave').click(function(e){
            var newData = {};
            for(var _property in obj.getListColumnType()){
                newData[_property] = $('#' + _property).val();
            }
            
            var ajax = $.ajax({
                url: obj.listUrl.editUrl,
                method: 'POST',
                data: { data: JSON.stringify(newData) }
            });
            ajax.done(function(msg){
                msg = JSON.parse(msg);
                if(msg['code'] == 200){
                    obj.getListData()[row] = newData;
                    var html = '';
                    for(var _property in obj.getListColumnType()){
                        html += '<td>' + $('#' + _property).val() + '</td>';
                    }
                    html += '<td><button class="btn-event-edit btn btn-outline-success">edit</button>&nbsp;';
                    html +=      '<button class="btn-event-delete btn btn-outline-danger">delete</button></td>';
                    rowElement.html(html);
                    obj.isStillEdit = false;
                }
                else{
                    alert("Request failed: " + msg['message'] );
                }
            });
            ajax.fail(function( jqXHR, textStatus ) {
                alert("Request failed: " + textStatus );
            });
        });
        
        $('#activeCellCancel').click(function(e){
            rowElement.html(oldHtml);
            obj.isStillEdit = false;
        });
    });
    $('#' + obj.idObj).delegate('.btn-event-delete', 'click', function(e){
        var conf = confirm("Are you sure want to delete?");
        if(conf == true){
            var rowElement = $(this).parent().parent();
            var row = parseInt(rowElement.attr('data-row'));
            
            var ajax = $.ajax({
                url: obj.listUrl.deleteUrl,
                method: 'POST',
                data: { data: JSON.stringify(obj.getListData()[row]) }
            });
            ajax.done(function(msg){
                msg = JSON.parse(msg);
                if(msg['code'] == 200){
                    obj.getListData().splice(row, 1);
                    obj.draw();
                }
                else{
                    alert("Request failed: " + msg['message'] );
                }
            });
            ajax.fail(function( jqXHR, textStatus ) {
                alert("Request failed: " + textStatus );
            });
        }
    });
    $('#' + obj.idObj + '-btnInsert').click(function(e){
        if(obj.isStillEdit){
            return;
        }
        else{
            obj.isStillEdit = true;
        }
        var tbodyElement = $('#' + obj.idObj + '-tbody');
        
        
        var html = '<tr id="' + obj.idObj + '-insertFields">';
        for(var _property in obj.getListColumnType()){
            var columnType = obj.getListColumnType()[_property];
            
            html += '<td>';
                html += '<div class="form-group">';
                    html += '<label for="">' + columnType + '</label>';
                    html += '<input id="' + _property + '" type="text" value="" class="form-control"/>';
                html += '</div>'
            html += '</td>';
            
            
        }
        html += '<td class="align-middle"><button id="activeCellSave" class="btn btn-outline-primary">save</button>&nbsp;';
        html +=     '<button id="activeCellCancel" class="btn btn-outline-warning">cancel</button></td>';
        
        if(tbodyElement.is(':empty')){
            tbodyElement.html(html);
        }
        else{
            var rowElement = tbodyElement.children(":first");
            $(html).insertBefore(rowElement);
        }
       
        $('#activeCellSave').click(function(e){
            var newData = {};
            for(var _property in obj.getListColumnType()){
                newData[_property] = $('#' + _property).val();
            }
            
            var ajax = $.ajax({
                url: obj.listUrl.insertUrl,
                method: 'POST',
                data: { data: JSON.stringify(newData) }
            });
            ajax.done(function(msg){
                msg = JSON.parse(msg);
                if(msg['code'] == 200){
                    obj.isStillEdit = false;
                    obj.retrieveAll();
                }
                else{
                    alert("Request failed: " + msg['message'] );
                }
            });
            ajax.fail(function( jqXHR, textStatus ) {
                alert("Request failed: " + textStatus );
            });
        });
        
        $('#activeCellCancel').click(function(e){
            $('#' + obj.idObj + '-insertFields').remove();
            obj.isStillEdit = false;
        });
    });
}
/*Event search table*/