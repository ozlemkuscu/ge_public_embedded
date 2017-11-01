/*
 The main javascript file for graffiti_exemption_public.
 IMPORTANT:
 Any resources from this project should be referenced with the relatively to the domain! (ex: /resources/app_name/img/image.png)
 This is because this app's files will exist on an S3 bucket resources/streetart_public
 BUT the app could be loaded on any page in the WCM.
 */

let config = void 0,
  geModel = void 0,
  docDropzone = void 0,
  imageDropzone = void 0,
  thisForm = void 0;

let repo = "graffiti_exemption";
const form_id = "graffiti_exemption";
const app_container_id = ".graffiti_exemption_public_container";
let httpHost, mailSend;
let fid = null;

$(function () {
  httpHost = '/* @echo ENV*/';
  let cotApp = new CotApp();

  //@if ENV='local'
  cotApp.appContentKeySuffix = '';
  //@endif

  cotApp.loadAppContent({
    keys: ['graffiti_exemption_config'],
    onComplete: function (data) {
      let key = "graffiti_exemption_config";
      //@if ENV='local'
      config = JSON.parse(data[key]);
      //@endif
      //@if ENV!='local'
      config = data[key];
      //@endif

      thisForm.render($(app_container_id));
      initForm();
    }
  });

  //Using CotModel, which extends Backbone.Model, to manage data models
  geModel = new CotModel({
    "eFirstName": "",
    "eLastName": "",
    "eAddress": "",
    "eCity": "",
    "ePostalCode": "",
    "ePrimaryPhone": "",
    "eFax": "",
    "eEmail": "",
    "emAddress": "",
    "emCity": "",
    "emPostalCode": "",
    "emPrimaryPhone": "",
    "emFacingStreet": "",
    "emDescriptiveLocation": "",
    "ePermission": "",
    "eNotice": "",
    "ComplianceDate": "",
    "eMaintenance": "",
    "eMaintenanceAgreement": "",
    "eArtistInfo": "",
    "eArtSurfaceEnhance": "",
    "eArtLocalCharacter": "",
    "eAdditionalComments": "",
    "document_dropzone": [],
    "image_dropzone": []
  });

  //Using CotForm to create forms. Form class is an example that
  //uses a custom subclass of CotView, which extends Backbone.view, to manage a CotForm instance

  thisForm = new geForm({
    id: form_id,
    title: 'Graffiti Exemption Form', //config["Form Title"],
    model: geModel
  });

  function initForm() {
    repo = config.default_repo ? config.default_repo : repo;
    mailSend = config.messages.notify.sendNotification ? config.messages.notify.sendNotification : false;

    docDropzone = new Dropzone("div#document_dropzone", $.extend(config.admin.docDropzonePublic, {
      "dz_id": "document_dropzone", "fid": fid, "form_id": form_id,
      "url": config.httpHost.app_public[httpHost] + config.api_public.upload + config.default_repo + '/' + repo,
    }));

    imageDropzone = new Dropzone("div#image_dropzone", $.extend(config.admin.imageDropzonePublic, {
      "dz_id": "image_dropzone", "fid": "", "form_id": form_id,
      "url": config.httpHost.app_public[httpHost] + config.api_public.upload + config.default_repo + '/' + repo,
      "init": function () {
        // Adding extra validation to imageDropzone field by using txtPicName field, min 1 file needs to be uploaded
        let attFieldname = "txtPicName";
        this
          .on("addedfile", function (file) { validateUpload("addedfile", attFieldname, file.name); })
          .on("success", function (file) { validateUpload("success", attFieldname, file.name); })
          .on("removedfile", function (file) { validateUpload("removedfile", attFieldname, file.name); })
        //  .on("error", function () { validateUpload("error", attFieldname, ""); });
      }
    }));

    $("#eCity").val("Toronto");
    $("#emCity").val("Toronto");

        // prepares dz fields for AODA
    $(".dz-hidden-input").attr("aria-hidden", "true");
    $(".dz-hidden-input").attr("aria-label", "File Upload Control");

    $("#printbtn").click(function () { window.print(); });
    $("#setbtn").click(function () { setAddressSame(); });

    $('input[name="eNotice"]').on('change',
      function () {
        var checkVal = $('input[name="eNotice"]:checked').val();
        (checkVal == "Yes") ? $("#ComplianceDateElement .optional").first().text("") : $("#ComplianceDateElement .optional").first().text("(optional)");
        $('#' + form_id).formValidation('revalidateField', $('#ComplianceDate'));
      });
    $('input[name="eMaintenance"]').on('change',
      function () {
        var checkVal = $('input[name="eMaintenance"]:checked').val();
        (checkVal == "Yes") ? $("#eMaintenanceAgreementElement .optional").first().text("") : $("#eMaintenanceAgreementElement .optional").first().text("(optional)");
        $('#' + form_id).formValidation('revalidateField', $('#eMaintenanceAgreement'));
      });

    // removes the word (optional) added by the main core functionality from required keywords
    // current core code doesn't recognize the validators, put (optional) word to the label 
    // if the required keyword is not set to true
    // manual fix for "optional" parameter on label for related fields
    $("#ePermissionElement .optional").first().text("");
    $("#eNoticeElement .optional").first().text("");
    $("#eMaintenanceElement .optional").first().text("");
    $("#eArtistInfoElement .optional").first().text("");
    $("#eArtSurfaceEnhanceElement .optional").first().text("");
    $("#eArtLocalCharacterElement .optional").first().text("");

    $('#' + form_id).data('formValidation').addField('txtPicName', { excluded: false, validators: { notEmpty: { message: config["imageValidation"] } } })
  }

  function setAddressSame() {
    $("#emAddress").val($("#eAddress").val()).trigger('change');
    $("#emCity").val($("#eCity").val()).trigger('change');
    $("#emPostalCode").val($("#ePostalCode").val()).trigger('change');
    $("#emPrimaryPhone").val($("#ePrimaryPhone").val()).trigger('change');
    $('#' + form_id).formValidation('revalidateField', $('#emAddress'));
  }

  function setGeoParams() {
    // Sets the GEO parameters based on the address/city/postal code value
    let queryStr = "?searchString=" + encodeURIComponent($("#emAddress").val() + " " + $("#emCity").val() + " " + $("#emPostalCode").val());
    $.ajax({
      url: config.geoURL + queryStr + config.geoParam,
      type: "GET",
      cache: "true",
      dataType: "json",
      async: false,
      success: function (data) {
        let resultLoc = data.result.bestResult;
        if (resultLoc.length > 0) {
          $("#AddressGeoID").val(resultLoc[0]["geoId"]);
          $("#AddressLongitude").val(resultLoc[0]["longitude"]);
          $("#AddressLatitude").val(resultLoc[0]["latitude"]);
        } else {
          $("#AddressGeoID").val("");
          $("#AddressLongitude").val("");
          $("#AddressLatitude").val("");
        }
      },
      error: function () {
        $("#AddressGeoID").val("");
        $("#AddressLongitude").val("");
        $("#AddressLatitude").val("");
      }
    })
  }

  function validateUpload(event, field, value) {
    //placeholder for additional logic based on the event
    let fieldVal = $('#' + field).val();
    switch (event) {
      case "addedfile":
        // add the file name to the field value
        fieldVal = fieldVal + value;
        break;
      case "success":
        break;
      case "removedfile":
        // remove only the first matching file name from the field value
        // incase the same file is added more than once
        fieldVal = fieldVal.replace(value, '');
        break;
      case "error":
        //  $('#' + form_id).data('formValidation').updateMessage(field, 'notEmpty', config.uploadServerErrorMessage);
        break;
      default:
    }

    $('#' + field).val(fieldVal);
    $('#' + form_id).data('formValidation').revalidateField(field);
  }
});