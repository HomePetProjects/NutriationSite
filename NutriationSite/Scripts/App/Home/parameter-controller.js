$(document).ready(function () {
    $('#addParameterBtn')
      .button()
      .click(function (e) {
          $('#dialog-add-parameter').dialog({
              resizable: false,
              modal: true,
              width: 340,
              buttons: {
                  Add: function () {
                      $('#dialog-add-parameter form').submit();
                      $(this).dialog('close');
                  },
                  Cancel: function () {
                      $(this).dialog('close');
                  }
              }
          });
      });

    $('.addParameterValueBtn')
      .button()
      .click(function (e) {
          var id = $(this).data('parameter-id');
          $('#dialog-add-value form input[name=ParameterId]').val(id);
          $('#dialog-add-value').dialog({
              resizable: false,
              modal: true,
              width: 340,
              buttons: {
                  Add: function () {
                      $('#dialog-add-value form').submit();
                      $(this).dialog('close');
                  },
                  Cancel: function () {
                      $(this).dialog('close');
                  }
              }
          });
      });

    $.getJSON("Home/GetProductChartData", drawCharts);
});

function drawCharts(data) {
    console.log(data, 'data in draw charts');
    $('#parameters > ul').append('<li>')
        .append('<div id="chart-container">')
        .append('<input class="addParameterValueBtn" type="button" value="Add value" data-parameter-id="@item.ParameterId" />');
}