$.ajaxSetup({ cache: false });

function inputSetError(input, button, msg) {
  input.val('')
  setButtonState(button, $('#' + input.data('disable-id')), 'reset', 'info')
  $('#' + input.data('error-id')).text(msg).show()
}

function inputClearError(input, button) {
  $('#' + input.data('error-id')).hide()
}

function setButtonState(button, disable_btn, id, cls) {
  button.html(button.data(id + '-text'))
  button.removeClass('btn-info')
  button.removeClass('btn-link')
  button.removeClass('btn-warning')
  button.removeClass('btn-danger')
  button.addClass('btn-' + cls)
  if (id == 'reset' || id == 'done') {
    button.prop('disabled', false)
    disable_btn.prop('disabled', false)
  } else {
    button.prop('disabled', true)
    disable_btn.prop('disabled', true)
  }
}

$('.open_upload').click(function(e) {
  var btn = $(e.target).closest('.btn')
  var target = $('#' + btn.data('target'))
  inputClearError(target, btn)
  if (btn.hasClass('btn-info')) {
    $('#' + $(e.target).data('target')).trigger('click')
  }
  else {
    setButtonState(btn, $('#' + target.data('disable-id')), 'reset', 'info')
    $('#' + target.data('filename-id')).val('')
    $('#' + target.data('result-id')).val('')
  }
});

$(document).on("change", ".id_file", function(e){
  e.preventDefault()
  var input = $(e.target)
  var button = $('#' + input.data('button'))
  var disable_id = $('#' + input.data('disable-id'))
  var ext = $(e.target).val().split('.').pop().toLowerCase()
  var upload_url_endpoint = input.data("upload-url-endpoint")
  var upload_done_endpoint = input.data("upload-done-endpoint")
  var file = input.prop('files')[0]
  setButtonState(button, disable_id, 'loading', 'warning')
  $.ajax(upload_url_endpoint, {
      data: {
          filename: file.name,
          size: file.size,
          type: input.data('type'),
          id: input.data('id')
      },
      error: function(res, errorText, o) {
        inputSetError(input, button, res.responseJSON.error)
      },
      success: function(res) {
          var timestamp = res.timestamp
          fetch(res.upload_url, {
              method: "PUT",
              body: file,
              mode: "cors",
              credentials: "include"
          }).then(function(res) {
              $.ajax(upload_done_endpoint, {
                  data: {
                    filename: file.name,
                    type: input.data('type'),
                    id: input.data('id'),
                    timestamp: timestamp
                  },
                  success: function(res) {
                    setButtonState(button, disable_id, 'processing', 'warning')
                    function checkState() {
                      $.ajax({
                          url: res.url,
                          dataType: 'json',
                          success: function (data) {
                            if (data.state == 'p') {
                              button.prop('disabled', false)
                              $('#' + input.data('filename-id')).val(input.val().split('\\').pop())
                              $('#' + input.data('result-id')).val(res.wm_id)
                              if (input.data('type') == 'telemetry') {
                                location.reload()
                              }
                              else if (input.data('type') == 'waypoints') {
                                setButtonState(button, disable_id, 'done', 'default')
                              }
                            } else if (data.state == 'e') {
                              inputSetError(input, button, data.error)
                            } else {
                              setTimeout(checkState, 1000);
                            }
                          }
                      });
                    }
                    setTimeout(checkState, 1000);
                  },
                  error: function() {
                    inputSetError(input, button, "Upload failed, please try again")
                  }
              })
          }).catch(function(err) {
            inputSetError(input, button, err)
          })
      }
  })
})
