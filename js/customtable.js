/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CustomTable = function(listColumnType, listUrl, idObj){
    this.listColumnType = listColumnType;
    this.listUrl = listUrl;
    this.idObj = idObj;
    this.isStillEdit = false;
    
    this.listData = [];
    this.init();
};

CustomTable.prototype.init = function(){
    var html = this.getTemplateButtonInsert();
    html = html.replace(/{{id}}/g, this.idObj);
    $('#' + this.idObj).html(html);
    
    this.retrieveAll();
    var obj = this;
    $('#' + this.idObj + '-inputSearch').keyup(function(e){
        var input = $(this).val();
        obj.draw(input);       
    });
    $('#' + this.idObj + '-btnInsert').click(function(e){
        if(obj.isStillEdit){
            return;
        }
        else{
            obj.isStillEdit = true;
        }
        var tbodyElement = $('#' + obj.idObj + '-tbody');
        
        
        var html = '<tr id="' + obj.idObj + '-insertFields">';
        html += obj.getTemplateEditableRow();
        html += '</tr>';
        
        if(tbodyElement.is(':empty')){
            tbodyElement.html(html);
        }
        else{
            var rowElement = tbodyElement.children(":first");
            $(html).insertBefore(rowElement);
        }
       
        $('#activeCellSave').click(function(e){
            var newData = obj.getEditableData();
            
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
    $('#' + this.idObj).delegate('.btn-event-edit', 'click', function(e){
        if(obj.isStillEdit){
            return;
        }
        else{
            obj.isStillEdit = true;
        }
        var rowElement = $(this).parent().parent();
        var row = parseInt(rowElement.attr('data-row'));
        var oldHtml = rowElement.html();
        
        rowElement.html(obj.getTemplateEditableRow(obj.getListData()[row]));
        
        $('#activeCellSave').click(function(e){
            var newData = obj.getEditableData();
            var ajax = $.ajax({
                url: obj.listUrl.editUrl,
                method: 'POST',
                data: { data: JSON.stringify(newData) }
            });
            ajax.done(function(msg){
                msg = JSON.parse(msg);
                if(msg['code'] == 200){
                    obj.getListData()[row] = newData;
                    rowElement.html(obj.getTemplateContentRow(newData, row));
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
    $('#' + this.idObj).delegate('.btn-event-delete', 'click', function(e){
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
        if(isDraw){
            _thisObj.draw();
        }
    });
    ajax.fail(function( jqXHR, textStatus ) {
        alert("Request failed: " + textStatus );
    });
};

CustomTable.prototype.getEditableData = function(){
    if(!this.isStillEdit)
        return {};
    else{
        var newData = {};
        for(var _property in this.getListColumnType()){
            newData[_property] = $('#' + _property).val();
        }
        return newData;
    }
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
        html += '<br>';
        html += '<div class="row">';
        html += '<div id="{{id}}-divTable" class="col-sm-12">';
        html += '</div>';
    html += '</div>';
        
    return html;
};

CustomTable.prototype.getTemplateTable = function(){
    var html = '<table class="table table-bordered">';
            html += '{{thead}}';
        html += '{{tbody}}';
    html += '<table>';
    html += '{{totalShowRecords}} of total ' + this.getListData().length + ' records';
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
    html += this.getTemplateContentRow(value, key);
    html += '</tr>';
    return html;
};

CustomTable.prototype.getTemplateContentRow = function(value, key){
    var html = '';
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
    return html;
};

CustomTable.prototype.getTemplateEditableRow = function(values = {}){
    var html = '';
    for(var _property in this.getListColumnType()){
        var columnType = this.getListColumnType()[_property];
        var columnValue = '';
        if(values.hasOwnProperty(_property)){
            columnValue = values[_property];
        }

        html += '<td>';
            html += '<div class="form-group">';
                html += '<label for="">' + columnType + '</label>';
                html += '<input id="' + _property + '" type="' + (columnType == 'number' ? 'number' : 'text') + '" value="' + columnValue + '" class="form-control"/>';
            html += '</div>'
        html += '</td>';
    }
    html += '<td class="align-middle"><button id="activeCellSave" class="btn btn-outline-primary">save</button>&nbsp;';
    html +=     '<button id="activeCellCancel" class="btn btn-outline-warning">cancel</button></td>';
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
    
    tbody = tbody.replace(/{{rowBody}}/g, rowBody);
    table = table.replace(/{{thead}}/g, thead);
    table = table.replace(/{{tbody}}/g, tbody);
    table = table.replace(/{{totalShowRecords}}/g, totalShowRecords);
    
    table = table.replace(/{{id}}/g, this.idObj);
    
    $('#' + this.idObj + '-divTable').html(table);
};