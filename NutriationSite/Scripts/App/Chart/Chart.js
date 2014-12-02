window.PN.chart = {
    init: function () {
        google.load("visualization", "1", { packages: ["corechart"] });

        $(".viewDialog").on("click" ,this.addValueDialogBtn);
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
                console.log(input);
                console.log(textStatus);

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

    //Button open dialog for Add Value
    addValueDialogBtn: function (e) {
        var href = $(this).attr("href");
        e.preventDefault();
    $("<div></div>")
    .addClass("dialog")
    .appendTo("body")
    .dialog({
        title: "Add Value",
        close: function () { $(this).remove() },
        modal: true,
        resizable: false,
        width: "auto"
    })
        .load(href);
    },

    //Button open dialog for Add Parameter
    addParameterDialogBtn: function(e){
        e.preventDefault();

        
        $("<div></div>")
        .addClass("dialog")
        .appendTo("body")
        .dialog({
            title: "Add Parameter",
            close: function () { $(this).remove() },
            modal: true,
            resizable: false,
            width: "auto"
        })
        .load("Parameter/AddParameter");
    },

    //Button close dialog
    closeDialogBtn: function(e){
    e.preventDefault();
    $(this).closest(".dialog").dialog("close");
    }
}

$(document).ready(function () {
    window.PN.chart.init();
});

