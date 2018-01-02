geForm = CotView.extend({
  initialize: function initialize() {
  },
  render: function (container) {
    container.append(this.el);
    this._form = new CotForm(this.formDefinition());
    this._form.render({ target: this.el });
    this._form.setModel(this.model);
    return this;
  },
  formDefinition: function () {
    return {
      //  "id": this.id + '_cot_form',
      "id": this.id,
      "title": this.title,
      rootPath: '/resources/graffiti_exemption_public/',
      success: function success() {
        var payload = geModel.toJSON();

        var dataCreated = new Date();
        payload.recCreated = dataCreated;
        payload.lsteStatus = config.status.DraftApp;

        // Gets all the info for uploads to payroll
        payload.doc_uploads = processUploads(docDropzone, repo, false);
        payload.image_uploads = processUploads(imageDropzone, repo, false);

        let uploads = (payload.image_uploads).concat(payload.doc_uploads);
        let keepQueryString = checkFileUploads(uploads);

        $.ajax({
          "url": config.httpHost.app_public[httpHost] + config.api_public.post + repo +'?'+keepQueryString,
          "type": 'POST',
          "data": JSON.stringify(payload),
          "headers": {
            'Content-Type': 'application/json; charset=utf-8;',
            'Cache-Control': 'no-cache'
          },
          "datatype": 'json',
          "success": function (data) {
            if ((data.EventMessageResponse.Response.StatusCode) == 200) {
              scroll(0, 0);
              $(app_container_id).html(config.messages.submit.done);
              if (mailSend) {
                emailNotice(data.EventMessageResponse.Event.EventID, 'notify');
              }
            }
          },
          "error": function () {
            $('#successFailArea').html(config.messages.submit.fail);
            bootbox.alert(config.messages.submit.fail);
          }
        }).done(function () {
        });

      },
      "useBinding": true,
      "sections": getSubmissionSections()
    }
  }
});
function getSubmissionSections() {
  let section = [
    {
      id: "contactSec",
      title: config["Contact Details Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            {
              id: "eFirstName", "bindTo": "eFirstName", title: config["First Name"], className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  message: config["eFirstNameValidation"],
                  callback: function (value, validator, $field) {
                    return ((value == "") ? false : true);
                  }
                }
              }
            },
            {
              id: "eLastName", "bindTo": "eLastName", title: config["Last Name"], className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  message: config["eLastNameValidation"],
                  callback: function (value, validator, $field) {
                    return ((value == "") ? false : true);
                  }
                }
              }
            }
          ]
        },
        {
          fields: [
            {
              id: "eAddress", "bindTo": "eAddress", title: config["Address"], className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  message: config["eAddressValidation"],
                  callback: function (value, validator, $field) {
                    return ((value == "") ? false : true);
                  }
                }
              }
            },
            { id: "eCity", "bindTo": "eCity", title: config["City"], value: "Toronto", className: "col-xs-12 col-md-6" }
          ]
        },
        {
          fields: [
            {
              id: "ePostalCode", "bindTo": "ePostalCode", title: config["Postal Code"], validationtype: "PostalCode", className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  message: "",
                  callback: function (value, validator, $field) {
                    if (value.toLowerCase().startsWith("m") || value.toLowerCase().startsWith("l") || value == "") {
                      return true;
                    }
                    else {
                      return false;
                    }
                  }
                }
              }
            },
            {
              id: "ePrimaryPhone", "bindTo": "ePrimaryPhone", title: config["Phone"], validationtype: "Phone", className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  message: config["ePrimaryPhoneValidation"],
                  callback: function (value, validator, $field) {
                    return ((value == "") ? false : true);
                  }
                }
              }
            }
          ]
        }, {
          fields: [
            { id: "eFax", "bindTo": "eFax", title: config["Fax"], validationtype: "Phone", className: "col-xs-12 col-md-6" },
            { id: "eEmail", "bindTo": "eEmail", title: config["Email"], validationtype: "Email", validators: { regexp: { regexp: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, message: 'This field must be a valid email. (###@###.####)' } }, className: "col-xs-12 col-md-6" }
          ]
        }
      ]
    },
    {
      id: "graffitiSec",
      title: config["Graffiti Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            { id: "emSameAddress", title: "", type: "html", html: `<div className="col-xs-12 col-md-12"><button class="btn btn-info" id="setbtn"><span class="" aria-hidden="true"></span> ` + config["Same As Above"] + `</button></div>` }
          ]
        },
        {
          fields: [
            {
              id: "emAddress", "bindTo": "emAddress", title: config["Address"], className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  message: config["emAddressValidation"],
                  callback: function (value, validator, $field) {
                    return ((value == "") ? false : true);
                  }
                }
              }
            },
            { id: "emCity", "bindTo": "emCity", title: config["City"], value: "Toronto", className: "col-xs-12 col-md-6" }
          ]
        },
        {
          fields: [
            {
              id: "emPostalCode", "bindTo": "emPostalCode", title: config["Postal Code"], validationtype: "PostalCode", className: "col-xs-12 col-md-6",
              validators: {
                callback: {
                  message: "",
                  callback: function (value, validator, $field) {
                    if (value.toLowerCase().startsWith("m") || value.toLowerCase().startsWith("l") || value == "") {
                      return true;
                    }
                    else {
                      return false;
                    }
                  }
                }
              }
            },

            { id: "emPrimaryPhone", "bindTo": "emPrimaryPhone", title: config["Phone"], validationtype: "Phone", className: "col-xs-12 col-md-6" }
          ]
        }, {
          fields: [
            { id: "emFacingStreet", "bindTo": "emFacingStreet", title: config["Facing Street"], className: "col-xs-12 col-md-6", required: true },
            { id: "emDescriptiveLocation", "bindTo": "emDescriptiveLocation", "posthelptext": config["DescriptiveLocationText"], title: config["graffitiDesLocation"], className: "col-xs-12 col-md-6", "required": true }
          ]
        }
      ]
    },
    {
      id: "detailsSec",
      title: config["Details Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            {
              id: "eNotice", "bindTo": "eNotice", title: config["notice"], type: "radio", className: "col-xs-12 col-md-6", "choices": config.choices.yesNoFull, "orientation": "horizontal",
              validators: {
                callback: {
                  message: config["noticeValidation"],
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="eNotice"]:checked').val();
                    return ((checkVal == undefined) ? false : true);
                  }
                }
              }
            }, {
              id: "ComplianceDate", "bindTo": "ComplianceDate", title: config["compliance"], type: "datetimepicker", "placeholder": config.dateFormat, className: "col-xs-12 col-md-6", "options": { format: config.dateFormat },
              validators: {
                callback: {
                  message: config["complianceValidation"],
                  // this is added to formValidation
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="eNotice"]:checked').val();
                    return ((checkVal !== "Yes") ? true : (value !== ''));
                  }
                }
              }
            }
          ]
        },
        {
          fields: [
            {
              id: "ePermission", "bindTo": "ePermission", title: config["permission"], type: "radio", className: "col-xs-12 col-md-6", "choices": config.choices.yesNoFull, "orientation": "horizontal",
              validators: {
                callback: {
                  message: config["permissionValidation"],
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="ePermission"]:checked').val();
                    return ((checkVal == undefined) ? false : true);
                  }
                }
              }
            }]
        },

        {
          fields: [
            {
              id: "eMaintenance", "bindTo": "eMaintenance", title: config["maintenance"], type: "radio", className: "col-xs-12 col-md-6", "choices": config.choices.yesNoFull, "orientation": "horizontal",
              validators: {
                callback: {
                  message: config["maintenanceValidation"],
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="eMaintenance"]:checked').val();
                    return ((checkVal == undefined) ? false : true);
                  }
                }
              }
            },
            {
              id: "eMaintenanceAgreement", "bindTo": "eMaintenanceAgreement", title: config["agreementDetails"], type: "textarea", className: "col-xs-12 col-md-12",
              validators: {
                callback: {
                  message: config["agreementDetailsValidation"],
                  callback: function (value, validator, $field) {
                    var checkVal = $('input[name="eMaintenance"]:checked').val();
                    return ((checkVal !== "Yes") ? true : (value !== ''));
                  }
                }
              }
            },
            {
              id: "eArtistInfo", "bindTo": "eArtistInfo", title: config["artistDetails"], type: "textarea", className: "col-xs-12 col-md-12",
              validators: {
                callback: {
                  message: config["artistDetailsValidation"],
                  callback: function (value, validator, $field) {
                    return ((value == "") ? false : true);
                  }
                }
              }
            },
            {
              id: "eArtSurfaceEnhance", "bindTo": "eArtSurfaceEnhance", title: config["enhance"], type: "textarea", className: "col-xs-12 col-md-12",
              validators: {
                callback: {
                  message: config["enhanceValidation"],
                  callback: function (value, validator, $field) {
                    return ((value == "") ? false : true);
                  }
                }
              }
            },
            {
              id: "eArtLocalCharacter", "bindTo": "eArtLocalCharacter", title: config["adhere"], type: "textarea", className: "col-xs-12 col-md-12",
              validators: {
                callback: {
                  message: config["adhereValidation"],
                  callback: function (value, validator, $field) {
                    return ((value == "") ? false : true);
                  }
                }
              }
            },
            { id: "eAdditionalComments", "bindTo": "eAdditionalComments", title: config["comments"], type: "textarea", className: "col-xs-12 col-md-12" },
          ]
        }]
    },
    {
      id: "attSec",
      title: config["Attachments Section"],
      className: "panel-info",
      rows: [
        {
          fields: [
            { id: "AttachmentText", title: "", type: "html", html: config["AttachmentText"], className: "col-xs-12 col-md-12" },
            {
              id: "Images", "prehelptext": config["ImagesText"], title: config["Images"], type: "html", "aria-label": "Dropzone File Upload Control Field for Images",
              html: '<section aria-label="File Upload Control Field for Images" id="image_attachments"><div class="dropzone" id="image_dropzone" aria-label="Dropzone File Upload Control for Images Section"></div></section><input name="txtPicName" type="hidden" id="txtPicName" value="" /><section id="image_uploads"></section>', className: "col-xs-12 col-md-12"
            },
            {
              id: "Documents", "prehelptext": config["DocumentsText"], title: config["Documents"], type: "html", "aria-label": "Dropzone File Upload Control Field for Documents",
              html: '<section aria-label="File Upload Control Field for Documents" id="doc_attachments"><div class="dropzone" id="document_dropzone" aria-label="Dropzone File Upload Control for Document Section"></div></section><section id="doc_uploads"></section>', className: "col-xs-12 col-md-12"
            },
            { id: "DeclarationText", title: "", type: "html", html: config["DeclarationText"], className: "col-xs-12 col-md-12" },
            { id: "submitHelp", title: "", type: "html", html: config["SubmitText"], className: "col-xs-12 col-md-12" },
            {
              id: "actionBar",
              type: "html",
              html: `<div className="col-xs-12 col-md-12"><button class="btn btn-success" id="savebtn"><span class="glyphicon glyphicon-send" aria-hidden="true"></span> ` + config.button.submitReport + `</button>
                 <button class="btn btn-success" id="printbtn"><span class="glyphicon glyphicon-print" aria-hidden="true"></span>Print</button></div>`
            },
            { id: "successFailRow", type: "html", className: "col-xs-12 col-md-12", html: `<div id="successFailArea" className="col-xs-12 col-md-12"></div>` },
            { id: "fid", type: "html", html: "<input type=\"text\" id=\"fid\" aria-label=\"Document ID\" aria-hidden=\"true\" name=\"fid\">", class: "hidden" },
            { id: "action", type: "html", html: "<input type=\"text\" id=\"action\" aria-label=\"Action\" aria-hidden=\"true\" name=\"action\">", class: "hidden" },
            { id: "createdBy", type: "html", html: "<input type=\"text\" id=\"createdBy\" aria-label=\"Complaint Created By\" aria-hidden=\"true\" name=\"createdBy\">", class: "hidden" },
            { id: "recCreated", type: "html", html: "<input type=\"text\" id=\"recCreated\" aria-label=\"Record Creation Date\" aria-hidden=\"true\" name=\"recCreated\">", class: "hidden" },
            { id: "AddressGeoID", type: "html", html: "<input type=\"hidden\" aria-label=\"Address Geo ID\" aria-hidden=\"true\" id=\"AddressGeoID\" name=\"AddressGeoID\">", class: "hidden" },
            { id: "AddressLongitude", type: "html", html: "<input type=\"hidden\" aria-label=\"Address Longitude\" aria-hidden=\"true\" id=\"AddressLongitude\" name=\"AddressLongitude\">", class: "hidden" },
            { id: "AddressLatitude", type: "html", html: "<input type=\"hidden\" aria-label=\"Address Latitude\" aria-hidden=\"true\" id=\"AddressLatitude\" name=\"AddressLatitude\">", class: "hidden" },
            { id: "MapAddress", type: "html", html: "<input type=\"hidden\" aria-label=\"Map Address\" aria-hidden=\"true\" id=\"MapAddress\" name=\"MapAddress\">", class: "hidden" },
            { id: "ShowMap", type: "html", html: "<input type=\"hidden\" aria-label=\"Show Map\" aria-hidden=\"true\" id=\"ShowMap\" name=\"ShowMap\">", class: "hidden" },
            { id: "lsteStatus", type: "html", html: "<input type=\"hidden\" aria-label=\"Status\" aria-hidden=\"true\" value=\"New\" id=\"lsteStatus\" name=\"lsteStatus\">", class: "hidden" }

          ]
        }
      ]
    }
  ]
  return section;
}
function processUploads(DZ, repo, sync) {
  let uploadFiles = DZ.existingUploads ? DZ.existingUploads : new Array;
  let _files = DZ.getFilesWithStatus(Dropzone.SUCCESS);
  let syncFiles = sync;
  if (_files.length == 0) {
    //empty
  } else {
    $.each(_files, function (i, row) {
      let json = JSON.parse(row.xhr.response);
      json.name = row.name;
      json.type = row.type;
      json.size = row.size;
      json.bin_id = json.BIN_ID[0];
      delete json.BIN_ID;
      uploadFiles.push(json);
      syncFiles ? '' : '';
    });
  }
  return uploadFiles;
}
function checkFileUploads(uploads) {
  let queryString = "";
  let binLoc = "";

  if (uploads.length > 0) {
    $.each(uploads, function (index, item) {
      if (binLoc == "") {
        binLoc = item.bin_id;
      } else {
        binLoc = binLoc + "," + item.bin_id;
      }
    })
  }

  if (binLoc != "") { queryString = "keepFiles=" + binLoc };

  return queryString;
}
function emailNotice(fid, action) {
  let emailTo = {};
  let emailCaptain = config.captain_emails[httpHost];
  let emailAdmin = config.admin_emails[httpHost];
  (typeof emailCaptain !== 'undefined' && emailCaptain != "") ? $.extend(emailTo, emailCaptain) : "";
  (typeof emailAdmin !== 'undefined' && emailAdmin != "") ? $.extend(emailTo, emailAdmin) : "";

  var emailRecipients = $.map(emailTo, function (email) {
    return email;
  }).filter(function (itm, i, a) {
    return i === a.indexOf(itm);
  }).join(',');

  var payload = JSON.stringify({
    'emailTo': emailRecipients,
    'emailFrom': (config.messages.notify.emailFrom ? config.messages.notify.emailFrom : 'wmDev@toronto.ca'),
    'id': fid,
    'status': action,
    'body': (config.messages.notify.emailBody ? config.messages.notify.emailBody : 'New submission has been received.'),
    'emailSubject': (config.messages.notify.emailSubject ? config.messages.notify.emailSubject : 'New submission')
  });

  $.ajax({
    url: config.httpHost.app_public[httpHost] + config.api_public.email,
    "type": 'POST',
    data: payload,
    headers: {
      'Content-Type': 'application/json; charset=utf-8;',
      'Cache-Control': 'no-cache'
    },
    "datatype": 'json'
  }).done(function (data, textStatus, jqXHR) {
  }).fail(function (jqXHR, textStatus, error) {
    console.log("POST Request Failed: " + textStatus + ", " + error);
  });
}