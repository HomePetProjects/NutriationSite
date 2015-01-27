//Document ready
//$(document).on('load', )

$(document).ready(function () {
    window.PN.chart.init();
    window.PN.journal.init();
    window.PN.AddProductDialog.init();
});

//Namespace class
window.PN.chart = {
    

    init: function () {
        google.load("visualization", "1", { packages: ["corechart"] });

        $('#edit-value-dialog #DateTime').datetimepicker({ format: 'd.m.Y H:i' });

        $(".viewDialog").on("click" , this.addValueDialogBtn);
        $(".close").on("click", this.closeDialogBtn);
        $("#add-parameter-btn").on("click", this.addParameterDialogBtn);
        this.drawCharts();
    },

    //Show delete buttun function
    btnDelShow: function (id) {
        $('#delete' + id).show();
    },

    //Hide delete buttun function
    btnDelHide: function (id) {
        $('#delete' + id).hide()
    },

    //Delete chart function
    btnDelClick: function (id) {
        var realy = confirm('Are you sure?')
        if (realy){
            $.ajax({
                url: "/Home/DeleteChart",
                dataType: 'json',
                data: { 'id': id },
                success: function (data, textStatus) {
                    location.reload();
                }
            })
        }
    },

    //Draw charts function
    drawCharts: function () {
        $.ajax({
            url: "/Home/GetCharts",
            dataType: 'json',
            success: function (input, textStatus) {

                var chart = new Array();


                for (var i = 0; i < input.length; i++) {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'time');
                    data.addColumn('number', input[i].Parameter.Measure_Unit);

                    data.addColumn({ type: 'string', role: 'tooltip' });

                    //fill data
                    for (var j = 0; j < input[i].ValueArr.length; j++) {
                        var comNull;
                        if (input[i].ValueArr[j].Comment == null) comNull = '-';
                        else comNull = input[i].ValueArr[j].Comment;
                        var comm = 'Value: ' + input[i].ValueArr[j].Value + ' ' + input[i].Parameter.Measure_Unit + '\nTime: '
                            + input[i].ValueArr[j].DateTime + '\nComment: ' + comNull;
                        data.addRow([input[i].ValueArr[j].DateTime, input[i].ValueArr[j].Value, comm]);
                    }

                    //create chart
                    chart[i] = new google.visualization.LineChart(document.getElementById('chart' + input[i].Parameter.Id));
                    
                    //add listener
                    google.visualization.events.addListener(chart[i], 'select', (function (x) {
                        return function () {
                            window.PN.chart.editValueDialogHandler(chart[x], input[x].Parameter.Id);
                        }
                    })(i));

                    chart[i].draw(data, {});

                    //add delete button
                    $('#chart' + input[i].Parameter.Id).prepend('<input id="delete' + input[i].Parameter.Id + '" type="button" onclick="window.PN.chart.btnDelClick(' + input[i].Parameter.Id +
                        ')" style="position: absolute; width:20px; height:20px; top:10px; right:10px; z-index:1; display: none; padding: 0px;" value="x"></input>');
                }
            }
        })
    },

    //Draw one chart
    drawChart: function (id) {
        $.ajax(
            {
                url: "/Home/GetChart?id=" + id,
                dataType: 'json',
                success: function (input, textStatus) {
                        var data = new google.visualization.DataTable();
                        data.addColumn('string', 'time');
                        data.addColumn('number', input.Parameter.Measure_Unit);

                        data.addColumn({ type: 'string', role: 'tooltip' });

                        for (var j = 0; j < input.ValueArr.length; j++) {
                            var comNull;
                            if (input.ValueArr[j].Comment == null) comNull = '-';
                            else comNull = input.ValueArr[j].Comment;
                            var comm = 'Value: ' + input.ValueArr[j].Value + ' ' + input.Parameter.Measure_Unit + '\nTime: '
                                + input.ValueArr[j].DateTime + '\nComment: ' + comNull;
                            data.addRow([input.ValueArr[j].DateTime, input.ValueArr[j].Value, comm]);
                        }

                        var chart = new google.visualization.LineChart(document.getElementById('chart' + input.Parameter.Id))

                        //add listener
                        google.visualization.events.addListener(chart, 'select', (function () {
                            return function () {
                                window.PN.chart.editValueDialogHandler(chart, input.Parameter.Id);
                            }
                        })());

                        chart.draw(data, { tooltip: { trigger: 'selection' } });

                        $('#chart' + input.Parameter.Id).prepend('<input id="delete' + input.Parameter.Id + '" type="button" onclick="window.PN.chart.btnDelClick(' + input.Parameter.Id + ')" style="position: absolute; width:20px; height:20px; top:10px; right:10px; z-index:1; display: none; padding: 0px;" value="x"></input>')
                }
            })
    },

    editValueDialogHandler: function (myChart, parameterId) {
        var selection = myChart.getSelection();
        if (selection.length) {
            var bar_index = selection[0].row;
        }

        $.ajax({
            type: 'POST',
            url: '/Home/GetChart',
            dataType: 'json',
            data: { id: parameterId },
            success: function (input) {

                $('#edit-value-dialog #Value').attr('value', input.ValueArr[bar_index].Value)
                $("#edit-value-dialog #DateTime").attr('value', input.ValueArr[bar_index].DateTime)
                $('#edit-value-dialog #Comment').attr('value', input.ValueArr[bar_index].Comment)
                $('#edit-value-dialog').dialog({
                    title: "Edit Value",
                    modal: true,
                    resizable: false,
                    width: "auto",
                    buttons: {
                        Edit: function () {
                            window.PN.chart.editBtnClick(this, input.ValueArr[bar_index].Id, parameterId)
                        },
                        Delete: function () {
                            window.PN.chart.deleteBtnClick(this, input.ValueArr[bar_index].Id, parameterId)
                        },
                        Cancel: function () {
                            window.PN.chart.closeBtnClick(this)
                        }
                    }
                });
            },
            error: function (xhr, str) {
                alert('Error: ' + xhr.responseCode);
            }
        });
    },

    //Buttons for EditValue Dialog
    editBtnClick: function (chart, valueId, parameterId) {
        var value = $('#edit-value-dialog #Value').attr('value');
        var date = $("#edit-value-dialog #DateTime").attr('value');
        var comment = $('#edit-value-dialog #Comment').attr('value');

        window.PN.chart.hideValidationString();

        var temp = value.indexOf(',');
        if (temp != '-1') {
            var temp = value.split(',');
            value = temp[0] + '.' + temp[1];
        }

        if (value.length == 0) {
            $('#edit-value-dialog #value-empty-validation-message').css('display', 'block');
        }
        else if (isNaN(parseFloat(value))) {
            $('#edit-value-dialog #value-isnumber-validation-message').css('display', 'block');
        }
        if (date.length == 0) {
            $('#edit-value-dialog #date-empty-validation-message').css('display', 'block');
        }

        else {
            $.ajax({
                type: 'POST',
                url: '/Home/EditValue',
                dataType: 'json',
                data: {
                    Id: valueId,
                    Value: value,
                    Date: date,
                    Comment: comment
                },
                success: function (data) {
                    window.PN.chart.drawChart(parameterId);
                    $(chart).dialog('close');
                }
            });
        }
    },

    deleteBtnClick: function (chart, valueId, parameterId) {
        $.ajax({
            type: 'POST',
            url: '/Home/DeleteValue',
            dataType: 'json',
            data: { id: valueId },
            success: function (data) {
                window.PN.chart.drawChart(parameterId);
                $(chart).dialog('close');
            }
        });
    },

    closeBtnClick: function (chart) {
        window.PN.chart.hideValidationString();
        $(chart).dialog('close');
    },

    hideValidationString: function (){
        $('.validation-message').css('display', 'none');
    },

    //Button open dialog for Add Value
    addValueDialogBtn: function (e) {
        window.PN.chart.hideValidationString();

        $('#add-value-dialog #Parameter_Id').attr('value', '');
        $('#add-value-dialog #Value').attr('value', '');
        $('#add-value-dialog #Comment').attr('value', '');

        var id = $(this).attr("param-id");
        $('#add-value-dialog form input[name=Parameter_Id]').val(id);
        $("#add-value-dialog")
        .dialog({
            title: "Add Value",
            modal: true,
            resizable: false,
            width: "auto",
            buttons: {
                Add: function () {
                    window.PN.chart.addDialogOkBtnClick(id);
                },
                Cancel: function () {
                    $(this).dialog('close');
                }
            }
        })


        $('#add-value-dialog').keypress(function (e) {
            if (e.keyCode == $.ui.keyCode.ENTER) {
                event.preventDefault();
                window.PN.chart.addDialogOkBtnClick(id);
            }
        });
    },

    addDialogOkBtnClick : function (id) {
        var value = $('#add-value-dialog #Value').attr('value');
        var temp = value.indexOf(',');
        if (temp != '-1') {
            var temp = value.split(',');
            value = temp[0] + '.' + temp[1];
        }

        window.PN.chart.hideValidationString();

        if (value.length == 0) {
            $('#add-value-dialog #value-empty-validation-message').css('display', 'block');
        }

        else if (isNaN(parseFloat(value))) {
            $('#add-value-dialog #value-isnumber-validation-message').css('display', 'block');
        }
        else {
            $.ajax({
                type: 'POST',
                url: '/Home/AddValue',
                data: {
                    Parameter_Id: $('#add-value-dialog #Parameter_Id').attr('value'),
                    Value: value,
                    Comment: $('#add-value-dialog #Comment').attr('value')
                },
                success: function (data) {
                    window.PN.chart.drawChart(id);
                },
                error: function (xhr, str) {
                    alert('Error: ' + xhr.responseCode);
                }
            });

            $('#add-value-dialog #Parameter_Id').attr('value', '');
            $('#add-value-dialog #Value').attr('value', '');
            $('#add-value-dialog #Comment').attr('value', '');
            $(this).dialog('close');
            return false;
        }
    },

    //Button open dialog for Add Parameter
    addParameterDialogBtn: function (e) {
        e.preventDefault();
        $("#add-parameter-dialog")
        .dialog({
            title: "Add Parameter",
            modal: true,
            resizable: false,
            width: "auto",
            buttons: {
                Add: function () {
                    var name = $('#Name').attr('value');
                    if (name.length == 0) {
                        $('#name-validation-message').css('display', 'block');
                    }
                    else {
                        $('#add-parameter-dialog form').submit();
                        $(this).dialog('close');
                    }
                },
                Cancel: function () {
                    $(this).dialog('close');
                }
            }
        })
    },


}
