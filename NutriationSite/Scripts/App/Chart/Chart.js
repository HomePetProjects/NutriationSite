//Document ready
$(document).ready(function () {
    window.PN.chart.init();
});

//Namespace class
window.PN.chart = {
    

    init: function () {
        google.load("visualization", "1", { packages: ["corechart"] });

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
        $.ajax({
            url: "/Parameter/DeleteChart",
            dataType: 'json',
            data: { 'id': id },
            success: function (data, textStatus) {
                location.reload();
            }
        })
    },

    //Draw charts function
    drawCharts: function(){
        $.ajax(
            {url: "/Parameter/GetCharts",
            dataType: 'json',
            success: function (input, textStatus) {
                for (var i = 0; i < input.length; i++)
                {
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'time');
                    data.addColumn('number', input[i].Parameter.Measure_Unit);

                    data.addColumn({ type: 'string', role: 'tooltip' });

                    for (var j = 0; j < input[i].ValueArr.length; j++)
                    {
                        var comNull;
                        if (input[i].ValueArr[j].Comment == null) comNull = '-';
                        else comNull = input[i].ValueArr[j].Comment;
                        var comm = 'Value: ' + input[i].ValueArr[j].Value + ' ' + input[i].Parameter.Measure_Unit + '\nTime: '
                            + input[i].ValueArr[j].DateTime + '\nComment: ' + comNull;
                        data.addRow([input[i].ValueArr[j].DateTime, input[i].ValueArr[j].Value, comm]);
                    }

                    new google.visualization.LineChart(document.getElementById('chart' + input[i].Parameter.Id)).draw(data, {});
                    $('#chart' + input[i].Parameter.Id).prepend('<input id="delete' + input[i].Parameter.Id + '" type="button" onclick="window.PN.chart.btnDelClick(' + input[i].Parameter.Id + ')" style="position: absolute; width:20px; height:20px; top:10px; right:10px; z-index:1; display: none"></input>')
                }
            }
        })
    },

    //Draw one chart
    drawChart: function (id) {
        $.ajax(
            {
                url: "/Parameter/GetChart?id=" + id,
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

                        new google.visualization.LineChart(document.getElementById('chart' + input.Parameter.Id)).draw(data, {});
                        $('#chart' + input.Parameter.Id).prepend('<input id="delete' + input.Parameter.Id + '" type="button" onclick="window.PN.chart.btnDelClick(' + input.Parameter.Id + ')" style="position: absolute; width:20px; height:20px; top:10px; right:10px; z-index:1; display: none"></input>')
                }
            })
    },

    ////Button open dialog for Add Value
    //addValueDialogBtn: function (e) {
    //    var id = $(this).attr("param-id");
    //    $('#add-value-dialog form input[name=Parameter_Id]').val(id);
    //    $("#add-value-dialog")
    //    .dialog({
    //        title: "Add Value",
    //        modal: true,
    //        resizable: false,
    //        width: "auto",
    //        buttons: {
    //            Add: function () {
    //                $('#add-value-dialog form').submit();
    //                $('#chart' + id).empty();
    //                $(this).dialog('close');
    //                return false;
    //            },
    //            Cancel: function () {
    //                $(this).dialog('close');
    //            }
    //        }
    //    })
    //    //this.drawChart(id);
    //},

    //Button open dialog for Add Value
    addValueDialogBtn: function (e) {
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
                    var msg = $('#value-form').serialize();
                    $.ajax({
                        type: 'POST',
                        url: '/Parameter/AddValue',
                        data: {
                            Parameter_Id: $('#Parameter_Id').attr('value'),
                            Value: $('#Value').attr('value'),
                            Comment: $('#Comment').attr('value')
                        },
                        success: function (data) {
                            $('#chart' + id).empty();
                            window.PN.chart.drawChart(id);
                        },
                        error: function (xhr, str) {
                            alert('Error: ' + xhr.responseCode);
                        }
                    });

                    $(this).dialog('close');
                    return false;
                },
                Cancel: function () {
                    $(this).dialog('close');
                }
            }
        })
        
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
                    $('#add-parameter-dialog form').submit();
                    $(this).dialog('close');
                },
                Cancel: function () {
                    $(this).dialog('close');
                }
            }
        })
    }
}



