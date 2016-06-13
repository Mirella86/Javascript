var FileInput = function (fileName, fileInput, filePath) {
    var self = this;

    self.fileName = fileName != undefined ? ko.observable(fileName) : ko.observable();
    self.fileInput = fileInput != undefined ? ko.observable(fileInput) : ko.observable();

    self.filePath = filePath != undefined ? ko.observable(filePath) : ko.observable();

};


var SelectOption = function (display, val) {
    this.optionName = ko.observable(display);
    this.optionId = ko.observable(val);
};

var FolderAccess = function (path, hasModificationRights, index) {
    var self = this;
    self.path = ko.observable(path);
    self.modificationAccessRadio = hasModificationRights != undefined ? ko.observable(hasModificationRights) : ko.observable('read');
    self.IsLectureOnly = ko.computed(function () {
        return self.modificationAccessRadio() === 'read';
    });

    self.idRead = "folderread" + +(index === undefined ? 1 : index);
    self.idModification = "foldermodification" + (index === undefined ? 1 : index);
};


var ApplicationsCitrix = function (selectedApplication, selectedApplicationVisioDis) {
    var self = this;
    self.applications = ko.observableArray();
    self.selectedApplication = ko.observable();
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('application_citrix')/items",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        xhrFields: { withCredentials: true },
        success: function (data) {
            var listItems = data.d.results;

            $.each(listItems, function (index, value) {
                var option = new SelectOption(value.Title, value.ID);
                self.applications.push(option);
            });

            if (selectedApplication != undefined)
                self.selectedApplication(selectedApplication);

        },
        error: function (data) {
            console.log(data);
        }
    });

    self.IsVisioDisSelected = ko.computed(function () {
        //application Visio DIS id = 4 - IMPORTANT
        return self.selectedApplication() === 4; //;
    });

    //visio dis area
    self.applicationsVisio = ko.observableArray();
    self.selectedApplicationVisioDis = ko.observable().extend({
        required: {
            message: '*',
            onlyIf: function () {
                return self.IsVisioDisSelected() === true;
            }
        }
    });

    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('application_citrix_visio')/items",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        xhrFields: { withCredentials: true },
        success: function (data) {
            var listItems = data.d.results;
            listItems.forEach(function (entry) {
                var option = new SelectOption(entry.Title, entry.ID);
                self.applicationsVisio.push(option);
            });
            if (selectedApplication != undefined)
                self.selectedApplicationVisioDis(selectedApplicationVisioDis);

        },
        error: function (data) {
            console.log(data);
        }
    });

};


var DocumentationCitrix = function (selectedDocumentation, hasModificationRights, index) {
    var self = this;
    self.documentations = ko.observableArray();
    self.selectedDocumentation = ko.observable();
    self.modificationAccessRadio = ko.observable('read');
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('Applications Citrix Documentation')/items",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        xhrFields: { withCredentials: true },
        success: function (data) {
            // Returning the results
            var listItems = data.d.results;
            listItems.forEach(function (entry) {
                var option = new SelectOption(entry.Title, entry.ID);
                self.documentations.push(option);
            });
            if (hasModificationRights != undefined)
                self.modificationAccessRadio(hasModificationRights);

            if (selectedDocumentation != undefined)
                self.selectedDocumentation(selectedDocumentation);
        },
        error: function (data) {
            console.log(data);
        }
    });

    self.IsLectureOnly = ko.computed(function () {
        return self.modificationAccessRadio() === 'read';
    });

    self.idRead = "documentationread" + +(index === undefined ? 1 : index);
    self.idModification = "documentationmodification" + +(index === undefined ? 1 : index);
};

var Printer = function (printer) {
    this.printer = printer != undefined ? ko.observable(printer) : ko.observable();
};

var OtherApplication = function (application) {
    this.otherApplication = application != undefined ? ko.observable(application) : ko.observable();
};

