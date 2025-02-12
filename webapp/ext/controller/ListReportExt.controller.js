jQuery.sap.require("sap.m.MessageItem");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.ui.comp.state.UIState");
jQuery.sap.require("sap.ui.export.library");
jQuery.sap.require("sap.ui.export.Spreadsheet");

sap.ui.controller("com.abertis.mm.zpurchaseorderlr.ext.controller.ListReportExt", {



    /* ============================================================================================================================ */
    /* begin: lifecycle methods                                                                                                     */
    /* ============================================================================================================================ */

    onInit: function () {

        // Store Semantic Object and Action in the Controller
        var oURLService = sap.ushell.Container.getService('URLParsing');
        var sShellHash = oURLService.getShellHash(document.URL);
        var oShellHash = oURLService.parseShellHash(sShellHash);
        this.sSemanticObject = oShellHash.semanticObject;
        this.oAction = oShellHash.action;

        // Store other key information in the Controller
        this.oMaterial = this.getView().byId("idPMaterial");
        this.oVendor = this.getView().byId("idHVendorNumber");
        this.oPlant = this.getView().byId("idPPlant");
        this.oAccountAssignmentCategory = this.getView().byId("idPAccountAssignmentCategory");
        this.oCompanyCode = this.getView().byId("idHCompanyCode");
        this.oCurrency = this.getView().byId("idHCurrency");
        this.oActivity = this.getView().byId("idPActivity");
        this.oLocalization = this.getView().byId("idPLocalization");
        this.oOrderNumber = this.getView().byId("idPOrderNumber");
        this.oWBSElement = this.getView().byId("idPWBSElement");
        this.oCostCenter = this.getView().byId("idPCostCenter");
        this.oOmitDeleted = this.getView().byId("idHOmitDeleted");
        this.oStatusName = this.getView().byId("idHStatusName");
        this.oItemDeliveryDate = this.getView().byId("idPItemDeliveryDate");
        this.oPODate = this.getView().byId("idPPODate");

        //Create a model for suggestions data
        var oViewModel = new sap.ui.model.json.JSONModel({});
        this.getView().setModel(oViewModel, "data");

    },

    onInitSmartFilterBarExtension: function (oEvent) {

        //Begin 5.7.2024 Rubén Rollano - Translation of header title
        //Roll-out Argentina
        //this.i18n = this.getView().getModel("i18n").getResourceBundle();
        //End 5.7.2024 Rubén Rollano - Translation of header title

        //Set Smart Filter Bar
        this.oSmartFilterBar = oEvent.getSource();

        //Ensure that there is no default Variant set by the user. 
        //In such a case, do not set default Variant.
        var sDefaultVariantKey = this.oSmartFilterBar.getVariantManagement().getDefaultVariantKey();
        if (sDefaultVariantKey === "*standard*") {
            this.oSmartFilterBar.getVariantManagement().setCurrentVariantId("id_1621431245803_813_page");
        }

        //Set Path of request in Configuration entity
        var sPath = "/ConfigurationSet(SemanticObject='zpurchaseorder',Action='" + this.oAction + "')";
        var that = this;
        this.getView().getModel().read(sPath, {
            success: function (oConfiguration, oResponse) {
                that.oConfiguration = oConfiguration;
                document.title = oConfiguration.AppDescription;
                sap.ui.getCore().byId("shellAppTitle").setText(oConfiguration.AppDescription);
            }
        });

        //Add Status Descriptions to the model
        var oFilters = [];
        var oFilter = new sap.ui.model.Filter(
            "FieldName",
            sap.ui.model.FilterOperator.EQ,
            "idHStatusName",
            ""
        );
        oFilters.push(oFilter);
        var that = this;
        this.getView().getModel().read("/GenericSearchHelpSet", {
            filters: oFilters,
            success: function (oData, oResponse) {
                var StatusModel = new sap.ui.model.json.JSONModel();
                StatusModel.setData(oData);
                that.getView().setModel(StatusModel, "StatusModel");
            },
            error: function (oError) {
                MessageBox.error(that.i18n.getText("E0002"));
                console.log("Error", oError);
                that.error = true;
            }
        });

    },

    onAfterRendering: function () {

        //Begin 5.7.2024 Rubén Rollano - Translation of header title
        //Roll-out Argentina
        this.i18n = this.getView().getModel("i18n").getResourceBundle();
        if (this.byId('com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--listReport-Own-header')) {
            this.byId('com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--listReport-Own-header').setText(this.i18n.getText("HeaderTitle"));
        }//End 5.7.2024 Rubén Rollano - Translation of header title

        this._hideElements();

        //Set properties of button
        this.byId("com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--Export-Own").setIcon("sap-icon://excel-attachment");
        this.byId("com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--Export-Group").setIcon("sap-icon://excel-attachment");

        //Set name and icon in each view
        if (this.oPropio === undefined) {
            this.oPropio = this.byId(
                "com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--template::IconTabFilter-Own"
            );
            this.oGrupo = this.byId(
                "com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--template::IconTabFilter-Group"
            );
            this.Table = this.byId(
                "com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--listReport-Own"
            );
            oTextPedidos = this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("Pedidos");
            oTextGroup = this.getView()
                .getModel("i18n")
                .getResourceBundle()
                .getText("POGroup");
            this.oPropio.setText(oTextPedidos);
            this.oPropio.setIcon("sap-icon://employee");
            this.oGrupo.setText(oTextGroup);
            this.oGrupo.setIcon("sap-icon://collaborate");
        }

    },

    onBeforeRebindTableExtension: function (oEvent) {

        // Set local variables
        var oSmartTable = oEvent.getSource();
        var oBindingParams = oEvent.getParameter("bindingParams");
        var oUiState = oSmartTable.getUiState();
        var oPresentationVariant = oUiState.getPresentationVariant();
        var oColumns = oSmartTable.getTable().getColumns();

        // Add technical properties to the list of selected properties in the request
        //Begin 4.7.2024 Rubén Rollano - Aditive PO
        //Roll-out Argentina
        // //Begin 26.01.2023 Rubén Rollano - Performance in PO link pressed
        // //Roll-out Chile
        // // //Begin 7.11.2023 Rubén Rollano - Show catalog positions
        // // //Roll-out Chile
        // // oBindingParams.parameters.select = "PONumberWithPos,ExchangeRate,DeletionIndicator,Currency,Status,InternalWBSElement,HeaderDeliveredAmountDC,HeaderInvoicedAmountDC,DeliveredAmountDC,DeliveredAmountDC,InvoicedAmountDC,PurchaseRequisitionNumber,PosPurchaseRequisition,StatusName,PosPurchaseOrder,PurchaseOrderNumber,TotalPrice,VendorNumber,VendorName," + oBindingParams.parameters.select;
        // // //End 7.11.2023 Rubén Rollano - Show catalog positions
        // oBindingParams.parameters.select = "ContractNumber,PONumberWithPos,ExchangeRate,DeletionIndicator,Currency,Status,InternalWBSElement,HeaderDeliveredAmountDC,HeaderInvoicedAmountDC,DeliveredAmountDC,DeliveredAmountDC,InvoicedAmountDC,PurchaseRequisitionNumber,PosPurchaseRequisition,StatusName,PosPurchaseOrder,PurchaseOrderNumber,TotalPrice,VendorNumber,VendorName," + oBindingParams.parameters.select;
        // //End 26.01.2023 Rubén Rollano - Performance in PO link pressed
        //oBindingParams.parameters.select = "Aditive,ContractNumber,PONumberWithPos,ExchangeRate,DeletionIndicator,Currency,Status,InternalWBSElement,HeaderDeliveredAmountDC,HeaderInvoicedAmountDC,DeliveredAmountDC,DeliveredAmountDC,InvoicedAmountDC,PurchaseRequisitionNumber,PosPurchaseRequisition,StatusName,PosPurchaseOrder,PurchaseOrderNumber,TotalPrice,VendorNumber,VendorName," + oBindingParams.parameters.select;
        oBindingParams.parameters.select = "Aditive,ContractNumber,PONumberWithPos,ExchangeRate,HeaderInvoicedAmountDC,HeaderDeliveredAmountDC,TotalPrice,VendorNumber," + oBindingParams.parameters.select;

        //End 4.7.2024 Rubén Rollano - Aditive PO
        
        //Begin 5.7.2024 Rubén Rollano - Translation of header title
        //Roll-out Argentina
        var that = this;
        oBindingParams.events["dataReceived"] = function () {
            // Regular expression for number string: (347), (1.342) or (3,3434,222)
            const sRegularExpression = /\(\d{1,3}([.,]\d{3})*\)/;
            if (that.byId('com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--listReport-Own')) {
                var sNumber = that.byId('com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--listReport-Own-header').getText().match(sRegularExpression)
                if (sNumber !== null) {
                    sNumber = sNumber[0];
                    var sNewHeaderTitle = that.i18n.getText("HeaderTitle") + ' ' + sNumber;
                    that.byId('com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--listReport-Own-header').setText(sNewHeaderTitle);
                }
                var sNumber = that.byId('com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--listReport-Group-header').getText().match(sRegularExpression);
                if (sNumber !== null) {
                    sNumber = sNumber[0];
                    var sNewHeaderTitle = that.i18n.getText("HeaderTitle") + ' ' + sNumber;
                    that.byId('com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--listReport-Group-header').setText(sNewHeaderTitle);
                }
            }
        }.bind(this);
        //End 5.7.2024 Rubén Rollano - Translation of header title

        // Set the the default order
        oBindingParams.sorter.push(new sap.ui.model.Sorter("PurchaseOrderNumber", true));
        oBindingParams.sorter.push(new sap.ui.model.Sorter("PosPurchaseOrder", false));

        // Add custom filters to the request
        this._addCustomerFilters(oBindingParams.filters);

        oContent = oPresentationVariant.Visualizations[0].Content
        oSmartTable.setUiState(oUiState);

        if (oColumns !== undefined) {

            //Set label to columns
            for (var j = 0; j < oColumns.length; j++) {
                var oId = oColumns[j].getId();
                if (oId.search("PRObjectId") > 0) {
                    var sLabel = this.getView().getModel("i18n").getResourceBundle().getText("PRObjectId");
                    oColumns[j].setTooltip(sLabel);
                    oColumns[j].getHeader().setText(sLabel);
                }
            }

            // if (this.oSmartFilterBar.getVariantManagement().getCurrentVariantId() === "id_1621431245803_813_page") {
            //     for (var jj = oColumns.length; jj >= 0; jj--) {
            //         var j = jj - 1;
            //         if (oContent[j] !== undefined) {
            //             var oId = oColumns[j].getId();
            //             if ((oSmartTable.sId.search("Own") > 0 && this.firstOwn === undefined) || (oSmartTable.sId.search("Group") > 0 && this.firstGroup === undefined)) {

            //                 if (oContent[j].Value.search("PurchaseAgreement") >= 0 || oContent[j].Value.search("PRObjectId") >= 0 || oContent[j].Value.search("PurchaseRequisitionNumber") >= 0) {
            //                     delete oContent[j];
            //                 }

            //             }
            //         }
            //     }
            // }

        }

        oSmartTable.setUiState(oUiState);

        if (oSmartTable.sId.search("Group") > 0) {
            this.firstGroup = true;
        } else {
            this.firstOwn = true;
        }

    },














    /* ============================================================================================================================ */
    /* begin: handle methods                                                                                                        */
    /* ============================================================================================================================ */

    //Begin 7.11.2023 Rubén Rollano - Show catalog positions
    //Roll-out Chile
    handleOnDisplayPONumberWithPosPressed: function (oEvent) {

        this.getView().setBusy(true);

        //Begin 26.01.2023 Rubén Rollano - Performance in PO link pressed
        //Roll-out Chile
        // var oBindingPath = oEvent.getSource().getBindingContext().getPath();
        // var sPurchaseOrderNumber = oBindingPath.substr(44,10);
        // var that = this;
        // var oHeaderFilters = [];
        // oHeaderFilters.push(new sap.ui.model.Filter("PurchaseOrderNumber", sap.ui.model.FilterOperator.EQ, sPurchaseOrderNumber));
        // this.getView().getModel("erp").read("/ZC_PosPurchaseOrderLR", {
        //     filters: oHeaderFilters,
        //     success: function (oData) {
        //         var navigationService = sap.ushell.Container.getService(
        //             "CrossApplicationNavigation"
        //         );
        //         sAction = "display";
        //         if (oData.results.length > 0) {
        //             if (oData.results[0].ContractNumber !== "" && oData.results[0].ContractNumber !== undefined) {
        //                 var sAction = "displayPOContract";
        //             }
        //         }
        //         if (sAction === "display") {
        //             if (that.sAction === "display") {
        //                 var hash = navigationService.hrefForExternal({
        //                     target: {
        //                         semanticObject: "zpurchaseorder",
        //                         action: sAction,
        //                         preferredMode: "display"
        //                     },
        //                     params: {
        //                         PurchaseOrderNumber: sPurchaseOrderNumber,
        //                     },
        //                 });
        //             } else {
        //                 var hash = navigationService.hrefForExternal({
        //                     target: {
        //                         semanticObject: "zpurchaseorder",
        //                         action: sAction,
        //                         preferredMode: "display"
        //                     },
        //                     params: {
        //                         PurchaseOrderNumber: sPurchaseOrderNumber
        //                     },
        //                 });
        //             }
        //             var url = window.location.href.split("#")[0] + hash;
        //             sap.m.URLHelper.redirect(url, false);
        //         } else {
        //             var hash = navigationService.hrefForExternal({
        //                 target: {
        //                     semanticObject: "zpurchaseorder",
        //                     action: sAction,
        //                     preferredMode: "display"
        //                 }
        //             });
        //             var url = window.location.href.split("#")[0] + hash;
        //             url = url + "&/object/" + oData.results[0].ContractNumber + "," + sPurchaseOrderNumber;
        //             sap.m.URLHelper.redirect(url, false);
        //         }
        //     },
        //     error: function (oError) {
        //         console.log("ZC_PurchaseRequisitionHeader oError", oError);
        //         that.getView().setBusy(false);
        //     }
        // });

        var oBindingPath = oEvent.getSource().getBindingContext().getPath();
        var sContractNumber = this.getView().getModel().getProperty(oBindingPath).ContractNumber;

        // Begin 4.7.2024 Rubén Rollano - Aditive PO
        // Roll-out Argentina
        // var sPurchaseOrderNumber = this.getView().getModel().getProperty(oBindingPath).PurchaseOrderNumber;
        var sPurchaseOrderNumber = oEvent.getSource().mProperties.text.substr(0,10)
        // End 4.7.2024 Rubén Rollano - Aditive PO

        var navigationService = sap.ushell.Container.getService(
            "CrossApplicationNavigation"
        );

        sAction = "display";
        if (sContractNumber > 0) {
            if (sContractNumber !== "" && sContractNumber !== undefined) {
                var sAction = "displayPOContract";
            }
        }

        if (sAction === "display") {

            if (this.sAction === "display") {
                var hash = navigationService.hrefForExternal({
                    target: {
                        semanticObject: "zpurchaseorder",
                        action: sAction,
                        preferredMode: "display"
                    },
                    params: {
                        PurchaseOrderNumber: sPurchaseOrderNumber,
                    },

                });
            } else {
                var hash = navigationService.hrefForExternal({
                    target: {
                        semanticObject: "zpurchaseorder",
                        action: sAction,
                        preferredMode: "display"
                    },
                    params: {
                        PurchaseOrderNumber: sPurchaseOrderNumber
                    },
                });
            }

            var url = window.location.href.split("#")[0] + hash;
            sap.m.URLHelper.redirect(url, false);

        } else {
            var hash = navigationService.hrefForExternal({
                target: {
                    semanticObject: "zpurchaseorder",
                    action: sAction,
                    preferredMode: "display"
                }
            });
            var url = window.location.href.split("#")[0] + hash;
            url = url + "&/object/" + sContractNumber + "," + sPurchaseOrderNumber;
            sap.m.URLHelper.redirect(url, false);

        }

        //End 26.01.2023 Rubén Rollano - Performance in PO link pressed

    },
    //End 7.11.2023 Rubén Rollano - Show catalog positions

    handleOnValueHelpCancelPressed: function () {

        this.oValueHelpDialog.close();

    },

    handleOnSuggest: function (oEvent) {

        var that = this;
        var sFullIdProperty = oEvent.getParameters().id;
        var sValue = oEvent.getParameter("suggestValue");
        var oFilters = [];

        this.sPropertyIdOfSearchHelp = sFullIdProperty.split("-")[2];

        var oFilter = new sap.ui.model.Filter(
            "FieldName",
            sap.ui.model.FilterOperator.BT,
            this.sPropertyIdOfSearchHelp,
            sValue
        );
        oFilters.push(oFilter);

        if (this.sPropertyIdOfSearchHelp === "idPWBSElement") {
            oFilters.push(new sap.ui.model.Filter(
                "FieldDependent1",
                sap.ui.model.FilterOperator.EQ,
                "?"
            ));
        }

        if (this.sPropertyIdOfSearchHelp === "idPOrderNumber" && sValue.length < 5) {
            return;
        }

        //Get values for suggestions and add them to the model
        this.getView().getModel().read("/GenericSearchHelpSet", {
            filters: oFilters,
            success: function (oData) {
                that.getView().getModel("data").setProperty("/SuggestionItems", oData.results);
            },
            error: function (oError) {
                sap.m.MessageBox.error(that.i18n.getText("E0002"));
                console.log("Error", oError);
            }
        });

    },

    handleOnSelectSuggestion: function (oEvent) {

        //In material and vendor, there is an extra column for the icon
        if (this.sPropertyIdOfSearchHelp === "idPMaterial" || this.sPropertyIdOfSearchHelp === "idHVendorNumber") {
            var sValue = oEvent.mParameters.selectedRow.getCells()[1].mProperties.text;
            var sValueName = oEvent.mParameters.selectedRow.getCells()[2].mProperties.text;
        } else {
            sValue = oEvent.mParameters.selectedItem.mProperties.text
            sValueName = oEvent.mParameters.selectedItem.mProperties.additionalText
        }

        var sToken = new sap.m.Token({ key: sValue, text: sValueName });
        var aTokens = [sToken];
        this.byId(this.sPropertyIdOfSearchHelp).setTokens(aTokens);

        //Write selected value in the Console log
        console.log("Selected value in suggestion list:", sValue);

        //Add description of selected item to the corresponding field (if any)
        var oPropertyName = this.getView().byId(this.sPropertyIdOfSearchHelp + "Name");
        if (oPropertyName) {
            oPropertyName.setValue(sValueName);
        }

    },

    handleLiveChangeFGI: function (oEvent) {

        //Get Set of Selection from the filter bar
        var aSelectionSet = this.oValueHelpDialog.getFilterBar().getAllFilterItems();

        //Get values of fields
        for (var j = 0; j < aSelectionSet.length; j++) {
            switch (aSelectionSet[j].getControl().mProperties.name) {
                case "AdditionalField1":
                    var sAdditionalField1 = aSelectionSet[j].getControl().getValue();
                    break;
                case "AdditionalField2":
                    var sAdditionalField2 = aSelectionSet[j].getControl().getValue();
                    break;
                case "AdditionalField3":
                    var sAdditionalField3 = aSelectionSet[j].getControl().getValue();
                    break;
                case "AdditionalField4":
                    var sAdditionalField4 = aSelectionSet[j].getControl().getValue();
                    break;
                case "AdditionalField5":
                    var sAdditionalField5 = aSelectionSet[j].getControl().getValue();
                    break;
                case "AdditionalField6":
                    var sAdditionalField6 = aSelectionSet[j].getControl().getValue();
                    break;
                case "AdditionalField7":
                    var sAdditionalField7 = aSelectionSet[j].getControl().getValue();
                    break;
                case "AdditionalField8":
                    var sAdditionalField8 = aSelectionSet[j].getControl().getValue();
                    break;
                case "AdditionalField9":
                    var sAdditionalField9 = aSelectionSet[j].getControl().getValue();
                    break;
            }
        }

        //Update results table
        this._updateSearchHelp(sAdditionalField1, sAdditionalField2, sAdditionalField3, sAdditionalField4, sAdditionalField5, sAdditionalField6, sAdditionalField7, sAdditionalField8, sAdditionalField9);

    },

    handleOnValueHelpOkPressed: function (oEvent) {

        //Get Tokens (only Material are multi-input)
        var aTokens = oEvent.getParameter("tokens");
        this.byId("idPMaterial").addToken(aTokens[0])
        this.oPropertySearchField.setTokens(aTokens);
        this.oValueHelpDialog.close();

    },

    handleOnExportPressed: function (oEvent) {

        // Set local variables
        var that = this;
        var oFiltersSmartFilterBar = [];

        //Set busy indicator
        this.getView().setBusy(true);

        //Get Filters of Smart Filter Bar if any
        if (this.oSmartFilterBar.getFilters().length > 0) {
            oFiltersSmartFilterBar = this.oSmartFilterBar.getFilters()[0].aFilters;
        }

        //Add filters
        this._addCustomerFilters(oFiltersSmartFilterBar);

        //Get data for export
        this.getView().getModel("erp").read("/ZC_PosPurchaseOrderLR", {
            filters: oFiltersSmartFilterBar,
            success: function (oData) {
                that.getView().setBusy(false);
                var oResults = oData.results;
                console.log("Results for export:", oResults);
                that._downloadFile(oResults)
            },
            error: function (oError) {
                that.getView().setBusy(false)
            }
        })

    },

    handleOnValueHelpRequestPressed: function (oEvent) {

        var sFullId = oEvent.getParameters().id;
        this.oPropertySearchField = this.byId(sFullId);
        this.sPropertyIdOfSearchHelp = sFullId.split("-")[2];
        var sIdProperty = sFullId.split("-")[2];
        var sValue = this.byId(sFullId).getValue();
        var oLabel = oTextPedidos = this.getView().getModel("erp").getProperty("/#ZC_PosPurchaseRequisitionLRType/" + sIdProperty.substring(3, 100) + "/@sap:label");
        var oLabelDescription = this.getView().getModel("erp").getProperty("/#ZC_PosPurchaseRequisitionLRType/" + sIdProperty.substring(3, 100) + "Name/@sap:label");
        this.sTitleSearchHelp = oLabel;
        this.oColModel = new sap.ui.model.json.JSONModel();
        var aColumns = {
            cols: [{
                label: oLabel,
                template: "FieldName",
                width: "5rem"
            },
            {
                label: oLabelDescription,
                template: "FieldDescription",
            },
            ],
        };

        //Set specific columns for special properties: Vendor, Material, Address Number and Order Number
        if (this.sPropertyIdOfSearchHelp === "idHVendorNumber") {
            aColumns.cols.push({ label: this.getView().getModel().getProperty("/#ZC_PurchaseRequisitionHeaderType/VatNumber/@sap:label"), template: "AdditionalField1" })
            aColumns.cols.push({ label: this.getView().getModel().getProperty("/#ZC_PurchaseRequisitionHeaderType/VatNumber2/@sap:label"), template: "AdditionalField2" })
            aColumns.cols.push({ label: this.getView().getModel().getProperty("/#ZC_PurchaseRequisitionHeaderType/Locked/@sap:label"), template: "AdditionalField3" })
            aColumns.cols.push({ label: this.getView().getModel().getProperty("/#ZC_PosPurchaseRequisitionType/City/@sap:label"), template: "AdditionalField4" })
            aColumns.cols.push({ label: this.getView().getModel().getProperty("/#ZC_PosPurchaseRequisitionType/PostalCode/@sap:label"), template: "AdditionalField5" })

        } else if (this.sPropertyIdOfSearchHelp === "idPMaterial") {
            aColumns.cols.push({ label: this.getView().getModel().getProperty("/#ZC_PosPurchaseRequisitionType/MaterialType/@sap:label"), template: "AdditionalField1" });
            aColumns.cols.push({ label: this.getView().getModel().getProperty("/#ZC_PosPurchaseRequisitionType/MaterialGroup/@sap:label"), template: "AdditionalField2" });

            //Begin 22.04.2023 Rubén Rollano - Show deleted materials in search help
            //Roll-out Spain
            aColumns.cols.push({ label: this.getView().getModel().getProperty("/#ZC_PosPurchaseRequisitionType/MaterialDeleteIndicator/@sap:label"), template: "AdditionalField3" })
            //End 22.04.2023 Rubén Rollano - Show deleted materials in search help

        }

        this.oColModel.setData(aColumns);
        this.oModeloAyudaBusqueda = new sap.ui.model.json.JSONModel();

        var oFilters = [];
        var oFilter = new sap.ui.model.Filter(
            "FieldName",
            sap.ui.model.FilterOperator.BT,
            sIdProperty,
            sValue
        );
        oFilters.push(oFilter);

        if (sIdProperty === "idPWBSElement") {
            oFilters.push(new sap.ui.model.Filter(
                "FieldDependent1",
                sap.ui.model.FilterOperator.EQ,
                "?"
            ));
        }

        var p = "/GenericSearchHelpSet";
        var u = [];
        var mParameters = {};
        mParameters.filters = oFilters;
        mParameters.context = null;
        mParameters.success = jQuery.proxy(this._getSearchHelpSuccess, this);
        mParameters.error = jQuery.proxy(this._getSolicitudAyudaBusquedaError, this);
        mParameters.async = true;
        mParameters.urlParameters = u;
        this.getView().getModel().read(p, mParameters);
        this.oValueHelpDialog = sap.ui.xmlfragment(
            "com.abertis.mm.zpurchaseorderlr.ext.fragments.SearchHelp",
            this
        );
        this.getView().addDependent(this.oValueHelpDialog);
        this.oValueHelpDialog.getTableAsync().then(
            function (oTable) {
                oTable.setModel(this.oModeloAyudaBusqueda);
                oTable.setModel(this.oColModel, "columns");
                if (oTable.bindRows) {
                    oTable.bindAggregation("rows", "/GenericSearchHelpSet");
                }
                if (oTable.bindItems) {
                    oTable.bindAggregation("items", "/GenericSearchHelpSet", function () {
                        return new ColumnListItem({
                            cells: aColumns.map(function (column) {
                                return new Label({ text: "{" + column.template + "}" });
                            }),
                        });
                    });
                }
                this.oValueHelpDialog.update();
            }.bind(this)
        );
    },















    /* ============================================================================================================================ */
    /* begin: internal methods                                                                                                      */
    /* ============================================================================================================================ */

    _setTooltip: function (oObjectIDReferencia, oColumn) {

        var oTextName = "Tooltip" + oObjectIDReferencia;
        var sLabel = this.getView().getModel("i18n").getResourceBundle().getText(oTextName);
        oColumn.setTooltip(sLabel);
        var sIdGrupo = "com.abertis.mm.zdocmaterial::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_MOVIMIENTOMATERIAL--listReport-Group-" + oObjectIDReferencia + "-header";
        this.getView().byId(sIdGrupo).setTooltip(sLabel);
        sIdPropio = "com.abertis.mm.zdocmaterial::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_MOVIMIENTOMATERIAL--listReport-Own-" + oObjectIDReferencia + "-header";
        this.getView().byId(sIdPropio).setTooltip(sLabel);

    },

    _addGroupInSmartTable: function (oSmartTable) {

        var oUiState = oSmartTable.getUiState();
        var oPresentationVariant = oUiState.getPresentationVariant();
        oPresentationVariant.GroupBy = ["GroupingField"];
        oPresentationVariant = oPresentationVariant;
        oSmartTable.setUiState(oUiState);

    },

    _getSearchHelpSuccess: function (oRespuesta, oMensaje) {

        // Show a message if No data was found
        if (oRespuesta.results.length === 0) {
            sap.m.MessageBox.error(this.i18n.getText("NoDataInSearchHelp"));
            return;
        }

        this.oSearchHelpModel = new sap.ui.model.json.JSONModel();

        var oResults = oRespuesta.results;
        this.oModeloAyudaBusqueda.setData({ GenericSearchHelpSet: oResults });
        this.oValueHelpDialog.setTitle(this.sTitleSearchHelp);
        this.oValueHelpDialog.open();
        this.getView().setBusy(false);

        this.oValueHelpDialog.setSupportMultiselect(true);

        if (this.sPropertyIdOfSearchHelp === "idPMaterial") {
            this.oValueHelpDialog.setSupportMultiselect(false);
            this._setLabelInSearchHelpDialog(1, "MaterialType");
            this._setLabelInSearchHelpDialog(2, "MaterialGroup");
            //Begin 6.5.2023 Rubén Rollano - Show deleted materials in search help
            //Roll-out Spain
            this._setLabelInSearchHelpDialog(3, "MaterialDeleteIndicator");
            //End 6.5.2023 Rubén Rollano - Show deleted materials in search help

            this.oValueHelpDialog.getFilterBar().getAllFilterItems()[6].setVisible(false);
            this.oValueHelpDialog.getFilterBar().getAllFilterItems()[5].setVisible(false);
            this.oValueHelpDialog.getFilterBar().getAllFilterItems()[4].setVisible(false);

            //Begin 6.5.2023 Rubén Rollano - Show deleted materials in search help
            //Roll-out Spain
            //this.oValueHelpDialog.getFilterBar().getAllFilterItems()[3].setVisible(false);
            //End 6.5.2023 Rubén Rollano - Show deleted materials in search help

            this.oValueHelpDialog.getFilterBar().getAllFilterItems()[0].setVisible(false);
        } else {
            this.oValueHelpDialog.setSupportMultiselect(false);
            if (this.sPropertyIdOfSearchHelp === "idHVendorNumber") {
                this._setLabelInSearchHelpDialog(1, "VatNumber");
                this._setLabelInSearchHelpDialog(2, "VatNumber2");
                this._setLabelInSearchHelpDialog(3, "CompanyCode");
                this._setLabelInSearchHelpDialog(4, "Locked");
                this._setLabelInSearchHelpDialog(5, "City");
                this._setLabelInSearchHelpDialog(6, "PostalCode");
                this.oValueHelpDialog.getFilterBar().getAllFilterItems()[0].setVisible(false);
            } else {
                this.oValueHelpDialog.getFilterBar().getAllFilterItems()[6].setVisible(false);
                this.oValueHelpDialog.getFilterBar().getAllFilterItems()[5].setVisible(false);
                this.oValueHelpDialog.getFilterBar().getAllFilterItems()[4].setVisible(false);
                this.oValueHelpDialog.getFilterBar().getAllFilterItems()[3].setVisible(false);
                this.oValueHelpDialog.getFilterBar().getAllFilterItems()[2].setVisible(false);
                this.oValueHelpDialog.getFilterBar().getAllFilterItems()[1].setVisible(false);
                this.oValueHelpDialog.getFilterBar().getAllFilterItems()[0].setVisible(false);
            }
        }

        var oSearchField = this.oValueHelpDialog.getFilterBar().getBasicSearch();
        this.oBasicSearch;
        if (!oSearchField) {
            this.oBasicSearch = new sap.m.SearchField({
                showSearchButton: false
            });
        } else {
            oSearchField = null;
        }
        this.oValueHelpDialog.getFilterBar().setBasicSearch(this.oBasicSearch);

        this.oBasicSearch.attachBrowserEvent("keyup", function (oEvent) {
            this.handleLiveChangeFGI();
        }.bind(this));

        this.oSearchHelp = oRespuesta.results;
        this.getView().setBusy(false);
        this.oValueHelpDialog.getTableAsync().then(
            function (oTable) {
                oTable.setModel(this.oSearchHelpModel);
                oTable.setModel(this.oColModel, "columns");
                if (oTable.bindRows) {
                    this.oSearchHelpModel.setData({ searchHelp: this.oSearchHelp });
                    oTable.bindAggregation("rows", "/searchHelp");
                }
                if (oTable.bindItems) {
                    oTable.bindAggregation("items", this.oSearchHelp, function () {
                        return new ColumnListItem({
                            cells: aColumns.map(function (column) {
                                return new Label({ text: "{" + column.template + "}" });
                            }),
                        });
                    });
                }
                this.oValueHelpDialog.update();
            }.bind(this)
        );

    },

    //Begin 22.04.2023 Rubén Rollano - Show deleted materiasls in search help
    //Roll-out Spain
    IconDeleted: function (bLocked) {
        if (bLocked) {
            return "sap-icon://delete";
        }
    },
    //End 22.04.2023 Rubén Rollano - Show deleted materiasls in search help



    _setLabelInSearchHelpDialog: function (sIndex, sPropertyName) {

        var sEntity = "ZC_PosPurchaseRequisitionType";
        var sLabel = this.getView().getModel().getProperty("/#" + sEntity + "/" + sPropertyName + "/@sap:label");
        this.oValueHelpDialog.getFilterBar().getAllFilterItems()[sIndex].setLabel(sLabel);

    },

    _getFilterCustomerSearchHelp: function (oObjeto, sNombreObjeto, oFilters) {

        var oTokens = oObjeto.getTokens();
        if (oTokens.length !== 0) {
            for (var i = 0; i < oTokens.length; i++) {
                var oFilter = new sap.ui.model.Filter(
                    sNombreObjeto,
                    sap.ui.model.FilterOperator.EQ,
                    oTokens[i].getKey()
                );
                oFilters.push(oFilter);
            }
        } else if (oObjeto.getValue() !== "") {
            oFilter = new sap.ui.model.Filter(
                sNombreObjeto,
                sap.ui.model.FilterOperator.EQ,
                oObjeto.getValue()
            );
            oFilters.push(oFilter);
        }

    },

    _addCustomerFilters: function (oFilters) {

        //Test
        //Test
        // if (this.oGrupo.getParent().getSelectedKey() === "Own") {
        //     var oFilter = new sap.ui.model.Filter(
        //         "Propio",
        //         sap.ui.model.FilterOperator.EQ,
        //         "X"
        //     );
        //     oFilters.push(oFilter);
        // }
        if (this.oGrupo.getParent().getSelectedKey() === "Own") {      
            var oUserInfo = sap.ushell.Container.getService("UserInfo");
            var sUserId = oUserInfo.getId();
            var oFilter = new sap.ui.model.Filter(
                "Receptor",
                sap.ui.model.FilterOperator.EQ,
                sUserId
            );
            oFilters.push(oFilter);
        }

        //Add filters of customer search helps
        this._getFilterCustomerSearchHelp(this.oVendor, "VendorNumber", oFilters);
        this._getFilterCustomerSearchHelp(this.oMaterial, "Material", oFilters);
        this._getFilterCustomerSearchHelp(this.oPlant, "Plant", oFilters);
        this._getFilterCustomerSearchHelp(this.oAccountAssignmentCategory, "AccountAssignmentCategory", oFilters);
        this._getFilterCustomerSearchHelp(this.oCompanyCode, "CompanyCode", oFilters);
        this._getFilterCustomerSearchHelp(this.oCurrency, "Currency", oFilters);
        this._getFilterCustomerSearchHelp(this.oActivity, "Activity", oFilters);
        this._getFilterCustomerSearchHelp(this.oLocalization, "Localization", oFilters);
        this._getFilterCustomerSearchHelp(this.oOrderNumber, "OrderNumber", oFilters);
        this._getFilterCustomerSearchHelp(this.oWBSElement, "InternalWBSElement", oFilters);
        this._getFilterCustomerSearchHelp(this.oCostCenter, "CostCenter", oFilters);

        //Begin 9.11.2023 Rubén Rollano - LATAM Dates
        //Roll-out Chile
        if (this.oItemDeliveryDate.getValue() !== '') {
            this._addFilterCustomDate(oFilters, "ItemDeliveryDate", this.oItemDeliveryDate);
        }
        if (this.oPODate.getValue() !== '') {
            this._addFilterCustomDate(oFilters, "PODate", this.oPODate);
        }
        //End 9.11.2023 Rubén Rollano - LATAM Dates


        //Add special filter for Status
        var aSelectItems = this.oStatusName.getSelectedItems();
        for (var j = 0; j < aSelectItems.length; j++) {
            var oFilter = new sap.ui.model.Filter(
                "Status",
                sap.ui.model.FilterOperator.EQ,
                aSelectItems[j].getKey().replaceAll("0", "")
            );
            oFilters.push(oFilter);
        }

        //Add filter for Omit Deleted checkbox
        if (this.oOmitDeleted.getState()) {
            oFilter = new sap.ui.model.Filter(
                "DeletionIndicator",
                sap.ui.model.FilterOperator.NE,
                "L"
            );
            oFilters.push(oFilter);
        }

    },

    //Begin 9.11.2023 Rubén Rollano - LATAM Dates
    //Roll-out Chile
    _addFilterCustomDate: function (oFilters, sPropertyName, oDate) {

        this.oDateFrom = oDate.getFrom();
        this.oTimeFrom = this.oDateFrom.getTime();
        this.oTimeZoneOffset = this.oDateFrom.getTimezoneOffset() * 1000 * 60
        this.oNewTime = this.oTimeFrom - this.oTimeZoneOffset
        this.oDateFromReal = new Date();
        this.oDateFromReal.setTime(this.oNewTime);
        this.oDateTo = oDate.getTo();
        this.oTimeTo = this.oDateTo.getTime();
        var nPos = this.oDateTo.toString().search("GMT");
        var nHours = this.oDateTo.toString().substr(nPos + 4, 2)
        nHours = nHours * 1 + 1;
        this.oNewTime = this.oTimeTo - (nHours * 60 * 1 * 60 * 1000);
        this.oDateToReal = new Date();
        this.oDateToReal.setTime(this.oNewTime);

        if (this.oDateToReal < this.oDateFromReal) {
            this.oDateToReal = this.oDateFromReal
        }

        var oFilter = new sap.ui.model.Filter(sPropertyName, sap.ui.model.FilterOperator.BT, this.oDateFromReal, this.oDateToReal);
        oFilters.push(oFilter);

    },
    //End 9.11.2023 Rubén Rollano - LATAM Dates

    _hideElements: function () {

        var oShareButton = this.byId(
            "com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--template::Share"
        );
        if (oShareButton !== undefined) {
            oShareButton.setVisible(false);
        }

    },

    _downloadFile: function (oResults) {

        var oSpreadsheetModel = {
            workbook: {
                columns: this._createColumns()
            },
            dataSource: oResults,
            fileName: this.oConfiguration.AppDescription
        };
        var oSpreadsheet = new sap.ui.export.Spreadsheet(oSpreadsheetModel);
        oSpreadsheet.build().then(function () { }).finally(function () {
            oSpreadsheet.destroy()
        })
    },

    _updateSearchHelp: function (sAdditionalField1, sAdditionalField2, sAdditionalField3, sAdditionalField4, sAdditionalField5, sAdditionalField6, sAdditionalField7, sAdditionalField8, sAdditionalField9) {

        //Set local variables
        var u = [];
        var oFilters = [];
        var aParameters = {};

        //Add Fieldname as Filter
        var oFilter = new sap.ui.model.Filter(
            "FieldName",
            sap.ui.model.FilterOperator.BT,
            this.sPropertyIdOfSearchHelp,
            this.oBasicSearch.getValue()
        );
        oFilters.push(oFilter);

        //Add additional fields as filter
        if (sAdditionalField1 !== undefined) {
            oFilter = new sap.ui.model.Filter(
                "AdditionalField1",
                sap.ui.model.FilterOperator.Contains,
                sAdditionalField1,
                ""
            );
            oFilters.push(oFilter);
        }
        if (sAdditionalField2 !== undefined) {
            oFilter = new sap.ui.model.Filter(
                "AdditionalField2",
                sap.ui.model.FilterOperator.Contains,
                sAdditionalField2,
                ""
            );
            oFilters.push(oFilter);
        }
        if (sAdditionalField3 !== undefined) {
            oFilter = new sap.ui.model.Filter(
                "AdditionalField3",
                sap.ui.model.FilterOperator.Contains,
                sAdditionalField3,
                ""
            );
            oFilters.push(oFilter);
        }
        if (sAdditionalField4 !== undefined) {
            oFilter = new sap.ui.model.Filter(
                "AdditionalField4",
                sap.ui.model.FilterOperator.Contains,
                sAdditionalField4,
                ""
            );
            oFilters.push(oFilter);
        }
        if (sAdditionalField5 !== undefined) {
            oFilter = new sap.ui.model.Filter(
                "AdditionalField5",
                sap.ui.model.FilterOperator.Contains,
                sAdditionalField5,
                ""
            );
            oFilters.push(oFilter);
        }
        if (sAdditionalField6 !== undefined) {
            oFilter = new sap.ui.model.Filter(
                "AdditionalField6",
                sap.ui.model.FilterOperator.Contains,
                sAdditionalField6,
                ""
            );
            oFilters.push(oFilter);
        }
        if (sAdditionalField7 !== undefined) {
            oFilter = new sap.ui.model.Filter(
                "AdditionalField7",
                sap.ui.model.FilterOperator.Contains,
                sAdditionalField7,
                ""
            );
            oFilters.push(oFilter);
        }
        if (sAdditionalField8 !== undefined) {
            oFilter = new sap.ui.model.Filter(
                "AdditionalField8",
                sap.ui.model.FilterOperator.Contains,
                sAdditionalField8,
                ""
            );
            oFilters.push(oFilter);
        }
        if (sAdditionalField9 !== undefined) {
            oFilter = new sap.ui.model.Filter(
                "AdditionalField9",
                sap.ui.model.FilterOperator.Contains,
                sAdditionalField9,
                ""
            );
            oFilters.push(oFilter);
        }

        //Read general search
        aParameters.context = null;
        aParameters.success = jQuery.proxy(this._searchHelpSuccessFromDialog, this);
        aParameters.error = jQuery.proxy(this._searchHelpErrorFromDialog, this);
        aParameters.async = true;
        aParameters.urlParameters = u;
        aParameters.filters = oFilters;
        this.getView().getModel().read("/GenericSearchHelpSet", aParameters);

    },

    _formatLocked: function (sLocked) {

        //Begin 22.04.2023 Rubén Rollano - Show deleted materiasls in search help
        //Roll-out Spain
        // if (sLocked !== "") {
        //   return 'sap-icon://locked';
        // }
        if (sLocked === "D") {
            return 'sap-icon://delete';
        }
        if (sLocked === "B") {
            return 'sap-icon://locked';
        }
        //End 22.04.2023 Rubén Rollano - Show deleted materiasls in search help

    },

    _searchHelpSuccessFromDialog: function (oRespuesta, oMensaje) {

        this.oSearchHelp = oRespuesta.results;
        this.getView().setBusy(false);

        this.oValueHelpDialog.getTableAsync().then(
            function (oTable) {
                oTable.setModel(this.oSearchHelpModel);
                oTable.setModel(this.oColModel, "columns");
                if (oTable.bindRows) {
                    this.oSearchHelpModel.setData({ searchHelp: this.oSearchHelp });
                    oTable.bindAggregation("rows", "/searchHelp");
                }
                if (oTable.bindItems) {
                    oTable.bindAggregation("items", this.oSearchHelp, function () {
                        return new ColumnListItem({
                            cells: aCols.map(function (column) {
                                return new Label({ text: "{" + column.template + "}" });
                            }),
                        });
                    });
                }
                this.oValueHelpDialog.update();
            }.bind(this)
        );

    },

    _createColumns: function () {

        if (this.oGrupo.getParent().getSelectedKey() === "Own") {
            var oSmartTable = this.byId("com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--listReport-Own");
        } else {
            var oSmartTable = this.byId("com.abertis.mm.zpurchaseorderlr::sap.suite.ui.generic.template.ListReport.view.ListReport::ZC_PosPurchaseOrderLR--listReport-Group");
        }
        var arrayColumn = [];
        var oColumns = oSmartTable.getTable().getColumns();
        if (oColumns !== undefined) {
            for (var i = 0; i < oColumns.length; i++) {
                if (oColumns[i].getProperty("visible")) {
                    var oId = oColumns[i].getId();
                    var sProperty;
                    var prop = oId.split("sProperty::");
                    if (prop.length > 1) {
                        sProperty = prop[1].split(":::")[0];
                    } else {
                        sProperty = prop[0].split("-")[4]
                    }
                    switch (sProperty) {

                        // Begin 21.11.2023 Rubén Rollano - New PO field
                        // Roll-out Chile
                        case "ExtensionWizard::ColumnBreakout1":
                            arrayColumn.push({
                                label: oColumns[i].getHeader().getProperty("text"),
                                property: "PONumberWithPos"
                            });
                            break;
                        // End 21.11.2023 Rubén Rollano - New PO field

                        case "ItemDeliveryDate":
                        case "PODate":
                        case "ItemDeliveryDate":
                        case "StartOfValidityPeriod":
                        case "EndOfValidityPeriod":
                            arrayColumn.push({
                                label: oColumns[i].getHeader().getProperty("text"),
                                property: sProperty,
                                type: sap.ui.export.EdmType.Date
                            });
                            break;
                        case "TotalPriceItem":
                        case "TargetValueItem":
                        case "ConsumedAmount":
                        case "DeliveredAmount":
                        case "NetValue":
                        case "DeliveredAmount":
                        case "InvoicedAmount":
                        case "PaymentAdvanceAmount":
                        case "MaxAdvanceAmmount":
                        case "HeaderInvoicedAmountDC":
                        case "InvoicedAmountDC":
                        case "HeaderDeliveredAmountDC":
                        case "DeliveredAmountDC":

                        // Begin 11.7.2023 Rubén Rollano - Format amounts
                        // Roll-out Spain
                        case "PendingDeliveredAmountDC":
                        case "PendingInvoicedAmountDC":
                        case "DeliveredAmountLC":
                        case "HeaderDeliveredAmountLC":
                        case "InvoicedAmountLC":
                        case "HeaderInvoicedAmountLC":
                        case "TotalPrice":
                        case "TotalPriceML":
                        case "GrossValue":
                        case "NetValueML":
                        case "NetValue":
                        case "Price":
                            // End 11.7.2023 Rubén Rollano - Format amounts

                            arrayColumn.push({
                                label: oColumns[i].getHeader().getProperty("text"),
                                property: sProperty,
                                type: sap.ui.export.EdmType.Currency,
                                unitProperty: "Currency",
                                displayUnit: false
                            });
                            break;
                        case "Quantity":
                            arrayColumn.push({
                                label: oColumns[i].getHeader().getProperty("text"),
                                property: sProperty,
                                type: sap.ui.export.EdmType.Currency,
                                unitProperty: "Unit",
                                displayUnit: false
                            });
                            break;

                        default:
                            arrayColumn.push({
                                label: oColumns[i].getHeader().getProperty("text"),
                                property: sProperty
                            });
                    }
                }
            }
        }
        return arrayColumn;
    }

});