/**
 * Created by Dewan Sarwar on 14/02/2019.
 * Model Discovery Tool
 */

"use strict";

var ModelDiscoveryPlatform = (function (global) {

    // Namespace for utility
    var mainUtils = {};

    // Model discovery
    var modelEntity = [], biologicalMeaning = [], speciesList = [], geneList = [],
        proteinList = [], head = [], discoverIndex = 0;

    // Related models
    var relatedModel = [], membraneModelObj = [], alternativeModelObj = [], relatedModelObj = [],
        modelEntityObj = [], membraneModelID = [], proteinName, proteinText, cellmlModel, biological_meaning,
        speciesName, geneName, compartmentName, locationName, idProtein = 0, idAltProtein = 0, idMembrane = 0,
        locationOfModel, typeOfModel, organIndex, relatedModelEntity = [], cotransporterList = [], counter = 0;

    // Table related
    var draggedMedPrID, typeOfSearchTerm, chebiURI, cellmlModelEntity,
        table = $("<table/>").addClass("table table-hover table-condensed"),
        thead = $("<thead/>"), tr = $("<tr/>"), tbody = $("<tbody/>");

    // Load the Home Page
    mainUtils.loadHomeHtml = function () {
        var htmlContent = "<div id=\"main-content\" class=\"container content\">\n" +
            "    <div class=\"container\">\n" +
            "        <div id=\"searchBox\" class=\"container input-group\">\n" +
            "            <div class=\"input-group-btn\">\n" +
            "                <div class=\"btn-group\" role=\"group\">\n" +
            "                    <div class=\"dropdown dropdown-lg\">\n" +
            "                        <button id=\"btnText\" type=\"button\" class=\"btn btn-default dropdown-toggle\"\n" +
            "                                data-toggle=\"dropdown\"\n" +
            "                                aria-haspopup=\"true\"\n" +
            "                                aria-expanded=\"false\">Discover CellML Models\n" +
            "                        </button>\n" +
            "                    </div>\n" +
            "                </div>\n" +
            "            </div>\n" +
            "            <input id=\"searchTxt\" name=\"searchTxt\" value=\"\" type=\"text\" placeholder=\"Search Models (e.g. Flux of Sodium)\"\n" +
            "                   class=\"form-control input-lg\" aria-label=\"...\">\n" +
            "        </div>\n" +
            "        </br>\n" +
            "\n" +
            "        <hr/>\n" +
            "\n" +
            "        <div id=\"searchList\" class=\"container\"></div>\n" +
            "    </div>\n" +
            "</div>\n";

        $("#main-content").html(htmlContent);
    };

    // Load the Documentation Page in github
    mainUtils.loadDocumentation = function () {
        var uri = "https://github.com/dewancse/model-discovery-tool";
        $("#main-content").html("Documentation can be found at " +
            "<a href=" + uri + " + target=_blank>README.md in github</a>");
    };

    // Discover CellML model section when users enter texts
    $(document).on("keydown", function (event) {
        if (event.key == "Enter") {

            var uriOPB, uriCHEBI, keyValue;
            var searchTxt = document.getElementById("searchTxt").value;

            // set local storage
            sessionStorage.setItem("searchTxtContent", searchTxt);

            // dictionary object
            for (var i in dictionary) {
                var key1 = searchTxt.indexOf("" + dictionary[i].key1 + ""),
                    key2 = searchTxt.indexOf("" + dictionary[i].key2 + "");

                if (key1 != -1 && key2 != -1) {
                    uriOPB = dictionary[i].opb;
                    uriCHEBI = dictionary[i].chebi;
                    keyValue = dictionary[i].key1;
                }
            }

            if (uriCHEBI == undefined) {
                var uri = "https://github.com/dewancse/model-discovery-tool#input-handling";
                $("#searchList").html("<div class='alert alert-warning'>" +
                    "<strong>Info!</strong> Please see input handling section at " +
                    "<a href=" + uri + " + target=_blank class='alert-link'>README.md in github</a></div>");
                return;
            }

            chebiURI = uriCHEBI.slice(1, uriCHEBI.length - 1);

            showLoading("#searchList");

            modelEntity = [];
            biologicalMeaning = [];
            speciesList = [];
            geneList = [];
            proteinList = [];
            head = [];

            discoverIndex = 0; // discoverIndex to index each Model_entity

            var query;
            if (uriCHEBI == "") { // model discovery with 'flux'
                typeOfSearchTerm = keyValue;
                query = discoveryWithFlux(uriOPB);
            }
            else {
                if (keyValue == "flux") { // model discovery with 'flux of sodium', etc.
                    typeOfSearchTerm = keyValue;
                    query = discoveryWithFluxOfSolute(uriCHEBI)
                }
                else { // model disocvery with 'concentration of sodium', etc.
                    typeOfSearchTerm = keyValue;
                    query = discoveryWithConcentrationOfSolute(uriCHEBI);
                }
            }

            // Model
            sendPostRequest(
                endpoint,
                query,
                function (jsonModel) {
                    // REMOVE duplicate cellml model and variable name (NOT component name)
                    jsonModel.results.bindings = uniqueifyjsonModel(jsonModel.results.bindings);
                    mainUtils.discoverModels(jsonModel);
                },
                true);
        }
    });

    // Retrieve search results from PMR by utilizing SPARQL queries
    mainUtils.discoverModels = function (jsonModel) {

        if (jsonModel.results.bindings.length == 0) {
            mainUtils.showDiscoverModels();
            return;
        }

        var model = parseModelName(jsonModel.results.bindings[discoverIndex].Model_entity.value);
        model = model + "#" + model.slice(0, model.indexOf("."));

        var query = "SELECT ?Protein WHERE { " + "<" + model + "> <http://www.obofoundry.org/ro/ro.owl#modelOf> ?Protein. }";

        sendPostRequest(
            endpoint,
            query,
            function (jsonProteinUri) {

                if (jsonProteinUri.results.bindings.length == 0) {
                    discoverIndex++;

                    if (discoverIndex != jsonModel.results.bindings.length) {
                        mainUtils.discoverModels(jsonModel);
                    }
                }

                // pig SGLT2 (PR_P31636) does not exist in PR ontology, assign mouse species instead
                // PR_P31636 is added in PR ontology
                var pr_uri, endpointproteinOLS;
                if (jsonProteinUri.results.bindings.length == 0) {
                    // pr_uri = undefined;
                    endpointproteinOLS = abiOntoEndpoint + "/pr";
                }
                else {
                    pr_uri = jsonProteinUri.results.bindings[0].Protein.value;

                    if (epithelialcellID.indexOf(pr_uri) != -1)
                        endpointproteinOLS = abiOntoEndpoint + "/cl/terms?iri=" + pr_uri;
                    else if (pr_uri.indexOf(partOfGOUri) != -1) {
                        endpointproteinOLS = abiOntoEndpoint + "/go/terms?iri=" + pr_uri;
                    }
                    else if (pr_uri.indexOf(partOfUBERONUri) != -1) {
                        endpointproteinOLS = abiOntoEndpoint + "/uberon/terms?iri=" + pr_uri;
                    }
                    else
                        endpointproteinOLS = abiOntoEndpoint + "/pr/terms?iri=" + pr_uri;
                }

                var query = mediatorSPARQL(jsonModel.results.bindings[discoverIndex].Model_entity.value);

                sendPostRequest(
                    endpoint,
                    query,
                    function (jsonepithelialobj) {

                        console.log("jsonepithelialobj: ", jsonepithelialobj);

                        // epithelial cell
                        if (epithelialcellID.indexOf(pr_uri) != -1) {
                            for (var i = 0; i < jsonepithelialobj.results.bindings.length; i++) {
                                var temp = jsonepithelialobj.results.bindings[i].mediator.value;

                                if (temp.indexOf(partOfProteinUri) != -1) {
                                    var mediatorURI = jsonepithelialobj.results.bindings[i].mediator.value;
                                    endpointproteinOLS = abiOntoEndpoint + "/pr/terms?iri=" + mediatorURI;
                                    break;
                                }
                            }
                        }

                        sendGetRequest(
                            endpointproteinOLS,
                            function (jsonProtein) {

                                var endpointgeneOLS;
                                if (jsonProtein._embedded.terms[0]._links.has_gene_template != undefined)
                                    endpointgeneOLS = jsonProtein._embedded.terms[0]._links.has_gene_template.href;
                                else
                                    endpointgeneOLS = abiOntoEndpoint + "/pr";

                                sendGetRequest(
                                    endpointgeneOLS,
                                    function (jsonGene) {

                                        var endpointspeciesOLS;
                                        if (jsonProtein._embedded.terms[0]._links.only_in_taxon != undefined)
                                            endpointspeciesOLS = jsonProtein._embedded.terms[0]._links.only_in_taxon.href;
                                        else
                                            endpointspeciesOLS = abiOntoEndpoint + "/pr";

                                        sendGetRequest(
                                            endpointspeciesOLS,
                                            function (jsonSpecies) {

                                                // model and biological meaning
                                                modelEntity.push(jsonModel.results.bindings[discoverIndex].Model_entity.value);
                                                biologicalMeaning.push(jsonModel.results.bindings[discoverIndex].Biological_meaning.value);

                                                // species
                                                if (jsonSpecies._embedded == undefined)
                                                    speciesList.push("Numerical model"); // Or undefined
                                                else
                                                    speciesList.push(jsonSpecies._embedded.terms[0].label);

                                                // gene
                                                if (jsonGene._embedded == undefined)
                                                    geneList.push("Numerical model"); // Or undefined
                                                else {
                                                    var geneName = jsonGene._embedded.terms[0].label;
                                                    geneName = geneName.slice(0, geneName.indexOf("(") - 1);
                                                    geneList.push(geneName); // Or undefined
                                                }

                                                // protein
                                                if (jsonProtein._embedded == undefined)
                                                    proteinList.push("Numerical model"); // Or undefined
                                                else {
                                                    var proteinName = jsonProtein._embedded.terms[0].label;
                                                    proteinName = proteinName.slice(0, proteinName.indexOf("(") - 1);
                                                    proteinList.push(proteinName);
                                                }

                                                head = ["Model Entity (click a model entity to expand)", "Biological Meaning", "Species", "Gene", "Protein"];

                                                // display this model entity and associated information
                                                mainUtils.showDiscoverModels(discoverIndex);

                                                discoverIndex++; // increment index of modelEntity
                                                if (discoverIndex == jsonModel.results.bindings.length) {
                                                    return;
                                                }

                                                mainUtils.discoverModels(jsonModel); // callback
                                            },
                                            true);
                                    },
                                    true);
                            },
                            true);
                    },
                    true);
            },
            true);
    };

    // Searching relevant annotated information when users click on a model entity
    var clickedModel = function () {
        // parsing
        cellmlModel = cellmlModelEntity;
        var indexOfHash = cellmlModel.search("#");
        cellmlModel = cellmlModel.slice(0, indexOfHash);

        cellmlModel = cellmlModel + "#" + cellmlModel.slice(0, cellmlModel.indexOf("."));

        var query;
        if (typeOfSearchTerm == "flux")
            query = typeOfSearchTermFluxSPARQL(cellmlModel, cellmlModelEntity);
        else if (typeOfSearchTerm == "concentration")
            query = typeOfSearchTermConSPARQL(cellmlModel, cellmlModelEntity);

        // console.log("query: ", query);

        // protein name
        sendPostRequest(
            endpoint,
            query,
            function (jsonModel) {

                console.log("jsonModel: ", jsonModel);

                // chebi URI
                if (jsonModel.results.bindings[0].chebi_uri.value != undefined) // flux
                    chebiURI = jsonModel.results.bindings[0].chebi_uri.value;
                else if (jsonModel.results.bindings[0].chebi_uriCon.value != undefined) // concentration
                    chebiURI = jsonModel.results.bindings[0].chebi_uriCon.value;

                console.log("chebi_uri: ", chebiURI);

                if (jsonModel.results.bindings.length == 0)
                    proteinName = undefined;
                else
                    proteinName = jsonModel.results.bindings[0].Protein.value;

                var endpointprOLS;
                if (proteinName != undefined) {
                    if (epithelialcellID.indexOf(proteinName) != -1)
                        endpointprOLS = abiOntoEndpoint + "/cl/terms?iri=" + proteinName;
                    else if (proteinName.indexOf(partOfUBERONUri) != -1)
                        endpointprOLS = abiOntoEndpoint + "/uberon/terms?iri=" + proteinName;
                    else
                        endpointprOLS = abiOntoEndpoint + "/pr/terms?iri=" + proteinName;
                }
                else
                    endpointprOLS = abiOntoEndpoint + "/pr";

                sendGetRequest(
                    endpointprOLS,
                    function (jsonPr) {

                        var endpointgeneOLS;
                        if (jsonPr._embedded == undefined || jsonPr._embedded.terms[0]._links.has_gene_template == undefined)
                            endpointgeneOLS = abiOntoEndpoint + "/pr";
                        else
                            endpointgeneOLS = jsonPr._embedded.terms[0]._links.has_gene_template.href;

                        sendGetRequest(
                            endpointgeneOLS,
                            function (jsonGene) {

                                var endpointspeciesOLS;
                                if (jsonPr._embedded == undefined || jsonPr._embedded.terms[0]._links.only_in_taxon == undefined)
                                    endpointspeciesOLS = abiOntoEndpoint + "/pr";
                                else
                                    endpointspeciesOLS = jsonPr._embedded.terms[0]._links.only_in_taxon.href;

                                sendGetRequest(
                                    endpointspeciesOLS,
                                    function (jsonSpecies) {

                                        var query = "SELECT ?Compartment " +
                                            "WHERE { " + "<" + cellmlModel + "> <http://www.obofoundry.org/ro/ro.owl#compartmentOf> ?Compartment. }";

                                        sendPostRequest(
                                            endpoint,
                                            query,
                                            function (jsonObjCompartment) {

                                                var query = "SELECT ?Located_in " +
                                                    "WHERE { " + "<" + cellmlModel + "> <http://www.obofoundry.org/ro/ro.owl#located_in> ?Located_in. }";

                                                sendPostRequest(
                                                    endpoint,
                                                    query,
                                                    function (jsonObjLocation) {

                                                        if (jsonPr._embedded == undefined)
                                                            proteinText = "Numerical model"; // Or undefined
                                                        else {
                                                            proteinText = jsonPr._embedded.terms[0].label;
                                                            proteinText = proteinText.slice(0, proteinText.indexOf("(") - 1);
                                                        }

                                                        if (jsonModel.results.bindings.length == 0)
                                                            biological_meaning = "";
                                                        else {
                                                            biological_meaning = jsonModel.results.bindings[0].Biological_meaning.value;
                                                        }

                                                        if (jsonSpecies._embedded == undefined)
                                                            speciesName = "Numerical model"; // Or undefined
                                                        else
                                                            speciesName = jsonSpecies._embedded.terms[0].label;

                                                        if (jsonGene._embedded == undefined)
                                                            geneName = "Numerical model"; // Or undefined
                                                        else {
                                                            geneName = jsonGene._embedded.terms[0].label;
                                                            geneName = geneName.slice(0, geneName.indexOf("(") - 1);
                                                        }

                                                        // compartment and location in LOAD MODELS
                                                        compartmentandlocation(
                                                            jsonObjCompartment.results.bindings,
                                                            jsonObjLocation.results.bindings);
                                                    },
                                                    true);
                                            },
                                            true);
                                    }, true);
                            }, true);
                    }, true);
            },
            true
        );
    };

    // Identifying compartment and anatomical location
    var compartmentandlocation = function (compartment, location) {

        var tempCompartment = "", counterOLS = 0;

        for (var i in compartment) {

            var fma_uri = compartment[i].Compartment.value;
            fma_uri = "http://purl.org/sig/ont/fma/fma" + fma_uri.slice(fma_uri.indexOf("FMA_") + 4);

            var endpointOLS = abiOntoEndpoint + "/fma/terms?iri=" + fma_uri;

            sendGetRequest(
                endpointOLS,
                function (jsonObjOLS) {

                    counterOLS++;
                    tempCompartment += jsonObjOLS._embedded.terms[0].label;

                    if (counterOLS < compartment.length) tempCompartment += ", ";
                    else tempCompartment += "";

                    if (counterOLS == compartment.length) {

                        var tempLocation = "", counterOLSLoc = 0;
                        for (var i in location) {

                            var fma_uri = location[i].Located_in.value;
                            fma_uri = "http://purl.org/sig/ont/fma/fma" + fma_uri.slice(fma_uri.indexOf("FMA_") + 4);

                            var endpointOLS = abiOntoEndpoint + "/fma/terms?iri=" + fma_uri;

                            sendGetRequest(
                                endpointOLS,
                                function (jsonObjOLSLocation) {

                                    counterOLSLoc++;
                                    tempLocation += jsonObjOLSLocation._embedded.terms[0].label;

                                    if (counterOLSLoc < location.length) tempLocation += ", ";
                                    else tempLocation += "";

                                    if (counterOLSLoc == location.length) {

                                        compartmentName = tempCompartment;
                                        locationName = tempLocation;

                                        clickedModelExtended();
                                    }
                                },
                                true);
                        }
                    }
                },
                true);
        }
    };

    // Remaining part of clickedModel function
    var clickedModelExtended = function () {

        console.log("cellmlModel: ", cellmlModel);

        var query = locatedInSPARQL(cellmlModel);

        // location of that cellml model
        sendPostRequest(
            endpoint,
            query,
            function (jsonLocatedin) {

                console.log("jsonLocatedin: ", jsonLocatedin);

                var jsonLocatedinCounter = 0;
                // Type of model - kidney, lung, etc
                for (var i = 0; i < jsonLocatedin.results.bindings.length; i++) {
                    for (var j = 0; j < organ.length; j++) {
                        var flag = 0;
                        for (var k = 0; k < organ[j].key.length; k++) {
                            if (jsonLocatedin.results.bindings[i].located_in.value == organ[j].key[k].key) {
                                jsonLocatedinCounter++;
                                flag = 1;

                                if (jsonLocatedinCounter == jsonLocatedin.results.bindings.length) {
                                    typeOfModel = organ[j].value;
                                    organIndex = j;
                                }

                                break;
                            }
                        }

                        if (flag == 1) break;
                    }
                    if (jsonLocatedinCounter == jsonLocatedin.results.bindings.length)
                        break;
                }

                console.log("TYPE OF MODEL: ", typeOfModel);

                locationOfModel = "";
                jsonLocatedinCounter = 0;
                // location of the above type of model
                for (var i = 0; i < jsonLocatedin.results.bindings.length; i++) {
                    for (var j = 0; j < organ[organIndex].key.length; j++) {
                        if (jsonLocatedin.results.bindings[i].located_in.value == organ[organIndex].key[j].key) {
                            locationOfModel += organ[organIndex].key[j].value;

                            if (i == jsonLocatedin.results.bindings.length - 1)
                                locationOfModel += ".";
                            else
                                locationOfModel += ", ";

                            jsonLocatedinCounter++;
                        }
                        if (jsonLocatedinCounter == jsonLocatedin.results.bindings.length)
                            break;
                    }
                    if (jsonLocatedinCounter == jsonLocatedin.results.bindings.length)
                        break;
                }

                // related cellml model, i.e. kidney, lungs, etc
                query = locatedInCellMLModelSPARQL();

                sendPostRequest(
                    endpoint,
                    query,
                    function (jsonRelatedModel) {

                        console.log("jsonRelatedModel: ", jsonRelatedModel);
                        console.log("cellmlModelEntity: ", cellmlModelEntity);

                        var query = medEntityUriAndPr(cellmlModelEntity);

                        sendPostRequest(
                            endpoint,
                            query,
                            function (jsonMediator) {

                                console.log("jsonMediator: ", jsonMediator);

                                for (var i = 0; i < jsonRelatedModel.results.bindings.length; i++) {
                                    for (var j = 0; j < organ[organIndex].key.length; j++) {
                                        if (jsonRelatedModel.results.bindings[i].located_in.value == organ[organIndex].key[j].key) {
                                            // parsing
                                            var tempModel = jsonRelatedModel.results.bindings[i].cellmlmodel.value;
                                            var indexOfHash = tempModel.search("#");
                                            tempModel = tempModel.slice(0, indexOfHash);

                                            relatedModel.push(tempModel);

                                            break;
                                        }
                                    }
                                }

                                relatedModel = uniqueify(relatedModel);

                                var alternativeCellmlArray = [], tempcellmlModel,
                                    indexOfHash = cellmlModel.search("#");
                                tempcellmlModel = cellmlModel.slice(0, indexOfHash);
                                for (var i = 0; i < relatedModel.length; i++) {
                                    if (relatedModel[i] != tempcellmlModel) {
                                        alternativeCellmlArray.push(relatedModel[i]);
                                    }
                                }

                                var membrane;
                                for (var i = 0; i < jsonMediator.results.bindings.length; i++) {
                                    var mediatorValue = jsonMediator.results.bindings[i].med_entity_uri.value;
                                    draggedMedPrID = jsonMediator.results.bindings[i].med_entity_uriPr.value;

                                    console.log("mediatorValue and draggedMedPrID: ", mediatorValue, draggedMedPrID);

                                    if (mediatorValue == apicalID)
                                        membrane = apicalID;
                                    else if (mediatorValue == basolateralID)
                                        membrane = basolateralID;
                                    else if (mediatorValue == paracellularID)
                                        membrane = paracellularID;
                                }

                                if (membrane == undefined) {
                                    for (var i = 0; i < jsonLocatedin.results.bindings.length; i++) {
                                        if (jsonLocatedin.results.bindings[i].located_in.value == apicalID)
                                            membrane = apicalID;
                                        else if (jsonLocatedin.results.bindings[i].located_in.value == basolateralID)
                                            membrane = basolateralID;
                                        else if (jsonLocatedin.results.bindings[i].located_in.value == paracellularID)
                                            membrane = paracellularID;
                                    }
                                }

                                console.log("membrane clickedModelExtended: ", membrane);

                                console.log("relatedModel: ", relatedModel);
                                relatedCellmlModel(relatedModel, alternativeCellmlArray, membrane);
                            },
                            true);
                    },
                    true);
            },
            true);
    };

    // Related kidney, lungs, etc model
    var relatedCellmlModel = function (relatedModel, alternativeCellmlArray, membrane) {

        var modelname, indexOfcellml, query;
        if (relatedModel[idProtein] == undefined) {
            modelname = undefined;
        }
        else {
            indexOfcellml = relatedModel[idProtein].search(".cellml");
            modelname = relatedModel[idProtein] + "#" + relatedModel[idProtein].slice(0, indexOfcellml);
        }

        // console.log("modelname in relatedCellmlModel: ", modelname);

        query = proteinSPARQL(modelname);

        sendPostRequest(
            endpoint,
            query,
            function (jsonProtein) {

                var endpointprOLS;
                if (jsonProtein.results.bindings.length == 0)
                    endpointprOLS = abiOntoEndpoint + "/pr";
                else {
                    var pr_uri = jsonProtein.results.bindings[0].Protein.value;
                    if (epithelialcellID.indexOf(pr_uri) != -1)
                        endpointprOLS = abiOntoEndpoint + "/cl/terms?iri=" + pr_uri;
                    else if (pr_uri.indexOf(partOfUBERONUri) != -1)
                        endpointprOLS = abiOntoEndpoint + "/uberon/terms?iri=" + pr_uri;
                    else
                        endpointprOLS = abiOntoEndpoint + "/pr/terms?iri=" + pr_uri;
                }

                sendGetRequest(
                    endpointprOLS,
                    function (jsonPr) {

                        if (jsonProtein.results.bindings.length != 0) {
                            if (typeOfModel == checkTypeOfModel(ProteinToOrganDict, jsonProtein.results.bindings[0].Protein.value)) {
                                relatedModelObj.push({
                                    protein: jsonProtein.results.bindings[0].Protein.value,
                                    prname: jsonPr._embedded.terms[0].label,
                                    workspaceName: jsonProtein.results.bindings[0].workspaceName.value,
                                    modelEntity: relatedModel[idProtein] // relatedModel which have #protein
                                });
                            }
                        }

                        if (idProtein == relatedModel.length - 1) {
                            idProtein = 0;
                            alternativeCellmlModel(alternativeCellmlArray, membrane);
                            return;
                        }

                        idProtein++;
                        relatedCellmlModel(relatedModel, alternativeCellmlArray, membrane);
                    },
                    true);
            },
            true);
    };

    // Alternative model of a dragged transporter, e.g. rat NHE3, mouse NHE3
    var alternativeCellmlModel = function (alternativeCellmlArray, membrane) {

        // console.log("alternativeCellmlArray: ", alternativeCellmlArray[idAltProtein], membrane, alternativeCellmlArray);
        var modelname, indexOfcellml, endpointOLS;
        if (alternativeCellmlArray[idAltProtein] == undefined) {
            modelname = undefined;
        }
        else {
            indexOfcellml = alternativeCellmlArray[idAltProtein].search(".cellml");
            modelname = alternativeCellmlArray[idAltProtein] + "#" +
                alternativeCellmlArray[idAltProtein].slice(0, indexOfcellml);
        }
        // console.log("modelname in alternativeCellmlModel: ", modelname);

        var query = proteinSPARQL(modelname);

        sendPostRequest(
            endpoint,
            query,
            function (jsonAltProtein) {

                if (jsonAltProtein.results.bindings.length == 0)
                    endpointOLS = abiOntoEndpoint + "/pr";
                else {
                    var pr_uri = jsonAltProtein.results.bindings[0].Protein.value;
                    if (epithelialcellID.indexOf(pr_uri) != -1)
                        endpointOLS = abiOntoEndpoint + "/cl/terms?iri=" + pr_uri;
                    else if (pr_uri.indexOf(partOfUBERONUri) != -1)
                        endpointOLS = abiOntoEndpoint + "/uberon/terms?iri=" + pr_uri;
                    else
                        endpointOLS = abiOntoEndpoint + "/pr/terms?iri=" + pr_uri;
                }

                sendGetRequest(
                    endpointOLS,
                    function (jsonOLSObj) {

                        if (jsonAltProtein.results.bindings.length != 0) {

                            if (jsonAltProtein.results.bindings[0].Protein.value == proteinName) { // comment this
                                alternativeModelObj.push({
                                    protein: jsonAltProtein.results.bindings[0].Protein.value,
                                    prname: jsonOLSObj._embedded.terms[0].label,
                                    modelEntity: modelname,
                                    workspaceName: jsonAltProtein.results.bindings[0].workspaceName.value
                                });
                            }
                        }

                        idAltProtein++;

                        if (idAltProtein == alternativeCellmlArray.length - 1) {

                            idAltProtein = 0;

                            // If apical Then basolateral and vice versa
                            var membraneName;
                            if (membrane == apicalID) {
                                membrane = basolateralID;
                                membraneName = "Basolateral membrane";
                            }
                            else if (membrane == basolateralID) {
                                membrane = apicalID;
                                membraneName = "Apical membrane";
                            }
                            else if (membrane == paracellularID) {
                                membrane = paracellularID;
                                membraneName = "Paracellular membrane";
                            }

                            console.log("membrane and membraneName: ", membrane, membraneName);

                            relatedMembrane(membrane, membraneName);
                            // showCollapsibleSpace(membraneName, ModelEntity);
                            return;
                        }

                        alternativeCellmlModel(alternativeCellmlArray, membrane);
                    },
                    true);
            }, true);
    };

    // Making cotransporter of fluxes
    var makecotransporter = function (membrane1, membrane2, fluxList, membraneName) {
        var query = makecotransporterSPARQL(membrane1, membrane2);
        sendPostRequest(
            endpoint,
            query,
            function (jsonObj) {
                // console.log("jsonObj in makecotransporter: ", jsonObj);
                var tempProtein = [], tempFMA = [];
                for (var m = 0; m < jsonObj.results.bindings.length; m++) {
                    var tmpPro = jsonObj.results.bindings[m].med_entity_uri.value;
                    var tmpFMA = jsonObj.results.bindings[m].med_entity_uriFMA.value;

                    if (tmpPro.indexOf("http://purl.obolibrary.org/obo/PR_") != -1) {
                        tempProtein.push(jsonObj.results.bindings[m].med_entity_uri.value);
                    }

                    if (tmpFMA.indexOf("http://purl.obolibrary.org/obo/FMA_") != -1) {
                        tempFMA.push(jsonObj.results.bindings[m].med_entity_uriFMA.value);
                    }
                }

                // remove duplicate protein ID
                // TODO: probably no need to do this!
                tempProtein = tempProtein.filter(function (item, pos) {
                    return tempProtein.indexOf(item) == pos;
                });
                tempFMA = tempFMA.filter(function (item, pos) {
                    return tempFMA.indexOf(item) == pos;
                });

                // console.log("tempProtein, and fma: ", tempProtein, tempFMA);

                for (var i in tempProtein) {
                    // cotransporter
                    if (tempProtein.length != 0 && tempFMA.length != 0) {
                        cotransporterList.push({
                            "membrane1": membrane1,
                            "membrane2": membrane2
                        });
                    }
                }

                counter++;

                if (counter == iteration(fluxList.length)) {

                    // delete cotransporter indices from fluxList
                    for (var i in cotransporterList) {
                        for (var j in fluxList) {
                            if (cotransporterList[i].membrane1 == fluxList[j] ||
                                cotransporterList[i].membrane2 == fluxList[j]) {

                                fluxList.splice(j, 1);
                            }
                        }
                    }

                    // make cotransproter in modelEntityObj
                    for (var i in cotransporterList) {
                        modelEntityObj.push({
                            "model_entity": cotransporterList[i].membrane1,
                            "model_entity2": cotransporterList[i].membrane2
                        });
                    }

                    // make flux in modelEntityObj
                    for (var i in fluxList) {
                        modelEntityObj.push({
                            "model_entity": fluxList[i],
                            "model_entity2": ""
                        });
                    }

                    relatedMembraneModel(membraneName, cotransporterList);
                    return;
                }
            },
            true);
    };

    // Related apical or basolateral membrane in PMR
    var relatedMembrane = function (membrane, membraneName) {
        console.log("relatedMembrane: ", membrane, membraneName);
        var fstCHEBI, sndCHEBI;
        fstCHEBI = chebiURI;
        sndCHEBI = fstCHEBI;

        console.log("chebiURI: ", chebiURI);
        console.log("fstCHEBI: ", fstCHEBI);
        console.log("sndCHEBI: ", sndCHEBI);

        var query = relatedMembraneSPARQL(fstCHEBI, sndCHEBI, membrane);

        sendPostRequest(
            endpoint,
            query,
            function (jsonRelatedMembrane) {

                console.log("jsonRelatedMembrane: ", jsonRelatedMembrane);

                var fluxList = [], cotransporterList = [];
                for (var i = 0; i < jsonRelatedMembrane.results.bindings.length; i++) {

                    // allow only related apical or basolateral membrane from my workspace
                    if (jsonRelatedMembrane.results.bindings[i].g.value != myWorkspaneName)
                        continue;

                    fluxList.push(jsonRelatedMembrane.results.bindings[i].Model_entity.value);
                }

                var tempfluxList = [];
                for (var i = 0; i < fluxList.length; i++) {
                    if (!isExist(fluxList[i], tempfluxList)) {
                        tempfluxList.push(fluxList[i]);
                    }
                }

                fluxList = tempfluxList;
                if (fluxList.length <= 1) {
                    console.log("fluxList.length <= 1");
                    modelEntityObj.push({
                        "model_entity": fluxList[0],
                        "model_entity2": ""
                    });

                    relatedMembraneModel(membraneName, cotransporterList);
                    return;
                }
                else {
                    console.log("fluxList.length >= 1");
                    for (var i = 0; i < fluxList.length; i++) {
                        for (var j = i + 1; j < fluxList.length; j++) {
                            makecotransporter(fluxList[i], fluxList[j], fluxList, membraneName);
                        }
                    }
                }
            },
            true);
    };

    var source_fma = [], sink_fma = [], med_fma = [], med_pr = [], solute_chebi = [];
    var source_fma2 = [], sink_fma2 = [], solute_chebi2 = [];

    // Related apical or basolateral membrane models in PMR
    var relatedMembraneModel = function (membraneName, cotransporterList) {

        var tempmembraneModel, indexOfHash, indexOfcellml, modelname, query;
        if (modelEntityObj.length == 0 || modelEntityObj[idMembrane].model_entity == undefined)
            tempmembraneModel = undefined;
        else {
            indexOfHash = modelEntityObj[idMembrane].model_entity.search("#");
            tempmembraneModel = modelEntityObj[idMembrane].model_entity.slice(0, indexOfHash);

            indexOfcellml = tempmembraneModel.search(".cellml");
            modelname = tempmembraneModel.slice(0, indexOfcellml);

            tempmembraneModel = tempmembraneModel + "#" + modelname;
        }

        query = relatedMembraneModelModelOf(tempmembraneModel);

        sendPostRequest(
            endpoint,
            query,
            function (jsonRelatedMembraneModel) {

                // console.log("relatedMembraneModel: jsonRelatedMembraneModel -> ", jsonRelatedMembraneModel);

                var endpointprOLS;
                if (jsonRelatedMembraneModel.results.bindings.length == 0) {
                    showCollapsibleSpace(membraneName);
                    return;
                } else {
                    var pr_uri = jsonRelatedMembraneModel.results.bindings[0].Protein.value;
                    if (epithelialcellID.indexOf(pr_uri) != -1)
                        endpointprOLS = abiOntoEndpoint + "/cl/terms?iri=" + pr_uri;
                    else if (pr_uri.indexOf(partOfUBERONUri) != -1)
                        endpointprOLS = abiOntoEndpoint + "/uberon/terms?iri=" + pr_uri;
                    else
                        endpointprOLS = abiOntoEndpoint + "/pr/terms?iri=" + pr_uri;
                }

                sendGetRequest(
                    endpointprOLS,
                    function (jsonPr) {

                        var query = relatedMembraneModelSPARQL(modelEntityObj[idMembrane].model_entity, modelEntityObj[idMembrane].model_entity2);

                        // console.log("query: ", query);

                        sendPostRequest(
                            endpoint,
                            query,
                            function (jsonObjFlux) {

                                var endpointOLS;
                                if (jsonObjFlux.results.bindings[0].solute_chebi == undefined) {
                                    endpointOLS = undefined;
                                }
                                else {
                                    var chebi_uri = jsonObjFlux.results.bindings[0].solute_chebi.value,
                                        endpointOLS = abiOntoEndpoint + "/chebi/terms?iri=" + chebi_uri;
                                }

                                sendGetRequest(
                                    endpointOLS,
                                    function (jsonObjOLSChebi) {

                                        var endpointOLS2;
                                        if (jsonObjFlux.results.bindings[0].solute_chebi2 == undefined) {
                                            endpointOLS2 = undefined;
                                        }
                                        else {
                                            var chebi_uri2 = jsonObjFlux.results.bindings[0].solute_chebi2.value,
                                                endpointOLS2 = abiOntoEndpoint + "/chebi/terms?iri=" + chebi_uri2;
                                        }

                                        sendGetRequest(
                                            endpointOLS2,
                                            function (jsonObjOLSChebi2) {

                                                for (var i = 0; i < jsonObjFlux.results.bindings.length; i++) {
                                                    // solute chebi
                                                    var temparr = jsonObjOLSChebi._embedded.terms[0].annotation["has_related_synonym"],
                                                        solute_chebi_name;
                                                    for (var m = 0; m < temparr.length; m++) {
                                                        if (temparr[m].slice(-1) == "+" || temparr[m].slice(-1) == "-") {
                                                            solute_chebi_name = temparr[m];
                                                            break;
                                                        }
                                                    }

                                                    if (jsonObjFlux.results.bindings[i].solute_chebi == undefined)
                                                        solute_chebi.push("");
                                                    else
                                                        solute_chebi.push({
                                                            name: solute_chebi_name,
                                                            uri: jsonObjFlux.results.bindings[i].solute_chebi.value
                                                        });

                                                    // solute chebi 2
                                                    var temparr2 = jsonObjOLSChebi2._embedded.terms[0].annotation["has_related_synonym"],
                                                        solute_chebi_name2;
                                                    for (var m = 0; m < temparr2.length; m++) {
                                                        if (temparr2[m].slice(-1) == "+" || temparr2[m].slice(-1) == "-") {
                                                            solute_chebi_name2 = temparr2[m];
                                                            break;
                                                        }
                                                    }

                                                    if (jsonObjFlux.results.bindings[i].solute_chebi2 == undefined)
                                                        solute_chebi2.push("");
                                                    else
                                                        solute_chebi2.push({
                                                            name: solute_chebi_name2,
                                                            uri: jsonObjFlux.results.bindings[i].solute_chebi2.value
                                                        });

                                                    // source fma
                                                    if (jsonObjFlux.results.bindings[i].source_fma == undefined)
                                                        source_fma.push("");
                                                    else
                                                        source_fma.push({fma: jsonObjFlux.results.bindings[i].source_fma.value});

                                                    // source fma 2
                                                    if (jsonObjFlux.results.bindings[i].source_fma2 == undefined)
                                                        source_fma2.push("");
                                                    else
                                                        source_fma2.push({fma2: jsonObjFlux.results.bindings[i].source_fma2.value});

                                                    // sink fma
                                                    if (jsonObjFlux.results.bindings[i].sink_fma == undefined)
                                                        sink_fma.push("");
                                                    else
                                                        sink_fma.push({fma: jsonObjFlux.results.bindings[i].sink_fma.value});

                                                    // sink fma 2
                                                    if (jsonObjFlux.results.bindings[i].sink_fma2 == undefined)
                                                        sink_fma2.push("");
                                                    else
                                                        sink_fma2.push({fma2: jsonObjFlux.results.bindings[i].sink_fma2.value});

                                                    // med pr
                                                    if (jsonObjFlux.results.bindings[i].med_entity_uriPR == undefined) {
                                                        med_pr.push("");
                                                    }
                                                    else {
                                                        med_pr.push({
                                                            // name of med_pr from OLS
                                                            // TODO: J_sc_K two PR and one FMA URI!!
                                                            med_pr: jsonObjFlux.results.bindings[i].med_entity_uriPR.value
                                                        });
                                                    }

                                                    if (jsonObjFlux.results.bindings[i].med_entity_uriFMA == undefined) {
                                                        med_fma.push("");
                                                    }
                                                    else {
                                                        med_fma.push({
                                                            med_fma: jsonObjFlux.results.bindings[i].med_entity_uriFMA.value
                                                        });
                                                    }
                                                }

                                                // remove duplicate fma
                                                solute_chebi = uniqueifyEpithelial(solute_chebi);
                                                solute_chebi2 = uniqueifyEpithelial(solute_chebi2);
                                                source_fma = uniqueifyEpithelial(source_fma);
                                                sink_fma = uniqueifyEpithelial(sink_fma);
                                                source_fma2 = uniqueifyEpithelial(source_fma2);
                                                sink_fma2 = uniqueifyEpithelial(sink_fma2);
                                                med_pr = uniqueifyEpithelial(med_pr);
                                                med_fma = uniqueifyEpithelial(med_fma);

                                                if (jsonRelatedMembraneModel.results.bindings.length != 0) {

                                                    var tempVal, PID;
                                                    if (med_pr.length == 0) {
                                                        tempVal = jsonRelatedMembraneModel.results.bindings[0].Protein.value;
                                                        PID = tempVal.slice(tempVal.search("PR_") + 3, tempVal.length);
                                                    }
                                                    else {
                                                        tempVal = med_pr[0].med_pr;
                                                        PID = tempVal.slice(tempVal.search("PR_") + 3, tempVal.length);

                                                        // If PID start with 0 digit
                                                        if (PID.charAt(0) != "P") {
                                                            if (PID.charAt(0) != "Q") {
                                                                PID = "P" + PID.replace(/^0+/, ""); // Or parseInt("065", 10)
                                                            }
                                                        }
                                                    }

                                                    membraneModelObj.push({
                                                        protein: jsonRelatedMembraneModel.results.bindings[0].Protein.value,
                                                        pid: PID, // med PID
                                                        prname: jsonPr._embedded.terms[0].label,
                                                        medfma: med_fma[0].med_fma, //combinedMembrane[0].med_fma,
                                                        medpr: tempVal,
                                                        similar: 0 // initial percent
                                                    });

                                                    var sourcefma2, sinkfma2, modelentity2, variabletext,
                                                        variabletext2, sourcefma, sinkfma, solutechebi2, medfma, medpr,
                                                        solutetext2, solutechebi, solutetext, indexOfdot, indexOfHash;

                                                    if (modelEntityObj[idMembrane].model_entity2 == "") {

                                                        indexOfHash = modelEntityObj[idMembrane].model_entity.search("#");
                                                        variabletext = modelEntityObj[idMembrane].model_entity.slice(indexOfHash + 1);
                                                        indexOfdot = variabletext.indexOf(".");

                                                        variabletext = variabletext.slice(indexOfdot + 1);

                                                        var tempjsonObjFlux = uniqueifyjsonFlux(jsonObjFlux.results.bindings);

                                                        // console.log("tempjsonObjFlux: ", tempjsonObjFlux);

                                                        if (tempjsonObjFlux.length == 1) {
                                                            var vartext2;
                                                            if (med_pr.length != 0) {
                                                                if (med_pr[0].med_pr == Nachannel || med_pr[0].med_pr == Kchannel ||
                                                                    med_pr[0].med_pr == Clchannel) {
                                                                    vartext2 = "channel";
                                                                }
                                                                else if (tempjsonObjFlux[0].source_fma.value == luminalID &&
                                                                    tempjsonObjFlux[0].sink_fma.value == interstitialID) {
                                                                    vartext2 = "diffusiveflux";
                                                                }
                                                                else {
                                                                    vartext2 = "flux"; // flux
                                                                }
                                                            }

                                                            // TODO: ??
                                                            if (med_pr.length == 0) {
                                                                vartext2 = "flux"; // "no mediator"
                                                            }

                                                            // console.log("vartext2, med_pr: ", vartext2, med_pr);

                                                            sourcefma = tempjsonObjFlux[0].source_fma.value;
                                                            sinkfma = tempjsonObjFlux[0].sink_fma.value;
                                                            solutechebi = solute_chebi[0].uri;
                                                            solutetext = solute_chebi[0].name;
                                                            medfma = med_fma[0].med_fma;

                                                            if (med_pr.length != 0) {
                                                                medpr = med_pr[0].med_pr; // TODO: J_Sc_Na has 2 PR and 1 FMA URIs!! Fix this!!
                                                            }
                                                            else {
                                                                medpr = "";
                                                            }

                                                            modelentity2 = "";
                                                            if (vartext2 == "channel" || vartext2 == "diffusiveflux") {
                                                                sourcefma2 = vartext2;
                                                                sinkfma2 = vartext2;
                                                                variabletext2 = vartext2; // flux/channel/diffusiveflux
                                                                solutechebi2 = vartext2;
                                                                solutetext2 = vartext2;
                                                            }
                                                            else {
                                                                sourcefma2 = "";
                                                                sinkfma2 = "";
                                                                variabletext2 = vartext2; // flux/channel/diffusiveflux
                                                                solutechebi2 = "";
                                                                solutetext2 = "";
                                                            }
                                                        }
                                                        else {
                                                            // same solute - J_Na in mackenzie model
                                                            if (tempjsonObjFlux.length == 2 && modelEntityObj[idMembrane].model_entity2 == "") {
                                                                modelentity2 = modelEntityObj[idMembrane].model_entity;
                                                                sourcefma = tempjsonObjFlux[0].source_fma.value;
                                                                sinkfma = tempjsonObjFlux[0].sink_fma.value;
                                                                sourcefma2 = tempjsonObjFlux[1].source_fma.value;
                                                                sinkfma2 = tempjsonObjFlux[1].sink_fma.value;
                                                                medfma = med_fma[0].med_fma;

                                                                if (med_pr.length != 0) {
                                                                    medpr = med_pr[0].med_pr;
                                                                }
                                                                else {
                                                                    medpr = "";
                                                                }

                                                                variabletext2 = variabletext;
                                                                solutechebi = solute_chebi[0].uri;
                                                                solutetext = solute_chebi[0].name;
                                                                solutechebi2 = solutechebi;
                                                                solutetext2 = solutetext;
                                                            }
                                                        }
                                                    }
                                                    else {
                                                        indexOfHash = modelEntityObj[idMembrane].model_entity.search("#");
                                                        variabletext = modelEntityObj[idMembrane].model_entity.slice(indexOfHash + 1);
                                                        indexOfdot = variabletext.indexOf(".");
                                                        variabletext = variabletext.slice(indexOfdot + 1);

                                                        indexOfHash = modelEntityObj[idMembrane].model_entity2.search("#");
                                                        variabletext2 = modelEntityObj[idMembrane].model_entity2.slice(indexOfHash + 1);
                                                        indexOfdot = variabletext2.indexOf(".");
                                                        variabletext2 = variabletext2.slice(indexOfdot + 1);

                                                        modelentity2 = modelEntityObj[idMembrane].model_entity2;
                                                        sourcefma = source_fma[0].fma;
                                                        sinkfma = sink_fma[0].fma;
                                                        sourcefma2 = source_fma2[0].fma2;
                                                        sinkfma2 = sink_fma2[0].fma2;
                                                        solutechebi = solute_chebi[0].uri;
                                                        solutetext = solute_chebi[0].name;
                                                        solutechebi2 = solute_chebi2[0].uri;
                                                        solutetext2 = solute_chebi2[0].name;
                                                        medfma = med_fma[0].med_fma;
                                                        medpr = med_pr[0].med_pr;
                                                    }
                                                }

                                                // console.log("medpr, protein.value: ", medpr, jsonRelatedMembraneModel, jsonRelatedMembraneModel.results.bindings[0].Protein.value);

                                                var medURI, endpointOLS;
                                                if (medpr == undefined || medpr == "") {
                                                    medURI = jsonRelatedMembraneModel.results.bindings[0].Protein.value;
                                                }
                                                else
                                                    medURI = medpr;

                                                // console.log("medURI: ", medURI);

                                                if (medURI.indexOf(partOfCHEBIUri) != -1) {
                                                    endpointOLS = abiOntoEndpoint + "/chebi/terms?iri=" + medURI;
                                                }
                                                else if (medURI.indexOf(partOfGOUri) != -1) {
                                                    endpointOLS = abiOntoEndpoint + "/go/terms?iri=" + medURI;
                                                }
                                                else if (medURI.indexOf(partOfCellUri) != -1) {
                                                    endpointOLS = abiOntoEndpoint + "/cl/terms?iri=" + medURI;
                                                }
                                                else
                                                    endpointOLS = abiOntoEndpoint + "/pr/terms?iri=" + medURI;

                                                sendGetRequest(
                                                    endpointOLS,
                                                    function (jsonObjOLSMedPr) {

                                                        // console.log("relatedMembraneModel: jsonObjOLSMedPr: ", jsonObjOLSMedPr);

                                                        var tempvar, med_pr_text_syn;
                                                        if (medURI.indexOf(partOfCellUri) != -1) {
                                                            med_pr_text_syn = "epithelial cell";
                                                        }
                                                        else {
                                                            if (jsonObjOLSMedPr._embedded.terms[0].annotation["has_related_synonym"] == undefined) {
                                                                med_pr_text_syn = jsonObjOLSMedPr._embedded.terms[0].annotation["id"][0].slice(3);
                                                            }
                                                            else {
                                                                tempvar = jsonObjOLSMedPr._embedded.terms[0].annotation["has_related_synonym"];
                                                                med_pr_text_syn = tempvar[0].toUpperCase();
                                                            }
                                                        }

                                                        membraneModelID.push([
                                                            modelEntityObj[idMembrane].model_entity, // model_entity
                                                            modelentity2, // model_entity2
                                                            variabletext, // variable_text
                                                            variabletext2, // variable_text2
                                                            sourcefma,
                                                            sinkfma,
                                                            sourcefma2,
                                                            sinkfma2,
                                                            medfma, // jsonObjFlux.results.bindings[0].med_entity_uri.value, // med_fma
                                                            medpr, // med_pr, e.g. mediator in a cotransporter protein
                                                            solutechebi, // solute_chebi
                                                            solutechebi2, // solute_chebi2
                                                            solutetext, //solute_text
                                                            solutetext2, //solute_text2
                                                            jsonObjOLSMedPr._embedded.terms[0].label, //med_pr_text,
                                                            med_pr_text_syn, //med_pr_text_syn
                                                            jsonRelatedMembraneModel.results.bindings[0].Protein.value // protein_name
                                                        ]);

                                                        solute_chebi = [];
                                                        solute_chebi2 = [];
                                                        source_fma = [];
                                                        sink_fma = [];
                                                        source_fma2 = [];
                                                        sink_fma2 = [];
                                                        med_pr = [];
                                                        med_fma = [];

                                                        if (modelEntityObj[idMembrane].model_entity != undefined)
                                                            idMembrane++;

                                                        if (idMembrane == modelEntityObj.length) {
                                                            showCollapsibleSpace(membraneName);
                                                            return;
                                                        }

                                                        relatedMembraneModel(membraneName, cotransporterList);

                                                    },
                                                    true);
                                            },
                                            true);
                                    },
                                    true);
                            },
                            true);
                    },
                    true);
            },
            true);
    };

    // Information displayed in the collapsible space when users click a model
    var recommenderSystemInformation = function (membraneName, msg2, model, biological, species, gene, protein, compartment) {
        // apical or basolateral membrane
        var membraneModel = "<p id=membraneModelsID><b>" + membraneName + " model</b>";

        for (var i = 0; i < membraneModelObj.length; i++) {
            if (membraneModelObj[i].similar == 0) continue;

            var workspaceuri = myWorkspaneName + "/" + "rawfile" + "/" + "HEAD" + "/" + membraneModelID[i][0];

            var label = document.createElement("label");
            label.innerHTML = '<br><a href="' + workspaceuri + '" target="_blank" ' +
                'data-toggle="tooltip" data-placement="right" ' +
                'title="Protein name: ' + membraneModelObj[i].prname + '\n' +
                'Protein uri: ' + membraneModelObj[i].protein + '\n' +
                'Mediator name: ' + membraneModelID[i][14] + '\n' +
                'Mediator uri: ' + membraneModelObj[i].medpr + '\n' +
                'Similarity value: ' + membraneModelObj[i].similar + '\n' +
                'Model entity: ' + membraneModelID[i][0] + '\n' +
                'Model entity2: ' + membraneModelID[i][1] + '"' +
                '>' + membraneModelID[i][14] + '</a></label>'; // membraneModelObj[i].prname

            membraneModel += label.innerHTML;
        }

        if (membraneModel == "<p id=membraneModelsID><b>" + membraneName + " model</b>") {
            membraneModel += "<br>Not Exist" + "<br>";
        }

        // alternative model
        var alternativeModel = "<p id=alternativeModelID><b>Alternative model of " + proteinText + "</b>";
        if (alternativeModelObj.length == 0) {
            alternativeModel += "<br>Not Exist" + "<br>";
        }
        else {
            for (var i = 0; i < alternativeModelObj.length; i++) {
                var workspaceuri = alternativeModelObj[i].workspaceName +
                    "/" + "rawfile" + "/" + "HEAD" + "/" + alternativeModelObj[i].modelEntity;

                var label = document.createElement("label");
                label.innerHTML = '<br><a href="' + workspaceuri + '" target="_blank" ' +
                    'data-toggle="tooltip" data-placement="right" ' +
                    'title="Protein name: ' + alternativeModelObj[i].prname + '\n' +
                    'Protein uri: ' + alternativeModelObj[i].protein + '\n' +
                    'Model entity: ' + alternativeModelObj[i].modelEntity + '"' +
                    '>' + alternativeModelObj[i].prname + '</a></label>';

                alternativeModel += label.innerHTML;
            }
        }

        console.log("relatedModelObj: ", relatedModelObj);
        console.log("proteinName: ", proteinName);

        // related organ models (kidney, lungs, etc) in PMR
        var relatedOrganModel = "<p id=relatedOrganModelID><b>" + typeOfModel + " model in PMR</b>";
        if (relatedModelObj.length == 1) { // includes own protein name
            relatedOrganModel += "<br>Not Exist" + "<br>";
        }
        else {
            for (var i = 0; i < relatedModelObj.length; i++) {

                // if (proteinName == relatedModelObj[i].protein && typeOfModel != "Lung")
                //     continue;

                var workspaceuri = relatedModelObj[i].workspaceName +
                    "/" + "rawfile" + "/" + "HEAD" + "/" + relatedModelObj[i].modelEntity;

                var label = document.createElement("label");
                label.innerHTML = '<br><a href="' + workspaceuri + '" target="_blank" ' +
                    'data-toggle="tooltip" data-placement="right" ' +
                    'title="Protein name: ' + relatedModelObj[i].prname + '\n' +
                    'Protein uri: ' + relatedModelObj[i].protein + '\n' +
                    'Model entity: ' + relatedModelObj[i].modelEntity + '"' +
                    '>' + relatedModelObj[i].prname + '</a></label>';

                relatedOrganModel += label.innerHTML;
            }
        }

        // append message inside corresponding hiders
        for (var i = 0; i < $('.hiders').length; i++) {

            if (cellmlModelEntity == $('.hiders')[i].id) {

                $('.hiders')[i].innerHTML = msg2 + model + biological + species + gene + protein + compartment + location;

                var msg3 = "<br><p><b>Recommendations/suggestions based on existing models in PMR<b><\p>";
                $('.hiders')[i].innerHTML += msg3 + membraneModel + alternativeModel + relatedOrganModel;

                break;
            }
        }
    }

    // Processing information to be displayed in the collapsible space when users click a model
    var showCollapsibleSpace = function (membraneName) {

        idMembrane = 0;

        var msg2 = "<p><b>" + proteinText + "</b> is a <b>" + typeOfModel + "</b> model. It is located in " +
            "<b>" + locationOfModel + "</b><\p>";

        var workspaceuri = myWorkspaneName + "/" + "rawfile" + "/" + "HEAD" + "/" + cellmlModelEntity;

        var model = "<b>Model: </b><a href=" + workspaceuri + " + target=_blank " +
            "data-toggle=tooltip data-placement=right " +
            "title=" + proteinText + ">" + cellmlModelEntity + "</a>";

        var biological = "<p><b>Biological Meaning: </b>" + biological_meaning + "</p>";

        var species = "<p><b>Species: </b>" + speciesName + "</p>";
        var gene = "<p><b>Gene: </b>" + geneName + "</p>";
        var protein = "<p data-toggle=tooltip data-placement=right title=" + proteinName + ">" +
            "<b>Protein: </b>" + proteinText + "</p>";

        var compartment = "<p><b>Compartment: </b>" + compartmentName + "</p>";
        var location = "<p><b>Location: </b>" + locationName + "</p>";

        // Related apical or basolateral model
        var index = 0, ProteinSeq = "", requestData, PID = [],
            baseUrl = "/.api/ebi/clustalo";
            // baseUrl = "https://www.ebi.ac.uk/Tools/services/rest/clustalo";

        proteinOrMedPrID(membraneModelID, PID);
        console.log("PID BEFORE: ", PID);
        console.log("PID BEFORE membraneModelID: ", membraneModelID);

        // var draggedMedPrID = splitPRFromProtein(circleID);
        // PID.push(draggedMedPrID);

        console.log("ProteinName: ", proteinName);
        if (proteinName.indexOf(partOfCellUri) != -1) {
            console.log("draggedMedPrID: ", draggedMedPrID);
            // PID.push(draggedMedPrID);
            if (draggedMedPrID != undefined)
                PID.push(draggedMedPrID.slice(draggedMedPrID.search("PR_") + 3, draggedMedPrID.length));
        }
        else if (proteinName.indexOf(partOfProteinUri) != -1) {
            var indexOfPR = proteinName.search("PR_");
            var draggedMedPr = proteinName.slice(indexOfPR + 3, proteinName.length);
            PID.push(draggedMedPr);
        }

        console.log("PID BEFORE Filter: ", PID);

        // remove duplicate protein ID
        PID = PID.filter(function (item, pos) {
            return PID.indexOf(item) == pos;
        });

        console.log("PID AFTER Filter: ", PID);

        // remove CHEBI, GO, and FMA URIs in the PID list
        for (var i = 0; i < PID.length; i++) {
            if (PID[i].indexOf("CHEBI_") != -1 || PID[i].indexOf("GO_") != -1 || PID[i].indexOf("FMA_") != -1) {
                PID.splice(i, 1);
                i--;
            }
        }

        console.log("PID AFTER AFTER Filter: ", PID);

        // PID does NOT start with P or Q
        for (var key in PID) {
            // console.log("PID[key]: ", PID[key]);
            if (PID[key].charAt(0) == "Q" || PID[key].charAt(0) == "G" || PID[key].charAt(0) == "B" || PID[key] == "O14234") continue;

            if (PID[key].charAt(0) != "P") {
                PID[key] = "P" + PID[key].replace(/^0+/, ""); // Or parseInt("065", 10);
            }
        }

        console.log("PID AFTER: ", PID);

        // https://www.ebi.ac.uk/seqdb/confluence/pages/viewpage.action?pageId=48923608
        // https://www.ebi.ac.uk/seqdb/confluence/display/WEBSERVICES/clustalo_rest
        var WSDbfetchREST = function () {

            var dbfectendpoint = "/.api/ebi/uniprotkb/" + PID[index] + "/fasta";
            // var dbfectendpoint = "https://www.ebi.ac.uk/Tools/dbfetch/dbfetch/uniprotkb/" + PID[index] + "/fasta";

            sendGetRequest(
                dbfectendpoint,
                function (psequence) {
                    console.log("psequence: ", psequence);

                    ProteinSeq += psequence;

                    // PID is empty
                    if (PID.length == 1) { // in fact, PID.length == 0, to enable the above dbfectendpoint query
                        recommenderSystemInformation(membraneName, msg2, model, biological, species, gene, protein, compartment);
                        return;
                    }

                    index++;
                    if (index == PID.length) {
                        console.log("ProteinSeq: ", ProteinSeq);

                        requestData = {
                            "sequence": ProteinSeq,
                            "email": "dsar941@aucklanduni.ac.nz"
                        }

                        var requestUrl = baseUrl + "/run/";

                        console.log("Andre is here");
                        console.log(requestData);

                        sendEBIPostRequest(
                            requestUrl,
                            requestData,
                            function (jobId) {
                                console.log("jobId: ", jobId); // jobId

                                var chkJobStatus = function (jobId) {
                                    var jobIdUrl = baseUrl + "/status/" + jobId;
                                    sendGetRequest(
                                        jobIdUrl,
                                        function (resultObj) {
                                            console.log("result: ", resultObj); // jobId status

                                            if (resultObj == "RUNNING") {
                                                setTimeout(function () {
                                                    chkJobStatus(jobId);
                                                }, 5000);
                                            }

                                            var pimUrl = baseUrl + "/result/" + jobId + "/pim";
                                            sendGetRequest(
                                                pimUrl,
                                                function (identityMatrix) {

                                                    similarityMatrixEBI(identityMatrix, PID, draggedMedPrID, membraneModelObj);

                                                    var tempList = [];
                                                    for (var i = 0; i < membraneModelObj.length; i++) {
                                                        for (var j = 0; j < membraneModelID.length; j++) {

                                                            var tempID = splitPRFromProtein(membraneModelID[j]);
                                                            if (tempID.charAt(0) != "P") {
                                                                if (tempID.charAt(0) != "Q") {
                                                                    tempID = "P" + tempID.replace(/^0+/, "");
                                                                }
                                                            }

                                                            if (membraneModelObj[i].pid == tempID) {
                                                                tempList.push(membraneModelID[j]);
                                                                break;
                                                            }
                                                        }
                                                    }

                                                    for (var i = 0; i < tempList.length; i++) {
                                                        membraneModelID[i] = tempList[i];
                                                    }

                                                    // console.log("tempList: ", tempList);
                                                    console.log("AFTER membraneModelID: ", membraneModelID);
                                                    console.log("membraneModelObj: ", membraneModelObj);

                                                    recommenderSystemInformation(membraneName, msg2, model, biological, species, gene, protein, compartment);
                                                    return;
                                                },
                                                false);
                                        },
                                        false);
                                }

                                chkJobStatus(jobId);
                                console.log("AFTER chkJobStatus(jobId)!");

                                return;
                            },
                            false);

                        return;
                    }

                    // callback
                    WSDbfetchREST();
                    console.log("AFTER WSDbfetchREST!");
                },
                false);
        };

        WSDbfetchREST();
        console.log("AFTER WSDbfetchREST!");

        return;
    };

    // Reinitialize variable for next iteration
    var reinitVariable = function () {
        idProtein = 0;
        idAltProtein = 0;
        idMembrane = 0;
        counter = 0;

        membraneModelObj = [];
        alternativeModelObj = [];
        relatedModelObj = [];

        relatedModel = [];
        modelEntityObj = [];
        membraneModelID = [];

        relatedModelEntity = [];
        cotransporterList = [];
    };

    // Display CellML models on the Model Discovery Tool
    mainUtils.showDiscoverModels = function (discoverIndex) {
        // Reinitialize for a new search result
        $("#searchList").html("");

        // Table header
        if (discoverIndex == 0) {
            table = $("<table/>").addClass("table table-hover table-condensed"); //table-bordered table-striped
            thead = $("<thead/>"), tr = $("<tr/>");
            tbody = $("<tbody/>");
            for (var i in head) {
                tr.append($("<th/>").append(head[i]));
            }
        }

        thead.append(tr);
        table.append(thead);

        // Table body
        tr = $("<tr/>");

        var modelhtm = '<fieldset id="' + modelEntity[discoverIndex] + '" class="majorpoints"><legend class="majorpointslegend">' + modelEntity[discoverIndex] + '</legend>' +
            '<div id="' + modelEntity[discoverIndex] + '" class="hiders" style="display: none"></div></fieldset>';

        tr.append($("<td/>").append(modelhtm)); // model

        // tr.append($("<td/>").append(modelEntity[i].model)); // model
        tr.append($("<td/>").append(biologicalMeaning[discoverIndex])); // biological meaning

        tr.append($("<td/>").append(speciesList[discoverIndex])); // species

        tr.append($("<td/>").append(geneList[discoverIndex])); // gene

        tr.append($("<td/>").append(proteinList[discoverIndex])); // protein

        tbody.append(tr);

        table.append(tbody);
        $("#searchList").append(table);

        $('.majorpoints').click(function () {

            reinitVariable();
            cellmlModelEntity = $(this)[0].id;

            console.log("Testing: ", cellmlModelEntity);

            if ($(this)[0].childNodes[1].innerText == "") {
                console.log("Testing INSIDE: ", $(this)[0]);

                showLoading($(this)[0].lastChild);
                clickedModel();
            }

            $(this).find('.hiders').toggle();
        });

        // Fill in search attribute value
        $("#searchTxt").attr("value", sessionStorage.getItem("searchTxtContent"));

        // SET main content in local storage
        sessionStorage.setItem("searchListContent", $("#main-content").html());
    };

    // Expose utility to the global object
    global.$mainUtils = mainUtils;

})(window);