var ViewModel = function (data) {
    var self = this;

    //type of request area
    self.requestRadio = data != undefined ? ko.observable(data.mode_creation_motif) : ko.observable('creationAccount');

    self.IsNewAccountRequest = ko.computed(function () {
        return self.requestRadio() === 'creationAccount';
    });

    self.IsModificationAccountRequest = ko.computed(function () {
        return self.requestRadio() === 'modificationAccount';
    });

    self.IsCreationMailRequest = ko.computed(function () {
        return self.requestRadio() === 'creationEmail';
    });

    //identification area
    self.name = data != undefined ? ko.observable(data.nom_utilisateur).extend({ required: { message: '*'} }) : ko.observable().extend({ required: { message: '*'} });
    self.surname = data != undefined ? ko.observable(data.prenom_utilisateur).extend({ required: { message: '*'} }) : ko.observable().extend({ required: { message: '*'} });

    self.localisationRadio = data != undefined ?
        (data.localisation === "agence" ? ko.observable('agence') : ko.observable('siege'))
        : ko.observable('agence');

    self.IsLocalisationAgence = ko.computed(function () {
        return self.localisationRadio() === 'agence';
    });
    self.IsLocalisationSiege = ko.computed(function () {
        return self.localisationRadio() === 'siege';
    });
    //agences from Africa area
    self.agenceFromAfrica = ko.observable(false);
    self.IsAgenceFromAfrica = ko.computed(function () {
        return self.agenceFromAfrica() === true;
    });
    self.genericSessionAfrica = data != undefined ? ko.observable(data.generic_session_africa) : ko.observable();
    self.refreshAfricaAgences = function () {
        $.ajax({
            url: siteUrl + "/_api/web/lists/getbytitle('agences')/items(" + self.selectedAgence() + ")",
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            xhrFields: { withCredentials: true },
            success: function (response) {
                if (response.d.num_ag.indexOf('AGAF') > -1)
                    self.agenceFromAfrica(true);
                else
                    self.agenceFromAfrica(false);
            },
            error: function (response) {
                console.log(response);
            }
        });
    };

    //agences
    self.agences = ko.observableArray().extend({ required: "*" });
    self.selectedAgence = ko.observable().extend({
        required: {
            message: '*',
            onlyIf: function () {
                return self.IsLocalisationAgence() === true;
            }
        }
    });

    self.selectedAgence.subscribe(self.refreshAfricaAgences);

    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('agences')/items",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        xhrFields: { withCredentials: true },
        success: function (response) {
            // Returning the results
            var listItems = response.d.results;
            listItems.forEach(function (entry) {
                var display = entry.Title + '(' + entry.num_ag + ')';
                var option = new SelectOption(display, entry.ID);
                self.agences.push(option);
            });
            if (data != undefined) {
                self.selectedAgence(data.agenceId);
            }

        },
        error: function (response) {
            console.log(response);
        }
    });

    //sieges
    self.sieges = ko.observableArray();
    self.selectedSiege = ko.observable().extend({
        required: {
            message: '*',
            onlyIf: function () {
                return self.IsLocalisationSiege() === true;
            }
        }
    });

    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('services')/items",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        xhrFields: { withCredentials: true },
        success: function (response) {
            // Returning the results
            var listItems = response.d.results;
            listItems.forEach(function (entry) {
                var option = new SelectOption(entry.Title, entry.ID);
                self.sieges.push(option);
            });

            if (data != undefined) {
                self.selectedSiege(data.siegeId);
            }
        },
        error: function (response) {
            console.log("Error: " + response);
        }
    });

    //userTypeProfil

    self.userTypeProfil = ko.observableArray();
    self.selectedUserTypeProfil = ko.observable().extend({ required: { message: '*'} });
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('user_type_profil')/items",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        xhrFields: { withCredentials: true },
        success: function (response) {
            var listItems = response.d.results;
            listItems.forEach(function (entry) {
                var option = new SelectOption(entry.Title, entry.ID);
                self.userTypeProfil.push(option);
            });

            if (data != undefined) {
                self.selectedUserTypeProfil(data.user_type_profilId);
            }
        },
        error: function (response) {
            console.log("Error: " + response);
        }
    });

    //Autre (Precisez) = 10
    self.IsOtherUserProfileSelected = ko.computed(function () {
        return self.selectedUserTypeProfil() === 10;
    });
    self.otherUserProfile = data != undefined ? ko.observable(data.other_user_profile) : ko.observable();

    //fonctions
    self.fonctions = ko.observableArray();
    self.selectedFonction = ko.observable().extend({ required: { message: '*'} });
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('fonctions')/items",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        xhrFields: { withCredentials: true },
        success: function (response) {
            var listItems = response.d.results;
            listItems.forEach(function (entry) {
                var option = new SelectOption(entry.Title, entry.ID);
                self.fonctions.push(option);
            });

            if (data != undefined) {
                self.selectedFonction(data.fonctionId);
            }
        },
        error: function (response) {
            console.log(response);
        }
    });

    self.emailRadio = data != undefined ?
        (data.has_email ? ko.observable('Oui') : ko.observable('Non'))
        : ko.observable('Non');
    self.IsEmailRadioSelected = ko.computed(function () {
        return self.emailRadio() === 'Oui';
    });

    //email type area
    self.typeEmailRadio = data != undefined ?
        (data.email_type = 'nominative' ? ko.observable('nominative') : ko.observable('generique'))
        : ko.observable('generique');
    self.IsGenericEmailSelected = ko.computed(function () {
        return self.typeEmailRadio() === 'generique';
    });

    //email domain area
    self.emailDomains = ko.observableArray();
    self.selectedDomain = ko.observable();
    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('domaines_messagerie')/items",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        xhrFields: { withCredentials: true },
        success: function (response) {
            var listItems = response.d.results;

            $.each(listItems, function (index, value) {
                var option = new SelectOption(value.Title, value.ID);
                self.emailDomains.push(option);
            });

            if (data != undefined) {
                self.selectedDomain = ko.observable(data.email_domain);
            }
        },
        error: function (response) {
            console.log(response);
        }
    });

    self.emailAdress = data != undefined ? ko.observable(data.email_address) : ko.observable();

    //validation area
    self.responsableTelephone = data != undefined ? ko.observable(data.responsable_telephone).extend({ required: { message: '*'} }) : ko.observable().extend({ required: { message: '*'} });

    //contract type area
    self.contractTypeRadio = data != undefined ? ko.observable(data.contract_type) : ko.observable('CDI');

    self.IsNotCDISelected = ko.computed(function () {
        return self.contractTypeRadio() != 'CDI';
    });

    self.arrivalDate = data != undefined ? ko.observable(GetDate(data.arrival_date)) : ko.observable();
    self.contractEndDate = data != undefined ? ko.observable(GetDate(data.contract_end_date)).extend({
        required: {
            message: '*',
            onlyIf: function () {
                return self.IsNotCDISelected() === true;
            }
        }
    }) : ko.observable().extend({
        required: {
            message: '*',
            onlyIf: function () {
                return self.IsNotCDISelected() === true;
            }
        }
    });

    //statut area
    self.statusRadio = data != undefined ? ko.observable(data.status_employee) : ko.observable('CADRE');

    //internet  access area
    self.internetAccesRadio = data != undefined ? ko.observable(data.internet_access) : ko.observable('standard');

    //folder access area
    self.ExtractFoldersFromData = function (data) {
        var foldersList = JSON.parse(data.folders);
        var folders = [];
        $.each(foldersList, function (index, value) {
            folders.push(new FolderAccess(value.path, value.hasModificationRights, index));
        });
        return folders;
    };
    self.folders = data != undefined ? ko.observableArray(self.ExtractFoldersFromData(data)) : ko.observableArray([new FolderAccess()]);

    self.addFolder = function () {
        var index = self.folders().length;
        self.folders.push(new FolderAccess("", "read", index + 1));
    };

    self.removeFolder = function (folder) {
        self.folders.remove(folder);
    };

    //logiciels area
    self.ExtractApplicationsCitrixFromData = function (response) {
        var appList = JSON.parse(response.applicationsCitrix);
        var applications = [];
        $.each(appList, function (index, value) {
            applications.push(new ApplicationsCitrix(value.applicationCitrix, value.applicationVisioDis));
        });
        return applications;
    };
    self.applicationsCitrix = data != undefined ? ko.observableArray(self.ExtractApplicationsCitrixFromData(data)) : ko.observableArray([new ApplicationsCitrix()]);

    self.addApplication = function () {
        self.applicationsCitrix.push(new ApplicationsCitrix());
    };
    self.removeApplicationCitrix = function (app) {
        self.applicationsCitrix.remove(app);
    };

    self.ExtractDocumentationCitrixFromData = function (response) {
        var docList = JSON.parse(response.documentationCitrix);
        var documentations = [];
        $.each(docList, function (index, value) {
            documentations.push(new DocumentationCitrix(value.selectedDocumentation, value.hasModificationRight, index));
        });
        return documentations;
    };
    self.documentationCitrix = data != undefined ? ko.observableArray(self.ExtractDocumentationCitrixFromData(data)) : ko.observableArray([new DocumentationCitrix()]);

    self.addDocumentation = function () {
        var index = self.documentationCitrix().length;
        self.documentationCitrix.push(new DocumentationCitrix("", "read", index + 1));
    };

    self.removeDocumentationCitrix = function (doc) {
        self.documentationCitrix.remove(doc);
    };

    self.ExtractOtherApplicationsFromData = function (response) {
        var otherAppList = JSON.parse(response.otherApplications);
        var otherApps = [];
        $.each(otherAppList, function (index, value) {
            otherApps.push(new OtherApplication(value.otherApplication));
        });
        return otherApps;
    };
    self.otherApplications = data != undefined ? ko.observableArray(self.ExtractOtherApplicationsFromData(data)) : ko.observableArray([new OtherApplication()]);

    self.addOtherApplication = function () {
        self.otherApplications.push(new OtherApplication());
    };
    self.removeOtherApplication = function (app) {
        self.otherApplications.remove(app);
    };


    //printers area
    self.ExtractPrintersFromData = function (response) {
        var printersList = JSON.parse(response.printers);
        var printers = [];
        $.each(printersList, function (index, value) {
            printers.push(new Printer(value.printer));
        });
        return printers;
    };
    self.printers = data != undefined ? ko.observableArray(self.ExtractPrintersFromData(data)) : ko.observableArray([new Printer()]);

    self.addPrinter = function () {
        self.printers.push(new Printer());
    };
    self.removePrinter = function (printer) {
        self.printers.remove(printer);
    };

    //to be used for fileUpload area
    self.IsListItemCreated = ko.computed(function () {
        if (data != undefined)
            return true;

        return false;
    });

    self.files = ko.observableArray();

    if (data != undefined && data.Attachments === true) {
        $.ajax({
            url: siteUrl + "/_api/web/lists/getbytitle('Demandes de connexions')/items(" + demandeId + ")/AttachmentFiles",
            headers: { "Accept": "application/json; odata=verbose" },
            xhrFields: { withCredentials: true },
            method: "GET",
            success: function (response) {
                var fileList = response.d.results;
                var files = [];
                $.each(fileList, function (index, value) {
                    var fileUrl = siteUrl + "/Lists/demandes_de_connexions/Attachments/" + data.ID + "/" + value.FileName;
                    files.push(new FileInput(value.FileName, "", fileUrl));
                });
                self.files(files);
            },
            error: function (error) {
                console.log(error);
            }
        });
    }

    self.removeFileFromServer = function (file) {

        $.ajax({
            url: siteUrl + "/_api/lists/getByTitle('Demandes de connexions')/getItemById(" + data.ID + ")/AttachmentFiles/getByFileName('" + file.fileName() + "')",
            method: 'POST',
            contentType: 'application/json;odata=verbose',
            headers: {
                'X-RequestDigest': $('#__REQUESTDIGEST').val(),
                'X-HTTP-Method': 'DELETE',
                'Accept': 'application/json;odata=verbose'
            },
            success: function (status) {
                self.files.remove(file);
            },
            error: function (err) {
                console.log(err);
            }
        });

    };

    self.removeFileFromClient = function (file) {
        self.files.remove(file);
    };


    self.removeFile = function () {
        self.files.remove(this);
    };

    self.addFile = function (input) {

        var file = input.files[0];
        if (file) {
            // create reader
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                var fileInput = e.target.result;

                //if we already have the item upload and display links from server
                if (self.IsListItemCreated()) {
                    var n = fileInput.indexOf(";base64,") + 8;
                    fileInput = fileInput.substring(n);

                    $().SPServices({
                        operation: "AddAttachment",
                        listName: "Demandes de connexions",
                        asynch: false,
                        listItemID: data.ID,
                        fileName: file.name,
                        attachment: fileInput,
                        completefunc: function (xData, status) {
                            console.log('attachment upload complete', xData, status);
                            var fileUrl = siteUrl + "/Lists/demandes_de_connexions/Attachments/" + data.ID + "/" + file.name;
                            self.files.push(new FileInput(file.name, e.target.result, fileUrl));
                            input.value = '';
                        }
                    });

                }
                //item not created, files not uploaded, display simple text
                else {
                    self.files.push(new FileInput(file.name, e.target.result, undefined));
                    input.value = '';
                }
            };
        }

    };

    //comments area
    self.comments = data != undefined ? ko.observable(data.comments) : ko.observable();

    //buttons area

    //sendRequest event handler
    self.SendRequest = function (button) {
        var status = button.id;

        var validatedVM = ko.validatedObservable(self);
        console.log(validatedVM.isValid());
        //validate the page first, then submit
        if (!validatedVM.isValid()) {
            validatedVM.errors.showAllMessages();
            return;
        }
        var shortModel = self.ToShortViewModel(status);
        GetUserInfoAndSendRequest(shortModel);

    };

    self.errors = ko.validation.group(self);

    self.ToShortViewModel = function (status) {
        var shortViewModel = new ShortViewModel(self, status);
        return shortViewModel;
    };

    self.IsNotSent = ko.computed(function () {
        return data === undefined;
    });

    self.IsInAttendance = ko.computed(function () {
        if (data != undefined) {
            return data.statut === 'approve'; //'En attente de traitement';
        }
        return false;
    });

    self.IsWaitingForApprobation = ko.computed(function () {
        if (data != undefined)
            return data.statut === 'send'; //'En cours d\'approbation';
        return false;
    });

};

