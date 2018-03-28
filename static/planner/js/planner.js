$(document).ready(function() {
    $('#active-vehicles').DataTable({
      "order": [0, 'desc'],
      "language": {
        "emptyTable": "No vehicles found"
      }
    });
    $('#inactive-vehicles').DataTable({
      "order": [0, 'desc'],
      "language": {
        "emptyTable": "No vehicles found"
      }
    });
    $('#flightplan-details').DataTable({
      "order": [2, 'desc'],
      "language": {
        "emptyTable": "No flight plans found"
      }
    });
    $('#invalid-flightplan').DataTable({
      "order": [2, 'desc'],
      "language": {
        "emptyTable": "No flight plans found"
      }
    });
    var plan_table = $("#plan-datatable").DataTable({
      "order": [4, 'desc'],
      "language": {
        "emptyTable": "No flight plans found"
      }
    });

    function strCapitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    $('#clear-welcome-filter').on('click', function (e) {
        $('#departuredtime').val('')
        $('#arrivaldtime').val('')
        $('#select_operator').val('')
        $('#welcome-filter').submit()
    })
    $("#welcome-filter").submit(function(e){
        e.preventDefault();

        var $arr_data = $("#arrivaldtime").val();
        var $dept_data = $("#departuredtime").val();
        var $operator_id = $("#select_operator").val();

        $.ajax({
            data: {
                'arr_date': $arr_data,
                'dept_date': $dept_data,
                'operator_id': $operator_id
            },
            url: "/planner/search-flights/",
            method: "POST",
            success: function(response){
                plan_table.clear();
                if(response.plans.length === 0) {
                  plan_table.draw();
                  return;
                }
                for(var i=0;i<response.plans.length;i++){
                  var r = plan_table.row.add([
                    response.plans[i].flight_id,
                    strCapitalize(response.plans[i].state),
                    response.plans[i].operator,
                    response.plans[i].vehicle,
                    {"display": response.plans[i].planned_departure_time, "@data-order": response.plans[i].planned_departure_time_sec},
                    {"display": response.plans[i].planned_arrival_time, "@data-order": response.plans[i].planned_arrival_time_sec},
                    "<a href='/planner/detail-flight-plan/"+response.plans[i].id+"' class='btn btn-xs btn-default'>Details</a>"
                  ])
                }
                plan_table.rows().invalidate().draw();

            },
            error: function(r){
              alert(r.message);
            },
        });
    });


});
