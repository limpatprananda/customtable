/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CustomTable = function(listColumnType, listUrl, idObj){
    this.listColumnType = listColumnType;
    this.listUrl = listUrl;
    this.idObj = idObj;
    
    this.countDrawing = 0;
    this.isStillEdit = false;
    
    this.listData = [];
};

CustomTable.prototype.getListColumnType = function(){
    return this.listColumnType;
};

CustomTable.prototype.getListData = function(query = ""){
    if(query == ""){
        return this.listData;
    }
    else{
        var _listData = this.listData.filter(function(value){
            for(var _propertyValue in value){
                if(typeof (value[_propertyValue]) != "object"){
                    var _tempValue = value[_propertyValue].toString();
                    if(_tempValue.match( new RegExp(query, 'i') )){
                        return true;
                    }
                }
            }
        });
        return _listData;
    }
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

CustomTable.prototype.getTemplateButtonInsert = function(){
    var html = '<div class="row">';
            html += '<div class="col-sm-8">';
                html += '<div><button id="{{id}}-btnInsert" class="btn btn-outline-primary">Insert new</button></div>';
            html += '</div>';
            html += '<div class="col-sm-4">';
                html += '<div id="{{id}}-divSearch"><input type="text" id="{{id}}-inputSearch" class="form-control" value="" placeholder="Search..."/></div>';
            html += '</div>';
        html += '</div>';
        
    return html;
};

CustomTable.prototype.getTemplateTable = function(){
    var html = '<div class="row">';
        html += '<div id="{{id}}-divTable" class="col-sm-12">';
        html += '<table class="table table-bordered">';
            html += '{{thead}}';
            html += '{{tbody}}';
        html += '<table>';
        html += '{{totalShowRecords}} of total ' + this.getListData().length + ' records';
        html += '</div>';
    html += '</div>';
    return html;
};

CustomTable.prototype.getTemplateTableThead = function(){
    var html = '<thead>';
       html += '<tr>';
        for(var _property in this.getListColumnType()){
            html += '<th>' + _property + '</th>';
        }
            html += '<th>action</th>';
        html += '</tr>';
    html += '</thead>';
    return html;
};

CustomTable.prototype.getTemplateTableTbody = function(){
    var html = '<tbody id="{{id}}-tbody">{{rowBody}}</tbody>';
    return html;
};

CustomTable.prototype.getTemplateRowBody = function(value, key){
    var html = '';
    html += '<tr id="{{id}}-row-' + key + '" data-row="' + key + '">';
        for(var _propertyValue in value){
            if(typeof (value[_propertyValue]) != "object"){
                html += '<td>' + value[_propertyValue] + '</td>';
            }
            else{
                html += '<td></td>';
            }
        }
        html += '<td><button class="btn-event-edit btn btn-outline-success">edit</button>&nbsp;';
        html +=      '<button class="btn-event-delete btn btn-outline-danger">delete</button></td>';
    html += '</tr>';
    return html;
};

CustomTable.prototype.draw = function(query = ""){
    var totalShowRecords = 0;
    var _object = this;
    
    var rowBody = '';
    this.getListData(query).forEach(function(value, key){
        rowBody += _object.getTemplateRowBody(value, key);
        totalShowRecords++;
    });
    
    var table = this.getTemplateTable();
    var thead = this.getTemplateTableThead();
    var tbody = this.getTemplateTableTbody();
    var buttonAdd = '';
    
    if(this.countDrawing == 0){
         buttonAdd = this.getTemplateButtonInsert();
    }
    tbody = tbody.replace(/{{rowBody}}/g, rowBody);
    table = table.replace(/{{thead}}/g, thead);
    table = table.replace(/{{tbody}}/g, tbody);
    table = table.replace(/{{totalShowRecords}}/g, totalShowRecords);
    
    var html = buttonAdd + table;
    html = html.replace(/{{id}}/g, this.idObj);
    
    if(this.countDrawing == 0){
        $('#' + this.idObj).html(html);
        initDefaultEvent(this);
    }
    else{
        $('#' + this.idObj + '-divTable').html(html);
    }
    this.countDrawing++;
};

/*Event search table*/
function initDefaultEvent(obj){
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