var ShortViewModel = function (model, status) {
    var self = this;
    self.statut = status;

    self.name = model.name();
    self.surname = model.surname();

    self.creationReason = model.requestRadio();
    self.localisation = model.localisationRadio();
    self.selectedAgence = model.selectedAgence();
    self.selectedSiege = model.selectedSiege();
    self.selectedFonction = model.selectedFonction();
    self.userTypeProfil = model.selectedUserTypeProfil();
    self.otherUserProfile = model.otherUserProfile();
    self.hasEmail = model.emailRadio() === 'Oui' ? true : false;
    self.typeEmail = model.typeEmailRadio();
    self.selectedDomain = model.selectedDomain();
    self.emailAddress = model.emailAdress();
    self.genericSessionAfrica = model.genericSessionAfrica();
    self.responsableTelephone = model.responsableTelephone();
    self.contractType = model.contractTypeRadio();
    self.status = model.statusRadio();
    self.arrivalDate = model.arrivalDate();
    self.contractEndDate = model.contractEndDate();

    self.internetAcces = model.internetAccesRadio();

    self.folders = [];
    $.each(model.folders(), function (index, value) {
        self.folders.push({
            path: value.path(),
            hasModificationRights: value.modificationAccessRadio(),
            index: index
        });
    });

    self.applicationsCitrix = [];
    $.each(model.applicationsCitrix(), function (index, value) {
        self.applicationsCitrix.push({ applicationCitrix: value.selectedApplication(), applicationVisioDis: value.selectedApplicationVisioDis() });
    });

    self.documentationCitrix = [];
    $.each(model.documentationCitrix(), function (index, value) {
        self.documentationCitrix.push({
            selectedDocumentation: value.selectedDocumentation(),
            hasModificationRight: value.modificationAccessRadio(),
            index: index
        });
    });

    self.otherApplications = [];
    $.each(model.otherApplications(), function (index, value) {
        self.otherApplications.push({ otherApplication: value.otherApplication });
    });

    self.printers = [];
    $.each(model.printers(), function (index, value) {
        self.printers.push({ printer: value.printer });
    });

    self.files = [];
    $.each(model.files(), function (index, value) {
        self.files.push({ fileName: value.fileName(), fileInput: value.fileInput(), filePath: value.filePath() });
    });

    self.comments = model.comments();
};

function GetDate(date) {
    var unparsedDate = new Date(date);
    var parsedDate = new Date(unparsedDate.getFullYear(), unparsedDate.getMonth(), unparsedDate.getDate());

    return parsedDate.toLocaleDateString();
}

function Bind(viewModel) {
    if (viewModel === undefined)
        viewModel = new ViewModel();

    ko.applyBindings(viewModel);
    ConfigValidation();
}

function ConfigValidation() {

    ko.validation.init({
        //   insertValidationMessage: true,
        registerExtenders: true,
        decorateInputElement: true,
        errorMessageClass: 'error'
    });

}

$(function () {
    // siteUrl = 'https://int-intranet.ortec.fr/service/dsi';
    siteUrl = _spPageContextInfo.webAbsoluteUrl;

    demandeId = location.search.split('identifier=')[1];
    if (demandeId != undefined) {
        $.ajax({
            url: siteUrl + "/_api/web/lists/getbytitle('Demandes de connexions')/items(" + demandeId + ")",
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            xhrFields: { withCredentials: true },
            success: function (data) {
                Bind(new ViewModel(data.d));
                InitializePeoplePicker(data.d.responsableId);
            },
            error: function (data) {
                console.log(data);
            }
        });
    }
    else {
        Bind();
        InitializePeoplePicker();
    }


    $("#arrivalDate").datepicker({
        changeMonth: true,
        changeYear: true
    });
    $("#contractEndDate").datepicker({
        changeMonth: true,
        changeYear: true
    });

});


function InitializePeoplePicker(userId) {

    var schema = {};
    schema['PrincipalAccountType'] = 'User,DL,SecGroup,SPGroup';
    schema['SearchPrincipalSource'] = 15;
    schema['ResolvePrincipalSource'] = 15;
    schema['AllowMultipleValues'] = true;
    schema['MaximumEntitySuggestions'] = 50;
    schema['Width'] = '280px';
    schema['AllowMultipleValues'] = false;

    this.SPClientPeoplePicker_InitStandaloneControlWrapper("peoplePickerDiv", null, schema);

    if (userId != undefined) {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + userId + ")",
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            xhrFields: { withCredentials: true },
            success: function (data) {
                var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict.peoplePickerDiv_TopSpan;
                peoplePicker.AddUserKeys(data.d.LoginName);
            },
            error: function (data) {
                console.log(data);
            }
        });
    }
}

function GetUserInfoAndSendRequest(shortModel) {
    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict.peoplePickerDiv_TopSpan;
    var users = peoplePicker.GetAllUserInfo();
    if (users[0] != undefined) {
        var loginName = users[0].Key;
        var context = new SP.ClientContext.get_current();
        this.user = context.get_web().ensureUser(loginName);
        context.load(this.user);

        context.executeQueryAsync(
            Function.createDelegate(null, function () { SendRequest(shortModel, user.get_id()); }),
            Function.createDelegate(null, function (data) { console.log(data); })
        );
    } else {
        SendRequest(shortModel);
    }
}

function SendRequest(shortModel, user) {
    var userId = user === undefined ? _spPageContextInfo.userId : user;

    var item = {
        "__metadata": { "type": "SP.Data.Demandes_x005f_de_x005f_connexionsListItem" },
        "Title": "Demande de connexions",
        "nom_utilisateur": shortModel.name,
        "prenom_utilisateur": shortModel.surname,
        "mode_creation_motif": shortModel.creationReason,
        "localisation": shortModel.localisation,
        "agenceId": shortModel.selectedAgence,
        "siegeId": shortModel.selectedSiege,
        "generic_session_africa": shortModel.genericSessionAfrica,
        "user_type_profilId": shortModel.userTypeProfil,
        "other_user_profile": shortModel.otherUserProfile,
        "fonctionId": shortModel.selectedFonction,
        "has_email": shortModel.hasEmail,
        "email_type": shortModel.typeEmail,
        "email_domainId": shortModel.selectedDomain,
        "email_address": shortModel.emailAddress,
        "responsable_telephone": shortModel.responsableTelephone,
        "contract_type": shortModel.contractType,
        "status_employee": shortModel.status,
        "arrival_date": shortModel.arrivalDate,
        "contract_end_date": shortModel.contractEndDate,
        "folders": ko.toJSON(shortModel.folders),
        "applicationsCitrix": ko.toJSON(shortModel.applicationsCitrix),
        "documentationCitrix": ko.toJSON(shortModel.documentationCitrix),
        "otherApplications": ko.toJSON(shortModel.otherApplications),
        "printers": ko.toJSON(shortModel.printers),
        "comments": shortModel.comments,
        "responsableId": userId,
        "statut": shortModel.statut
    };

    if (demandeId != undefined) {
        item.ID = demandeId;

        $.ajax({
            url: siteUrl + "/_api/web/lists/getbytitle('Demandes de connexions')/items(" + demandeId + ")",
            type: "POST",
            contentType: "application/json;odata=verbose",
            xhrFields: { withCredentials: true },
            data: JSON.stringify(item),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "MERGE",
                "If-Match": "*"
            },
            success: function (response) {
                console.log(response);
            },
            error: function (response) {
                console.log(response);
            }
        }).done(function () {
            location.href = siteUrl + "/Lists/demandes_de_connexions";
        });

    } else {
        $.ajax({
            url: siteUrl + "/_api/web/lists/getbytitle('Demandes de connexions')/items",
            type: "POST",
            contentType: "application/json;odata=verbose",
            xhrFields: { withCredentials: true },
            data: JSON.stringify(item),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (response) {
                AttachFiles(shortModel, response.d.ID);

            },
            error: function (response) {
                console.log(response);
            }
        }
        );

    }
}

function AttachFiles(shortModel, itemId) {
    $.each(shortModel.files, function (index, value) {
        var data = value.fileInput;
        var n = value.fileInput.indexOf(";base64,") + 8;

        data = data.substring(n);

        $().SPServices({
            operation: "AddAttachment",
            listName: "Demandes de connexions",
            asynch: false,
            listItemID: itemId,
            fileName: value.fileName,
            attachment: data,
            completefunc: function (xData, status) {
                console.log('attachment upload complete', xData, status);

            }
        });

    });

    location.href = siteUrl + "/Lists/demandes_de_connexions";

}
