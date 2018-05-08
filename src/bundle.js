/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Created by dsar941 on 9/8/2016.
 */
var miscellaneous = __webpack_require__(1);
var ajaxUtils = __webpack_require__(2);
var sparqlUtils = __webpack_require__(3);

"use strict";

var usecase = (function (global) {

    var mainUtils = {}, // namespace for utility
        model = [], // selected models in Load Models
        chebiURI,
        cellmlModelEntity;

    // MODEL DISCOVERY
    var modelEntity = [],
        biologicalMeaning = [],
        speciesList = [],
        geneList = [],
        proteinList = [],
        listOfProteinURIs = [],
        head = [],
        discoverIndex = 0;

    var relatedModel = [], membraneModelObj = [], alternativeModelObj = [], relatedModelObj = [],
        modelEntityObj = [], membraneModelID = [], proteinName, proteinText, cellmlModel, biological_meaning,
        speciesName, geneName, compartmentName, locationName, idProtein = 0, idAltProtein = 0, idMembrane = 0,
        locationOfModel, typeOfModel, organIndex, relatedModelEntity = [], cotransporterList = [], counter = 0;

    // DOCUMENTATION: load documentation from github
    mainUtils.loadDocumentation = function () {
        var uri = "https://github.com/dewancse/epithelial-discovery-tool";
        $("#main-content").html("Documentation can be found at " +
            "<a href=" + uri + " + target=_blank>README.md in github</a>");
    };

    // HOME: load the home page
    mainUtils.loadHomeHtml = function () {
        miscellaneous.showLoading("#main-content");
        ajaxUtils.sendGetRequest(
            sparqlUtils.usecaseHtml,
            function (usecaseHtmlContent) {
                $("#main-content").html(usecaseHtmlContent);
            },
            false);
    };

    // On page load (before img or CSS)
    $(document).ready(function () {

        // On first load, show home view
        miscellaneous.showLoading("#main-content");

        if (sessionStorage.getItem("searchListContent")) {
            $("#main-content").html(sessionStorage.getItem("searchListContent"));
        }
        else {
            // homepage
            ajaxUtils.sendGetRequest(
                sparqlUtils.usecaseHtml,
                function (usecaseHtmlContent) {
                    $("#main-content").html(usecaseHtmlContent);

                    $(".carousel").carousel({
                        interval: 2000
                    });
                },
                false);
        }

        $(".dropdown-toggle").dropdown();
    });

    // MODEL DISCOVERY: enter search texts
    $(document).on("keydown", function () {
        if (event.key == "Enter") {

            var uriOPB, uriCHEBI, keyValue;
            var searchTxt = document.getElementById("searchTxt").value;

            // set local storage
            sessionStorage.setItem("searchTxtContent", searchTxt);

            // dictionary object
            for (var i in sparqlUtils.dictionary) {
                var key1 = searchTxt.indexOf("" + sparqlUtils.dictionary[i].key1 + ""),
                    key2 = searchTxt.indexOf("" + sparqlUtils.dictionary[i].key2 + "");

                if (key1 != -1 && key2 != -1) {
                    uriOPB = sparqlUtils.dictionary[i].opb;
                    uriCHEBI = sparqlUtils.dictionary[i].chebi;
                    keyValue = sparqlUtils.dictionary[i].key1;
                }
            }

            // chebi term from search text
            chebiURI = uriCHEBI;

            miscellaneous.showLoading("#searchList");

            modelEntity = [];
            biologicalMeaning = [];
            speciesList = [];
            geneList = [];
            proteinList = [];
            listOfProteinURIs = [];
            head = [];

            discoverIndex = 0; // discoverIndex to index each Model_entity

            var query;
            if (uriCHEBI == "") { // model discovery with 'flux'
                query = sparqlUtils.discoveryWithFlux(uriOPB);
            }
            else {
                if (keyValue == "flux") { // model discovery with 'flux of sodium', etc.
                    query = sparqlUtils.discoveryWithFluxOfSolute(uriCHEBI)
                }
                else { // model disocvery with 'concentration of sodium', etc.
                    query = sparqlUtils.discoveryWithConcentrationOfSolute(uriCHEBI);
                }
            }

            // Model
            ajaxUtils.sendPostRequest(
                sparqlUtils.endpoint,
                query,
                function (jsonModel) {
                    // REMOVE duplicate cellml model and variable name (NOT component name)
                    jsonModel.results.bindings = miscellaneous.uniqueifyjsonModel(jsonModel.results.bindings);
                    mainUtils.discoverModels(jsonModel);
                },
                true);
        }
    });

    // MODEL DISCOVERY: SPARQL queries to retrieve search results from PMR
    mainUtils.discoverModels = function (jsonModel) {

        if (jsonModel.results.bindings.length == 0) {
            mainUtils.showDiscoverModels();
            return;
        }

        var model = miscellaneous.parseModelName(jsonModel.results.bindings[discoverIndex].Model_entity.value);
        model = model + "#" + model.slice(0, model.indexOf("."));

        var query = "SELECT ?Protein WHERE { " + "<" + model + "> <http://www.obofoundry.org/ro/ro.owl#modelOf> ?Protein. }";

        ajaxUtils.sendPostRequest(
            sparqlUtils.endpoint,
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
                    endpointproteinOLS = sparqlUtils.abiOntoEndpoint + "/pr";
                }
                else {
                    pr_uri = jsonProteinUri.results.bindings[0].Protein.value;

                    if (pr_uri == sparqlUtils.epithelialcellID)
                        endpointproteinOLS = sparqlUtils.abiOntoEndpoint + "/cl/terms?iri=" + pr_uri;
                    else
                        endpointproteinOLS = sparqlUtils.abiOntoEndpoint + "/pr/terms?iri=" + pr_uri;

                    // dropdown list
                    listOfProteinURIs.push(pr_uri);
                }

                ajaxUtils.sendGetRequest(
                    endpointproteinOLS,
                    function (jsonProtein) {

                        var endpointgeneOLS;
                        if (jsonProtein._embedded.terms[0]._links.has_gene_template != undefined)
                            endpointgeneOLS = jsonProtein._embedded.terms[0]._links.has_gene_template.href;
                        else
                            endpointgeneOLS = sparqlUtils.abiOntoEndpoint + "/pr";

                        ajaxUtils.sendGetRequest(
                            endpointgeneOLS,
                            function (jsonGene) {

                                var endpointspeciesOLS;
                                if (jsonProtein._embedded.terms[0]._links.only_in_taxon != undefined)
                                    endpointspeciesOLS = jsonProtein._embedded.terms[0]._links.only_in_taxon.href;
                                else
                                    endpointspeciesOLS = sparqlUtils.abiOntoEndpoint + "/pr";

                                ajaxUtils.sendGetRequest(
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

                                        head = ["Model_entity (click to expand)", "Biological_meaning", "Species", "Gene", "Protein"];

                                        mainUtils.showDiscoverModels();

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
    };

    // MODEL DISCOVERY: load the search html
    mainUtils.usecaseHtml = function () {
        if (!sessionStorage.getItem("searchListContent")) {
            ajaxUtils.sendGetRequest(
                sparqlUtils.usecaseHtml,
                function (searchHtmlContent) {
                    $("#main-content").html(searchHtmlContent);
                },
                false);
        }
        else {
            $("#main-content").html(sessionStorage.getItem("searchListContent"));
            mainUtils.showDiscoverModels();
        }
    };

    var dropcircle = function () {

        // parsing
        cellmlModel = cellmlModelEntity;
        var indexOfHash = cellmlModel.search("#");
        cellmlModel = cellmlModel.slice(0, indexOfHash);

        cellmlModel = cellmlModel + "#" + cellmlModel.slice(0, cellmlModel.indexOf("."));

        var query = "SELECT ?Protein ?Biological_meaning " +
            "WHERE { GRAPH ?g { " +
            "<" + cellmlModel + "> <http://www.obofoundry.org/ro/ro.owl#modelOf> ?Protein . " +
            "<" + cellmlModelEntity + "> <http://purl.org/dc/terms/description> ?Biological_meaning . " +
            "}}";

        // console.log("query: ", query);

        // protein name
        ajaxUtils.sendPostRequest(
            sparqlUtils.endpoint,
            query,
            function (jsonModel) {

                console.log("jsonModel: ", jsonModel);

                if (jsonModel.results.bindings.length == 0)
                    proteinName = undefined;
                else
                    proteinName = jsonModel.results.bindings[0].Protein.value;

                var endpointprOLS;
                if (proteinName != undefined) {
                    if (proteinName == sparqlUtils.epithelialcellID)
                        endpointprOLS = sparqlUtils.abiOntoEndpoint + "/cl/terms?iri=" + proteinName;
                    else
                        endpointprOLS = sparqlUtils.abiOntoEndpoint + "/pr/terms?iri=" + proteinName;
                }
                else
                    endpointprOLS = sparqlUtils.abiOntoEndpoint + "/pr";

                ajaxUtils.sendGetRequest(
                    endpointprOLS,
                    function (jsonPr) {

                        var endpointgeneOLS;
                        if (jsonPr._embedded == undefined || jsonPr._embedded.terms[0]._links.has_gene_template == undefined)
                            endpointgeneOLS = sparqlUtils.abiOntoEndpoint + "/pr";
                        else
                            endpointgeneOLS = jsonPr._embedded.terms[0]._links.has_gene_template.href;

                        ajaxUtils.sendGetRequest(
                            endpointgeneOLS,
                            function (jsonGene) {

                                var endpointspeciesOLS;
                                if (jsonPr._embedded == undefined || jsonPr._embedded.terms[0]._links.only_in_taxon == undefined)
                                    endpointspeciesOLS = sparqlUtils.abiOntoEndpoint + "/pr";
                                else
                                    endpointspeciesOLS = jsonPr._embedded.terms[0]._links.only_in_taxon.href;

                                ajaxUtils.sendGetRequest(
                                    endpointspeciesOLS,
                                    function (jsonSpecies) {

                                        var query = "SELECT ?Compartment " +
                                            "WHERE { " + "<" + cellmlModel + "> <http://www.obofoundry.org/ro/ro.owl#compartmentOf> ?Compartment. }";

                                        ajaxUtils.sendPostRequest(
                                            sparqlUtils.endpoint,
                                            query,
                                            function (jsonObjCompartment) {

                                                var query = "SELECT ?Located_in " +
                                                    "WHERE { " + "<" + cellmlModel + "> <http://www.obofoundry.org/ro/ro.owl#located_in> ?Located_in. }";

                                                ajaxUtils.sendPostRequest(
                                                    sparqlUtils.endpoint,
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
            }, true);
    };

    var compartmentandlocation = function (compartment, location) {

        var tempCompartment = "", counterOLS = 0;

        for (var i in compartment) {

            var fma_uri = compartment[i].Compartment.value;
            fma_uri = "http://purl.org/sig/ont/fma/fma" + fma_uri.slice(fma_uri.indexOf("FMA:") + 4);

            var endpointOLS = sparqlUtils.abiOntoEndpoint + "/fma/terms?iri=" + fma_uri;

            ajaxUtils.sendGetRequest(
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
                            fma_uri = "http://purl.org/sig/ont/fma/fma" + fma_uri.slice(fma_uri.indexOf("FMA:") + 4);

                            var endpointOLS = sparqlUtils.abiOntoEndpoint + "/fma/terms?iri=" + fma_uri;

                            ajaxUtils.sendGetRequest(
                                endpointOLS,
                                function (jsonObjOLSLocation) {

                                    counterOLSLoc++;
                                    tempLocation += jsonObjOLSLocation._embedded.terms[0].label;

                                    if (counterOLSLoc < location.length) tempLocation += ", ";
                                    else tempLocation += "";

                                    if (counterOLSLoc == location.length) {

                                        compartmentName = tempCompartment;
                                        locationName = tempLocation;

                                        dropcircleExtended();
                                    }
                                },
                                true);
                        }
                    }
                },
                true);
        }
    };

    // remaining part of dropcircle function
    var dropcircleExtended = function () {

        var query = "SELECT ?located_in " +
            "WHERE { GRAPH ?g { <" + cellmlModel + "> <http://www.obofoundry.org/ro/ro.owl#located_in> ?located_in . " +
            "}}";

        // location of that cellml model
        ajaxUtils.sendPostRequest(
            sparqlUtils.endpoint,
            query,
            function (jsonLocatedin) {

                console.log("jsonLocatedin: ", jsonLocatedin);

                var jsonLocatedinCounter = 0;
                // Type of model - kidney, lungs, etc
                for (i = 0; i < jsonLocatedin.results.bindings.length; i++) {
                    for (j = 0; j < sparqlUtils.organ.length; j++) {
                        for (var k = 0; k < sparqlUtils.organ[j].key.length; k++) {
                            if (jsonLocatedin.results.bindings[i].located_in.value == sparqlUtils.organ[j].key[k].key)
                                jsonLocatedinCounter++;

                            if (jsonLocatedinCounter == jsonLocatedin.results.bindings.length) {
                                typeOfModel = sparqlUtils.organ[j].value;
                                organIndex = j;
                                break;
                            }
                        }
                        if (jsonLocatedinCounter == jsonLocatedin.results.bindings.length)
                            break;
                    }
                    if (jsonLocatedinCounter == jsonLocatedin.results.bindings.length)
                        break;
                }

                locationOfModel = "";
                jsonLocatedinCounter = 0;
                // location of the above type of model
                for (i = 0; i < jsonLocatedin.results.bindings.length; i++) {
                    for (j = 0; j < sparqlUtils.organ[organIndex].key.length; j++) {
                        if (jsonLocatedin.results.bindings[i].located_in.value == sparqlUtils.organ[organIndex].key[j].key) {
                            locationOfModel += sparqlUtils.organ[organIndex].key[j].value;

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
                query = "SELECT ?cellmlmodel ?located_in " +
                    "WHERE { GRAPH ?g { ?cellmlmodel <http://www.obofoundry.org/ro/ro.owl#located_in> ?located_in. " +
                    "}}";

                ajaxUtils.sendPostRequest(
                    sparqlUtils.endpoint,
                    query,
                    function (jsonRelatedModel) {

                        console.log("jsonRelatedModel: ", jsonRelatedModel);

                        var query = "PREFIX semsim: <http://www.bhi.washington.edu/SemSim#> " +
                            "PREFIX ro: <http://www.obofoundry.org/ro/ro.owl#> " +
                            "SELECT ?med_entity_uri " +
                            "WHERE { " +
                            "<" + cellmlModelEntity + "> semsim:isComputationalComponentFor ?model_prop. " +
                            "?model_prop semsim:physicalPropertyOf ?model_proc. " +
                            "?model_proc semsim:hasMediatorParticipant ?model_medparticipant. " +
                            "?model_medparticipant semsim:hasPhysicalEntityReference ?med_entity. " +
                            "?med_entity semsim:hasPhysicalDefinition ?med_entity_uri. " +
                            "}";

                        ajaxUtils.sendPostRequest(
                            sparqlUtils.endpoint,
                            query,
                            function (jsonMediator) {

                                console.log("jsonMediator: ", jsonMediator);

                                for (i = 0; i < jsonRelatedModel.results.bindings.length; i++) {
                                    for (j = 0; j < sparqlUtils.organ[organIndex].key.length; j++) {
                                        if (jsonRelatedModel.results.bindings[i].located_in.value == sparqlUtils.organ[organIndex].key[j].key) {
                                            // parsing
                                            var tempModel = jsonRelatedModel.results.bindings[i].cellmlmodel.value;
                                            var indexOfHash = tempModel.search("#");
                                            tempModel = tempModel.slice(0, indexOfHash);

                                            relatedModel.push(tempModel);

                                            break;
                                        }
                                    }
                                }

                                relatedModel = miscellaneous.uniqueify(relatedModel);

                                var alternativeCellmlArray = [], tempcellmlModel,
                                    indexOfHash = cellmlModel.search("#");
                                tempcellmlModel = cellmlModel.slice(0, indexOfHash);
                                for (i = 0; i < relatedModel.length; i++) {
                                    if (relatedModel[i] != tempcellmlModel) {
                                        alternativeCellmlArray.push(relatedModel[i]);
                                    }
                                }

                                var membrane;
                                for (i = 0; i < jsonMediator.results.bindings.length; i++) {
                                    var mediatorValue = jsonMediator.results.bindings[i].med_entity_uri.value;

                                    if (mediatorValue == sparqlUtils.apicalID)
                                        membrane = sparqlUtils.apicalID;
                                    else if (mediatorValue == sparqlUtils.basolateralID)
                                        membrane = sparqlUtils.basolateralID;
                                    else if (mediatorValue == sparqlUtils.paracellularID)
                                        membrane = sparqlUtils.paracellularID;
                                }

                                // console.log("membrane dropcircleExtended: ", membrane);

                                // console.log("relatedModel: ", relatedModel);
                                relatedCellmlModel(relatedModel, alternativeCellmlArray, membrane);

                            }, true);
                    }, true);
            }, true);
    };

    // related kidney, lungs, etc model
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

        query = "SELECT ?Protein ?workspaceName " +
            "WHERE { GRAPH ?workspaceName { <" + modelname + "> <http://www.obofoundry.org/ro/ro.owl#modelOf> ?Protein . " +
            "}}";

        ajaxUtils.sendPostRequest(
            sparqlUtils.endpoint,
            query,
            function (jsonProtein) {

                var endpointprOLS;
                if (jsonProtein.results.bindings.length == 0)
                    endpointprOLS = sparqlUtils.abiOntoEndpoint + "/pr";
                else {
                    var pr_uri = jsonProtein.results.bindings[0].Protein.value;
                    if (pr_uri == sparqlUtils.epithelialcellID)
                        endpointprOLS = sparqlUtils.abiOntoEndpoint + "/cl/terms?iri=" + pr_uri;
                    else
                        endpointprOLS = sparqlUtils.abiOntoEndpoint + "/pr/terms?iri=" + pr_uri;
                }

                ajaxUtils.sendGetRequest(
                    endpointprOLS,
                    function (jsonPr) {

                        if (jsonProtein.results.bindings.length != 0) {

                            relatedModelObj.push({
                                protein: jsonProtein.results.bindings[0].Protein.value,
                                prname: jsonPr._embedded.terms[0].label,
                                workspaceName: jsonProtein.results.bindings[0].workspaceName.value,
                                modelEntity: relatedModel[idProtein] // relatedModel which have #protein
                            });
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

    // alternative model of a dragged transporter, e.g. rat NHE3, mouse NHE3
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

        var query = "SELECT ?Protein ?workspaceName " +
            "WHERE { GRAPH ?workspaceName { <" + modelname + "> <http://www.obofoundry.org/ro/ro.owl#modelOf> ?Protein . " +
            "}}";

        ajaxUtils.sendPostRequest(
            sparqlUtils.endpoint,
            query,
            function (jsonAltProtein) {

                if (jsonAltProtein.results.bindings.length == 0)
                    endpointOLS = sparqlUtils.abiOntoEndpoint + "/pr";
                else {
                    var pr_uri = jsonAltProtein.results.bindings[0].Protein.value;
                    if (pr_uri == sparqlUtils.epithelialcellID)
                        endpointOLS = sparqlUtils.abiOntoEndpoint + "/cl/terms?iri=" + pr_uri;
                    else
                        endpointOLS = sparqlUtils.abiOntoEndpoint + "/pr/terms?iri=" + pr_uri;
                }

                ajaxUtils.sendGetRequest(
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
                            if (membrane == sparqlUtils.apicalID) {
                                membrane = sparqlUtils.basolateralID;
                                membraneName = "Basolateral membrane";
                            }
                            else if (membrane == sparqlUtils.basolateralID) {
                                membrane = sparqlUtils.apicalID;
                                membraneName = "Apical membrane";
                            }
                            else if (membrane == sparqlUtils.paracellularID) {
                                membrane = sparqlUtils.paracellularID;
                                membraneName = "Paracellular membrane";
                            }

                            console.log("membrane and membraneName: ", membrane, membraneName);

                            relatedMembrane(membrane, membraneName);
                            // showModalWindow(membraneName, ModelEntity);
                            return;
                        }

                        alternativeCellmlModel(alternativeCellmlArray, membrane);
                    },
                    true);
            }, true);
    };

    var makecotransporter = function (membrane1, membrane2, fluxList, membraneName) {

        var query = sparqlUtils.makecotransporterSPARQL(membrane1, membrane2);
        ajaxUtils.sendPostRequest(
            sparqlUtils.endpoint,
            query,
            function (jsonObj) {

                // console.log("jsonObj in makecotransporter: ", jsonObj);
                var tempProtein = [], tempFMA = [];
                for (var m = 0; m < jsonObj.results.bindings.length; m++) {
                    var tmpPro = jsonObj.results.bindings[m].med_entity_uri.value;
                    var tmpFMA = jsonObj.results.bindings[m].med_entity_uri.value;

                    if (tmpPro.indexOf("http://purl.obolibrary.org/obo/PR_") != -1) {
                        tempProtein.push(jsonObj.results.bindings[m].med_entity_uri.value);
                    }

                    if (tmpFMA.indexOf("http://identifiers.org/fma/FMA:") != -1) {
                        tempFMA.push(jsonObj.results.bindings[m].med_entity_uri.value);
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

                if (counter == miscellaneous.iteration(fluxList.length)) {

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

    // apical or basolateral membrane in PMR
    var relatedMembrane = function (membrane, membraneName) {

        console.log("relatedMembrane: ", membrane, membraneName);

        var fstCHEBI, sndCHEBI;
        fstCHEBI = chebiURI.slice(1, chebiURI.length - 1);
        sndCHEBI = fstCHEBI;

        var query = sparqlUtils.relatedMembraneSPARQL(fstCHEBI, sndCHEBI, membrane);

        ajaxUtils.sendPostRequest(
            sparqlUtils.endpoint,
            query,
            function (jsonRelatedMembrane) {

                console.log("jsonRelatedMembrane: ", jsonRelatedMembrane);

                var fluxList = [], cotransporterList = [];
                for (i = 0; i < jsonRelatedMembrane.results.bindings.length; i++) {

                    // allow only related apical or basolateral membrane from my workspace
                    if (jsonRelatedMembrane.results.bindings[i].g.value != sparqlUtils.myWorkspaneName)
                        continue;

                    fluxList.push(jsonRelatedMembrane.results.bindings[i].Model_entity.value);
                }

                var tempfluxList = [];
                for (i = 0; i < fluxList.length; i++) {
                    if (!miscellaneous.isExist(fluxList[i], tempfluxList)) {
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
                    for (i = 0; i < fluxList.length; i++) {
                        for (j = i + 1; j < fluxList.length; j++) {
                            makecotransporter(fluxList[i], fluxList[j], fluxList, membraneName);
                        }
                    }
                }
            },
            true);
    };

    var source_fma = [], sink_fma = [], med_fma = [], med_pr = [], solute_chebi = [];
    var source_fma2 = [], sink_fma2 = [], solute_chebi2 = [];

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

        query = "PREFIX ro: <http://www.obofoundry.org/ro/ro.owl#>" +
            "PREFIX dcterms: <http://purl.org/dc/terms/>" +
            "SELECT ?Protein WHERE { <" + tempmembraneModel + "> <http://www.obofoundry.org/ro/ro.owl#modelOf> ?Protein . " +
            "}";

        ajaxUtils.sendPostRequest(
            sparqlUtils.endpoint,
            query,
            function (jsonRelatedMembraneModel) {

                // console.log("relatedMembraneModel: jsonRelatedMembraneModel -> ", jsonRelatedMembraneModel);

                var endpointprOLS;
                if (jsonRelatedMembraneModel.results.bindings.length == 0) {
                    showModalWindow(membraneName);
                    return;
                } else {
                    var pr_uri = jsonRelatedMembraneModel.results.bindings[0].Protein.value;
                    if (pr_uri == sparqlUtils.epithelialcellID)
                        endpointprOLS = sparqlUtils.abiOntoEndpoint + "/cl/terms?iri=" + pr_uri;
                    else
                        endpointprOLS = sparqlUtils.abiOntoEndpoint + "/pr/terms?iri=" + pr_uri;
                }

                ajaxUtils.sendGetRequest(
                    endpointprOLS,
                    function (jsonPr) {

                        var query = sparqlUtils.relatedMembraneModelSPARQL(modelEntityObj[idMembrane].model_entity, modelEntityObj[idMembrane].model_entity2);

                        // console.log("query: ", query);

                        ajaxUtils.sendPostRequest(
                            sparqlUtils.endpoint,
                            query,
                            function (jsonObjFlux) {

                                var endpointOLS;
                                if (jsonObjFlux.results.bindings[0].solute_chebi == undefined) {
                                    endpointOLS = undefined;
                                }
                                else {
                                    var chebi_uri = jsonObjFlux.results.bindings[0].solute_chebi.value,
                                        indexofColon = chebi_uri.indexOf("CHEBI:");
                                    chebi_uri = "http://purl.obolibrary.org/obo/CHEBI_" + chebi_uri.slice(indexofColon + 6);
                                    endpointOLS = sparqlUtils.abiOntoEndpoint + "/chebi/terms?iri=" + chebi_uri;
                                }

                                ajaxUtils.sendGetRequest(
                                    endpointOLS,
                                    function (jsonObjOLSChebi) {

                                        var endpointOLS2;
                                        if (jsonObjFlux.results.bindings[0].solute_chebi2 == undefined) {
                                            endpointOLS2 = undefined;
                                        }
                                        else {
                                            var chebi_uri2 = jsonObjFlux.results.bindings[0].solute_chebi2.value,
                                                indexofColon2 = chebi_uri2.indexOf("CHEBI:");
                                            chebi_uri2 = "http://purl.obolibrary.org/obo/CHEBI_" + chebi_uri2.slice(indexofColon2 + 6);

                                            endpointOLS2 = sparqlUtils.abiOntoEndpoint + "/chebi/terms?iri=" + chebi_uri2;
                                        }

                                        ajaxUtils.sendGetRequest(
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

                                                    // med pr and fma
                                                    if (jsonObjFlux.results.bindings[i].med_entity_uri == undefined) {
                                                        med_pr.push("");
                                                        med_fma.push("");
                                                    }
                                                    else {
                                                        var temp = jsonObjFlux.results.bindings[i].med_entity_uri.value;
                                                        if (temp.indexOf(sparqlUtils.partOfProteinUri) != -1 || temp.indexOf(sparqlUtils.partOfGOUri) != -1 || temp.indexOf(sparqlUtils.partOfCHEBIUri) != -1) {
                                                            med_pr.push({
                                                                // name of med_pr from OLS
                                                                // TODO: J_sc_K two PR and one FMA URI!!
                                                                med_pr: jsonObjFlux.results.bindings[i].med_entity_uri.value
                                                            });
                                                        }
                                                        else {
                                                            if (temp.indexOf(sparqlUtils.partOfFMAUri) != -1) {
                                                                med_fma.push({med_fma: jsonObjFlux.results.bindings[i].med_entity_uri.value});
                                                            }
                                                        }
                                                    }
                                                }

                                                // remove duplicate fma
                                                solute_chebi = miscellaneous.uniqueifyEpithelial(solute_chebi);
                                                solute_chebi2 = miscellaneous.uniqueifyEpithelial(solute_chebi2);
                                                source_fma = miscellaneous.uniqueifyEpithelial(source_fma);
                                                sink_fma = miscellaneous.uniqueifyEpithelial(sink_fma);
                                                source_fma2 = miscellaneous.uniqueifyEpithelial(source_fma2);
                                                sink_fma2 = miscellaneous.uniqueifyEpithelial(sink_fma2);
                                                med_pr = miscellaneous.uniqueifyEpithelial(med_pr);
                                                med_fma = miscellaneous.uniqueifyEpithelial(med_fma);

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

                                                        var tempjsonObjFlux = miscellaneous.uniqueifyjsonFlux(jsonObjFlux.results.bindings);

                                                        // console.log("tempjsonObjFlux: ", tempjsonObjFlux);

                                                        if (tempjsonObjFlux.length == 1) {
                                                            var vartext2;
                                                            if (med_pr.length != 0) {
                                                                if (med_pr[0].med_pr == sparqlUtils.Nachannel || med_pr[0].med_pr == sparqlUtils.Kchannel ||
                                                                    med_pr[0].med_pr == sparqlUtils.Clchannel) {
                                                                    vartext2 = "channel";
                                                                }
                                                                else if (tempjsonObjFlux[0].source_fma.value == sparqlUtils.luminalID &&
                                                                    tempjsonObjFlux[0].sink_fma.value == sparqlUtils.interstitialID) {
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

                                                if (medURI.indexOf(sparqlUtils.partOfCHEBIUri) != -1) {
                                                    var indexofColon = medURI.indexOf("CHEBI:");
                                                    chebi_uri = "http://purl.obolibrary.org/obo/CHEBI_" + medURI.slice(indexofColon + 6);
                                                    endpointOLS = sparqlUtils.abiOntoEndpoint + "/chebi/terms?iri=" + chebi_uri;
                                                }
                                                else if (medURI.indexOf(sparqlUtils.partOfGOUri) != -1) {
                                                    var indexofColon = medURI.indexOf("GO:");
                                                    var go_uri = "http://purl.obolibrary.org/obo/GO_" + medURI.slice(indexofColon + 3);
                                                    endpointOLS = sparqlUtils.abiOntoEndpoint + "/go/terms?iri=" + go_uri;
                                                }
                                                else if (medURI.indexOf(sparqlUtils.partOfCellUri) != -1) {
                                                    endpointOLS = sparqlUtils.abiOntoEndpoint + "/cl/terms?iri=" + medURI;
                                                }
                                                else
                                                    endpointOLS = sparqlUtils.abiOntoEndpoint + "/pr/terms?iri=" + medURI;

                                                ajaxUtils.sendGetRequest(
                                                    endpointOLS,
                                                    function (jsonObjOLSMedPr) {

                                                        // console.log("relatedMembraneModel: jsonObjOLSMedPr: ", jsonObjOLSMedPr);

                                                        var tempvar, med_pr_text_syn;
                                                        if (medURI.indexOf(sparqlUtils.partOfCellUri) != -1) {
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
                                                            showModalWindow(membraneName);
                                                            return;
                                                        }

                                                        relatedMembraneModel(membraneName, cotransporterList);

                                                    }, true);
                                            }, true);
                                    }, true);
                            }, true);
                    }, true);
            }, true);
    };

    var showModalWindow = function (membraneName) {

        idMembrane = 0;

        var msg2 = "<p><b>" + proteinText + "</b> is a <b>" + typeOfModel + "</b> model. It is located in " +
            "<b>" + locationOfModel + "</b><\p>";

        var workspaceuri = sparqlUtils.myWorkspaneName + "/" + "rawfile" + "/" + "HEAD" + "/" + cellmlModelEntity;

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
            baseUrl = "https://www.ebi.ac.uk/Tools/services/rest/clustalo";

        miscellaneous.proteinOrMedPrID(membraneModelID, PID);
        console.log("PID BEFORE: ", PID);

        // var draggedMedPrID = miscellaneous.splitPRFromProtein(circleID);
        // PID.push(draggedMedPrID);

        var indexOfPR = proteinName.search("PR_");
        var draggedMedPrID = proteinName.slice(indexOfPR + 3, proteinName.length);
        PID.push(draggedMedPrID);

        console.log("darggedMedPr: ", draggedMedPrID);

        console.log("PID BEFORE Filter: ", PID);

        // remove duplicate protein ID
        PID = PID.filter(function (item, pos) {
            return PID.indexOf(item) == pos;
        });

        console.log("PID AFTER Filter: ", PID);

        // PID does NOT start with P or Q
        for (var key in PID) {
            // console.log("PID[key]: ", PID[key]);
            if (PID[key].charAt(0) == "Q") continue;

            if (PID[key].charAt(0) != "P") {
                PID[key] = "P" + PID[key].replace(/^0+/, ""); // Or parseInt("065", 10);
            }
        }

        console.log("PID AFTER: ", PID);

        // https://www.ebi.ac.uk/seqdb/confluence/pages/viewpage.action?pageId=48923608
        // https://www.ebi.ac.uk/seqdb/confluence/display/WEBSERVICES/clustalo_rest
        var WSDbfetchREST = function () {

            // var dbfectendpoint = "http://www.ebi.ac.uk/Tools/dbfetch/dbfetch/uniprotkb/" + PID[index] + "/fasta";
            var cors_api_url = "http://localhost:8080/",
                // dbfectendpoint = cors_api_url + "https://www.ebi.ac.uk/Tools/dbfetch/dbfetch/uniprotkb/" + PID[index] + "/fasta";
                dbfectendpoint = "https://www.ebi.ac.uk/Tools/dbfetch/dbfetch/uniprotkb/" + PID[index] + "/fasta";

            ajaxUtils.sendGetRequest(
                dbfectendpoint,
                function (psequence) {
                    ProteinSeq += psequence;

                    // PID is empty
                    if (PID.length == 1) { // in fact, PID.length == 0, to enable the above dbfectendpoint query

                        var indexOfBar = psequence.search(/\|/gi),
                            indexOfBar2 = psequence.slice(indexOfBar + 1, psequence.length).search(/\|/gi),
                            t1 = psequence.slice(0, indexOfBar + indexOfBar2 + 1),
                            t2 = psequence.slice(indexOfBar + indexOfBar2 + 1);

                        psequence = t1 + "0" + t2;
                        ProteinSeq += psequence;

                        console.log("ProteinSeq when empty: ", ProteinSeq, PID);
                    }

                    index++;
                    if (index == PID.length) {
                        // console.log("ProteinSeq: ", ProteinSeq);

                        requestData = {
                            "sequence": ProteinSeq,
                            "email": "dsar941@aucklanduni.ac.nz"
                        }

                        var requestUrl = baseUrl + "/run/";

                        ajaxUtils.sendEBIPostRequest(
                            requestUrl,
                            requestData,
                            function (jobId) {
                                // console.log("jobId: ", jobId); // jobId

                                var chkJobStatus = function (jobId) {
                                    var jobIdUrl = baseUrl + "/status/" + jobId;
                                    ajaxUtils.sendGetRequest(
                                        jobIdUrl,
                                        function (resultObj) {
                                            console.log("result: ", resultObj); // jobId status

                                            if (resultObj == "RUNNING") {
                                                setTimeout(function () {
                                                    chkJobStatus(jobId);
                                                }, 5000);
                                            }

                                            var pimUrl = baseUrl + "/result/" + jobId + "/pim";
                                            ajaxUtils.sendGetRequest(
                                                pimUrl,
                                                function (identityMatrix) {

                                                    var similarityOBJ = miscellaneous.similarityMatrixEBI(
                                                        identityMatrix, PID, draggedMedPrID, membraneModelObj);

                                                    var tempList = [];
                                                    for (var i = 0; i < membraneModelObj.length; i++) {
                                                        for (var j = 0; j < membraneModelID.length; j++) {

                                                            var tempID = miscellaneous.splitPRFromProtein(membraneModelID[j]);
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

                                                    // apical or basolateral membrane
                                                    var membraneModel = "<p id=membraneModelsID><b>" + membraneName + " model</b>";

                                                    for (var i = 0; i < membraneModelObj.length; i++) {

                                                        var workspaceuri = sparqlUtils.myWorkspaneName + "/" + "rawfile" + "/" + "HEAD" + "/" + membraneModelID[i][0];

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
                                                            label.innerHTML = '<br><input id="' + alternativeModelObj[i].modelEntity + '" ' +
                                                                'type="checkbox" value="' + alternativeModelObj[i].modelEntity + '">' +
                                                                '<a href="' + workspaceuri + '" target="_blank" ' +
                                                                'data-toggle="tooltip" data-placement="right" ' +
                                                                'title="Protein name: ' + alternativeModelObj[i].prname + '\n' +
                                                                'Protein uri: ' + alternativeModelObj[i].protein + '\n' +
                                                                'Model entity: ' + alternativeModelObj[i].modelEntity + '"' +
                                                                '>' + alternativeModelObj[i].prname + '</a></label>';

                                                            alternativeModel += label.innerHTML;
                                                        }
                                                    }

                                                    // related organ models (kidney, lungs, etc) in PMR
                                                    var relatedOrganModel = "<p id=relatedOrganModelID><b>" + typeOfModel + " model in PMR</b>";
                                                    if (relatedModelObj.length == 1) { // includes own protein name
                                                        relatedOrganModel += "<br>Not Exist" + "<br>";
                                                    }
                                                    else {
                                                        for (var i = 0; i < relatedModelObj.length; i++) {

                                                            if (proteinName == relatedModelObj[i].protein)
                                                                continue;

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

    // reinitialize variable for next miscellaneous.iteration
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

    // MODEL DISCOVERY: display discovered models from PMR
    mainUtils.showDiscoverModels = function () {

        // Empty search result
        if (head.length == 0) {
            $("#searchList").html("<section class=container-fluid><label><br>No Search Results!</label></section>");
            $("#searchTxt").attr("value", "");
            return;
        }

        // Reinitialize for a new search result
        $("#searchList").html("");

        var table = $("<table/>").addClass("table table-hover table-condensed"); //table-bordered table-striped

        // Table header
        var thead = $("<thead/>"), tr = $("<tr/>"), i;
        for (var i in head) {
            tr.append($("<th/>").append(head[i]));
        }

        thead.append(tr);
        table.append(thead);

        // Table body
        var tbody = $("<tbody/>");
        for (var i in modelEntity) {
            tr = $("<tr/>");

            var modelhtm = '<fieldset id="' + modelEntity[i] + '" class="majorpoints"><legend class="majorpointslegend">' + modelEntity[i] + '</legend>' +
                '<div id="' + modelEntity[i] + '" class="hiders" style="display: none"></div></fieldset>';

            tr.append($("<td/>").append(modelhtm)); // model

            // tr.append($("<td/>").append(modelEntity[i].model)); // model
            tr.append($("<td/>").append(biologicalMeaning[i])); // biological meaning

            tr.append($("<td/>").append(speciesList[i])); // species

            tr.append($("<td/>").append(geneList[i])); // gene

            tr.append($("<td/>").append(proteinList[i])); // protein

            tbody.append(tr);
        }

        table.append(tbody);
        $("#searchList").append(table);

        $('.majorpoints').click(function () {

            reinitVariable();
            cellmlModelEntity = $(this)[0].id;

            if ($(this)[0].childNodes[1].innerText == "") {
                miscellaneous.showLoading($(this)[0].lastChild);
                dropcircle();
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

/***/ }),
/* 1 */
/***/ (function(module, exports) {

/**
 * Created by Dewan Sarwar on 5/8/2017.
 */
// Show loading icon inside element identified by 'selector'.
var showLoading = function (selector) {
    $(selector).html("<div class='text-center'><img src='../src/img/ajax-loader.gif'></div>");
};

// extract species, gene, and protein names
var parseModelName = function (modelEntity) {
    var indexOfHash = modelEntity.search("#"),
        modelName = modelEntity.slice(0, indexOfHash);

    return modelName;
};

// remove duplicate relatedModel
var uniqueify = function (es) {
    var retval = [];
    es.forEach(function (e) {
        for (var j = 0; j < retval.length; j++) {
            if (retval[j] === e)
                return;
        }
        retval.push(e);
    });
    return retval;
};

// separate cellml model and variable name from a model entity
var modelVariableName = function (element) {
    // remove duplicate components with same variable
    var indexOfHash = element.search("#"),
        cellmlModelName = element.slice(0, indexOfHash), // weinstein_1995.cellml
        componentVariableName = element.slice(indexOfHash + 1), // NHE3.J_NHE3_Na
        indexOfDot = componentVariableName.indexOf("."),
        variableName = componentVariableName.slice(indexOfDot + 1); // J_NHE3_Na

    return [cellmlModelName, variableName];
};

// remove duplicate entity (cellml model and variable name)
var uniqueifyjsonModel = function (es) {
    var retval = [];
    es.forEach(function (e) {
        for (var j = 0; j < retval.length; j++) {
            var temp1 = modelVariableName(retval[j].Model_entity.value),
                temp2 = modelVariableName(e.Model_entity.value);
            if (temp1[0] == temp2[0] && temp1[1] == temp2[1])
                return;
        }
        retval.push(e);
    });
    return retval;
};

// Remove duplicate links
var uniqueifyjsonFlux = function (es) {
    var retval = [];
    es.forEach(function (e) {
        for (var j = 0; j < retval.length; j++) {
            if (retval[j].source_fma.value === e.source_fma.value &&
                retval[j].sink_fma.value === e.sink_fma.value)
                return;
        }

        if (e.source_fma.value != e.sink_fma.value)
            retval.push(e);
    });
    return retval;
};

// Remove duplicate fma
var uniqueifyEpithelial = function (es) {
    var retval = [];
    es.forEach(function (e) {
        for (var j = 0; j < retval.length; j++) {
            if (retval[j].name === e.name && retval[j].fma === e.fma)
                return;
        }
        retval.push(e);
    });
    return retval;
};

// Utility to calculate number of iterations
var iteration = function (length) {
    var sum = 0;
    for (var i = 0; i < length; i++) {
        sum = sum + (length - i - 1);
    }

    return sum;
};

var isExist = function (element, templistOfModel) {
    // remove duplicate components with same variable and cellml model
    var indexOfHash = element.search("#"),
        cellmlModelName = element.slice(0, indexOfHash), // weinstein_1995.cellml
        componentVariableName = element.slice(indexOfHash + 1), // NHE3.J_NHE3_Na
        indexOfDot = componentVariableName.indexOf("."),
        variableName = componentVariableName.slice(indexOfDot + 1); // J_NHE3_Na

    for (var i = 0; i < templistOfModel.length; i++) {
        var indexOfHash2 = templistOfModel[i].search("#"),
            cellmlModelName2 = templistOfModel[i].slice(0, indexOfHash2), // weinstein_1995.cellml
            componentVariableName2 = templistOfModel[i].slice(indexOfHash2 + 1), // NHE3.J_NHE3_Na
            indexOfDot2 = componentVariableName2.indexOf("."),
            variableName2 = componentVariableName2.slice(indexOfDot2 + 1); // J_NHE3_Na

        if (cellmlModelName == cellmlModelName2 && variableName == variableName2) {
            return true;
        }
    }

    return false;
};

// split PR_ from protein identifier
var splitPRFromProtein = function (tempMemModelID) {
    var indexOfPR;
    if (tempMemModelID[9] == "") {
        indexOfPR = tempMemModelID[16].search("PR_");
        return tempMemModelID[16].slice(indexOfPR + 3, tempMemModelID[16].length);
    }
    else {
        indexOfPR = tempMemModelID[9].search("PR_");
        return tempMemModelID[9].slice(indexOfPR + 3, tempMemModelID[9].length);
    }
};

// split PR_ from protein identifier
var proteinOrMedPrID = function (membraneModelID, PID) {
    for (var i = 0; i < membraneModelID.length; i++) {
        if (membraneModelID[i][9] == "") {
            var indexOfPR = membraneModelID[i][16].search("PR_"),
                medProteinID = membraneModelID[i][16].slice(indexOfPR + 3, membraneModelID[i][16].length);

            PID.push(medProteinID); // Mediator PROTEIN id
        }
        else {
            var indexOfPR = membraneModelID[i][9].search("PR_"),
                medProteinID = membraneModelID[i][9].slice(indexOfPR + 3, membraneModelID[i][9].length);

            PID.push(medProteinID); // Mediator PROTEIN id
        }
    }
};

// process EBI similarity matrix
var similarityMatrixEBI = function (identityMatrix, PID, draggedMedPrID, membraneModelObj) {
    // console.log("Identity Matrix: ", identityMatrix);

    var indexOfColon = identityMatrix.search("1:"), m, n, i, j;

    // console.log("index1stBar: ", identityMatrix.slice(indexOfColon - 1, identityMatrix.length));
    identityMatrix = identityMatrix.slice(indexOfColon - 1, identityMatrix.length);

    // console.log("New Identity Matrix: ", identityMatrix);

    var matrixArray = identityMatrix.match(/[(\w\:)*\d\.]+/gi),
        proteinIndex = [],
        twoDMatrix = [];

    // console.log("matrixArray: ", matrixArray);

    for (i = 0; i < matrixArray.length; i = i + PID.length + 3) // +3 for digit:, PID, and Genes and Species
        matrixArray.splice(i, 1);

    for (i = 0; i < matrixArray.length; i = i + PID.length + 2) // +2 for PID and Genes and Species
        matrixArray.splice(i, 1);

    for (i = 1; i < matrixArray.length; i = i + PID.length + 1) // +1 for PID
        matrixArray.splice(i, 1);

    // console.log("matrixArray: ", matrixArray);

    for (i = 0; i < matrixArray.length; i++) {
        if (matrixArray[i].charAt(0).match(/[A-Za-z]/gi)) {
            proteinIndex.push([matrixArray[i], i]);
        }
    }

    // console.log("proteinIndex: ", proteinIndex);

    // 1D to 2D array
    while (matrixArray.length) {
        matrixArray.splice(0, 1); // remove protein ID
        twoDMatrix.push(matrixArray.splice(0, proteinIndex.length));
    }

    for (i = 0; i < twoDMatrix.length; i++) {
        for (j = 0; j < twoDMatrix[i].length; j++) {
            twoDMatrix[i][j] = parseFloat(twoDMatrix[i][j]);
        }
    }

    // console.log("twoDMatrix: ", twoDMatrix);

    var similarityOBJ = [];
    for (i = 0; i < twoDMatrix.length; i++) {
        for (j = 0; j < twoDMatrix.length; j++) {
            if (i == j || j < i) continue;

            similarityOBJ.push({
                "PID1": proteinIndex[i][0],
                "PID2": proteinIndex[j][0],
                "similarity": twoDMatrix[i][j]
            })
        }
    }

    // length is empty when 100% matching
    // appended a 0 bit after its protein id and make a comparision
    if (similarityOBJ.length != 0) {
        for (m = 0; m < membraneModelObj.length; m++) {
            for (n = 0; n < similarityOBJ.length; n++) {
                if ((membraneModelObj[m].pid == similarityOBJ[n].PID1 &&
                    draggedMedPrID == similarityOBJ[n].PID2) ||
                    (membraneModelObj[m].pid == similarityOBJ[n].PID2 &&
                        draggedMedPrID == similarityOBJ[n].PID1)) {
                    membraneModelObj[m].similar = similarityOBJ[n].similarity;
                }
            }
        }

        // Descending sorting
        membraneModelObj.sort(function (a, b) {
            return b.similar - a.similar;
        });
    }

    // console.log("AFTER membraneModelObj: ", membraneModelObj);

    return similarityOBJ;
};

exports.parseModelName = parseModelName;
exports.uniqueify = uniqueify;
exports.uniqueifyEpithelial = uniqueifyEpithelial;
exports.iteration = iteration;
exports.showLoading = showLoading;
exports.uniqueifyjsonModel = uniqueifyjsonModel;
exports.isExist = isExist;
exports.uniqueifyjsonFlux = uniqueifyjsonFlux;
exports.splitPRFromProtein = splitPRFromProtein;
exports.proteinOrMedPrID = proteinOrMedPrID;
exports.similarityMatrixEBI = similarityMatrixEBI;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// Returns an HTTP request object
function getRequestObject() {
    if (window.XMLHttpRequest) {
        return (new XMLHttpRequest());
    }
    else if (window.ActiveXObject) {
        // For very old IE browsers (optional)
        return (new ActiveXObject("Microsoft.XMLHTTP"));
    }
    else {
        alert("Ajax is not supported!");
        return (null);
    }
}

// Makes an Ajax GET request to 'requestUrl'
var sendGetRequest = function (requestUrl, responseHandler, isJsonResponse) {
    var request = getRequestObject();

    request.onreadystatechange = function () {
        handleResponse(request, responseHandler, isJsonResponse);
    };
    request.open("GET", requestUrl, true);
    request.send(null); // for POST only
};

// Makes an Ajax POST request to 'requestUrl'
var sendPostRequest = function (requestUrl, query, responseHandler, isJsonResponse) {
    var request = getRequestObject();

    request.onreadystatechange = function () {
        handleResponse(request, responseHandler, isJsonResponse);
    };

    request.open("POST", requestUrl, true);

    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.setRequestHeader("Accept", "application/sparql-results+json");

    request.send(query); // for POST only
};

// post function to get similarity matrix
var sendEBIPostRequest = function (requestUrl, query, responseHandler, isJsonResponse) {
    var request = getRequestObject();

    request.onreadystatechange = function () {
        handleResponse(request, responseHandler, isJsonResponse);
    };

    request.open("POST", requestUrl, true);

    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.setRequestHeader("Accept", "text/plain");

    var data = "";
    for (var key in query) {
        data += encodeURIComponent(key);
        data += "=";
        data += encodeURIComponent(query[key]);
        data += "&";
    }
    // console.log("data: ", data);
    request.send(data); // for POST only
}

// Only calls user provided 'responseHandler'
// function if response is ready
// and not an error
function handleResponse(request, responseHandler, isJsonResponse) {

    if ((request.readyState == 4) && (request.status == 200)) {

        // Default to isJsonResponse = true
        if (isJsonResponse == undefined) {
            isJsonResponse = true;
        }

        if (isJsonResponse) {
            responseHandler(JSON.parse(request.responseText));
        }
        else {
            responseHandler(request.responseText);
        }
    }

    else if (request.readyState == 4) {
        console.log("ERROR!");
        console.error(request.responseText);
    }
}

exports.sendGetRequest = sendGetRequest;
exports.sendPostRequest = sendPostRequest;
exports.sendEBIPostRequest = sendEBIPostRequest;
exports.getRequestObject = getRequestObject;
exports.handleResponse = handleResponse;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

/**
 * Created by Dewan Sarwar on 14/01/2018.
 */
// var endpoint = "https://models.physiomeproject.org/pmr2_virtuoso_search";
var pmrEndpoint = "https://models.physiomeproject.org/pmr2_virtuoso_search",
    cors_api_url = "http://localhost:8080/",
    // endpoint = cors_api_url + pmrEndpoint;
    endpoint = pmrEndpoint;

var ebiOntoEndpoint = "https://www.ebi.ac.uk/ols/ontologies";
var abiOntoEndpoint = "http://ontology.cer.auckland.ac.nz/ols-boot/api/ontologies";

var organ = [
    {
        "key": [
            {
                "key": "http://identifiers.org/fma/FMA:7203",
                "value": "kidney"
            },
            {
                "key": "http://identifiers.org/fma/FMA:84666",
                "value": "apical plasma membrane"
            },
            {
                "key": "http://identifiers.org/fma/FMA:70973",
                "value": "epithelial cell of proximal tubule"
            },
            {
                "key": "http://identifiers.org/fma/FMA:70981",
                "value": "epithelial cell of Distal tubule"
            },
            {
                "key": "http://identifiers.org/fma/FMA:17693",
                "value": "proximal convoluted tubule"
            },
            {
                "key": "http://identifiers.org/fma/FMA:17721",
                "value": "distal convoluted tubule"
            },
            {
                "key": "http://identifiers.org/fma/FMA:66836",
                "value": "portion of cytosol"
            },
            {
                "key": "http://identifiers.org/fma/FMA:84669",
                "value": "basolateralMembrane plasma membrane"
            },
            {
                "key": "http://identifiers.org/fma/FMA:17716",
                "value": "proximal straight tubule"
            },
            {
                "key": "http://identifiers.org/fma/FMA:17717",
                "value": "ascending limb of loop of Henle"
            },
            {
                "key": "http://identifiers.org/fma/FMA:17705",
                "value": "descending limb of loop of Henle"
            },
            {
                "key": "http://identifiers.org/go/GO:0072061",
                "value": "inner medullary collecting duct development"
            },
            {
                "key": "http://identifiers.org/ma/MA:0002595",
                "value": "renal medullary capillary"
            },
            {
                "key": "http://identifiers.org/uberon/UBERON:0004726",
                "value": "vasa recta"
            },
            {
                "key": "http://identifiers.org/uberon/UBERON:0009091",
                "value": "vasa recta ascending limb"
            },
            {
                "key": "http://identifiers.org/uberon/UBERON:0004775",
                "value": "outer renal medulla vasa recta"
            },
            {
                "key": "http://identifiers.org/uberon/UBERON:0004776",
                "value": "inner renal medulla vasa recta"
            }
        ],

        "value": "Kidney"
    }
];

var dictionary = [
    {
        "key1": "flux", "key2": "",
        "opb": "<http://identifiers.org/opb/OPB_00593>", "chebi": ""
    },
    {
        "key1": "flux", "key2": "sodium",
        "opb": "<http://identifiers.org/opb/OPB_00593>",
        "chebi": "<http://identifiers.org/chebi/CHEBI:29101>"
    },
    {
        "key1": "flux", "key2": "hydrogen",
        "opb": "<http://identifiers.org/opb/OPB_00593>",
        "chebi": "<http://identifiers.org/chebi/CHEBI:15378>"
    },
    {
        "key1": "flux", "key2": "ammonium",
        "opb": "<http://identifiers.org/opb/OPB_00593>",
        "chebi": "<http://identifiers.org/chebi/CHEBI:28938>"
    },
    {
        "key1": "flux", "key2": "chloride",
        "opb": "<http://identifiers.org/opb/OPB_00593>",
        "chebi": "<http://identifiers.org/chebi/CHEBI:17996>"
    },
    {
        "key1": "flux", "key2": "potassium",
        "opb": "<http://identifiers.org/opb/OPB_00593>",
        "chebi": "<http://identifiers.org/chebi/CHEBI:29103>"
    },
    {
        "key1": "concentration", "key2": "",
        "opb": "<http://identifiers.org/opb/OPB_00340>", "chebi": ""
    },
    {
        "key1": "concentration", "key2": "sodium",
        "opb": "<http://identifiers.org/opb/OPB_00340>",
        "chebi": "<http://identifiers.org/chebi/CHEBI:29101>"
    },
    {
        "key1": "concentration", "key2": "hydrogen",
        "opb": "<http://identifiers.org/opb/OPB_00340>",
        "chebi": "<http://identifiers.org/chebi/CHEBI:15378>"
    },
    {
        "key1": "concentration", "key2": "ammonium",
        "opb": "<http://identifiers.org/opb/OPB_00340>",
        "chebi": "<http://identifiers.org/chebi/CHEBI:28938>"
    },
    {
        "key1": "concentration", "key2": "chloride",
        "opb": "<http://identifiers.org/opb/OPB_00340>",
        "chebi": "<http://identifiers.org/chebi/CHEBI:17996>"
    },
    {
        "key1": "concentration", "key2": "potassium",
        "opb": "<http://identifiers.org/opb/OPB_00340>",
        "chebi": "<http://identifiers.org/chebi/CHEBI:29103>"
    }
];

var usecaseHtml = "./snippets/usecase-snippet.html";

var epithelialcellID = "http://purl.obolibrary.org/obo/CL_0000066";
var apicalID = "http://identifiers.org/fma/FMA:84666";
var basolateralID = "http://identifiers.org/fma/FMA:84669";
var partOfProteinUri = "http://purl.obolibrary.org/obo/PR";
var partOfCellUri = "http://purl.obolibrary.org/obo/CL";
var partOfGOUri = "http://identifiers.org/go/GO";
var partOfCHEBIUri = "http://identifiers.org/chebi/CHEBI";

var paracellularID = "http://identifiers.org/fma/FMA:67394";
var luminalID = "http://identifiers.org/fma/FMA:74550";
var cytosolID = "http://identifiers.org/fma/FMA:66836";
var interstitialID = "http://identifiers.org/fma/FMA:9673";
var Nachannel = "http://purl.obolibrary.org/obo/PR_000014527";
var Clchannel = "http://purl.obolibrary.org/obo/PR_Q06393";
var Kchannel = "http://purl.obolibrary.org/obo/PR_P15387";
var partOfFMAUri = "http://identifiers.org/fma/FMA";

var myWorkspaneName = "https://models.physiomeproject.org/workspace/267";

var makecotransporterSPARQL = function (membrane1, membrane2) {
    var query = "PREFIX semsim: <http://www.bhi.washington.edu/SemSim#>" +
        "PREFIX ro: <http://www.obofoundry.org/ro/ro.owl#>" +
        "SELECT ?med_entity_uri ?med_entity_uriCl " +
        "WHERE { GRAPH ?Workspace { " +
        "<" + membrane1 + "> semsim:isComputationalComponentFor ?model_prop. " +
        "?model_prop semsim:physicalPropertyOf ?model_proc. " +
        "?model_proc semsim:hasMediatorParticipant ?model_medparticipant. " +
        "?model_medparticipant semsim:hasPhysicalEntityReference ?med_entity. " +
        "?med_entity semsim:hasPhysicalDefinition ?med_entity_uri." +
        "<" + membrane2 + "> semsim:isComputationalComponentFor ?model_propCl. " +
        "?model_propCl semsim:physicalPropertyOf ?model_procCl. " +
        "?model_procCl semsim:hasMediatorParticipant ?model_medparticipantCl. " +
        "?model_medparticipantCl semsim:hasPhysicalEntityReference ?med_entityCl. " +
        "?med_entityCl semsim:hasPhysicalDefinition ?med_entity_uriCl." +
        "FILTER (?med_entity_uri = ?med_entity_uriCl) . " +
        "}}";

    return query;
};

var discoveryWithFlux = function (uriOPB) {
    var query = "PREFIX semsim: <http://www.bhi.washington.edu/SemSim#>" +
        "PREFIX dcterms: <http://purl.org/dc/terms/>" +
        "SELECT ?Model_entity ?Biological_meaning " +
        "WHERE { " +
        "?property semsim:hasPhysicalDefinition " + uriOPB + ". " +
        "?Model_entity semsim:isComputationalComponentFor ?property. " +
        "?Model_entity dcterms:description ?Biological_meaning." +
        "}";

    return query;
};

var discoveryWithFluxOfSolute = function (uriCHEBI) {
    var query = "PREFIX semsim: <http://www.bhi.washington.edu/SemSim#>" +
        "PREFIX dcterms: <http://purl.org/dc/terms/>" +
        "SELECT DISTINCT ?g ?Model_entity ?Biological_meaning " +
        "WHERE { GRAPH ?g { " +
        "?entity semsim:hasPhysicalDefinition " + uriCHEBI + ". " +
        "?source semsim:hasPhysicalEntityReference ?entity. " +
        "?process semsim:hasSourceParticipant ?source. " +
        "?property semsim:physicalPropertyOf ?process. " +
        "?Model_entity semsim:isComputationalComponentFor ?property. " +
        "?Model_entity dcterms:description ?Biological_meaning." +
        "}}";

    return query;
};

var discoveryWithConcentrationOfSolute = function (uriCHEBI) {
    var query = "PREFIX semsim: <http://www.bhi.washington.edu/SemSim#>" +
        "PREFIX dcterms: <http://purl.org/dc/terms/>" +
        "SELECT ?Model_entity ?Biological_meaning " +
        "WHERE { " +
        "?entity semsim:hasPhysicalDefinition " + uriCHEBI + ". " +
        "?property semsim:physicalPropertyOf ?entity. " +
        "?Model_entity semsim:isComputationalComponentFor ?property. " +
        "?Model_entity dcterms:description ?Biological_meaning." +
        "}";

    return query;
};

var relatedMembraneSPARQL = function (fstCHEBI, sndCHEBI, membrane) {
    var query = "PREFIX semsim: <http://www.bhi.washington.edu/SemSim#>" +
        "SELECT ?Model_entity ?Model_entity2 " +
        "WHERE { GRAPH ?g { " +
        "?entity semsim:hasPhysicalDefinition <" + fstCHEBI + ">. " +
        "?source semsim:hasPhysicalEntityReference ?entity. " +
        "?process semsim:hasSourceParticipant ?source. " +
        "?property semsim:physicalPropertyOf ?process. " +
        "?Model_entity semsim:isComputationalComponentFor ?property." +
        "?process semsim:hasMediatorParticipant ?model_medparticipant." +
        "?model_medparticipant semsim:hasPhysicalEntityReference ?med_entity." +
        "?med_entity semsim:hasPhysicalDefinition <" + membrane + ">." +
        "?entity2 semsim:hasPhysicalDefinition <" + sndCHEBI + ">. " +
        "?source2 semsim:hasPhysicalEntityReference ?entity2. " +
        "?process2 semsim:hasSourceParticipant ?source2. " +
        "?property2 semsim:physicalPropertyOf ?process2. " +
        "?Model_entity2 semsim:isComputationalComponentFor ?property2." +
        "?process2 semsim:hasMediatorParticipant ?model_medparticipant2." +
        "?model_medparticipant2 semsim:hasPhysicalEntityReference ?med_entity2." +
        "?med_entity2 semsim:hasPhysicalDefinition <" + membrane + ">." +
        "}}";

    return query;
};

var relatedMembraneModelSPARQL = function (model_entity, model_entity2) {
    var query;
    if (model_entity2 == "") {
        query = "PREFIX semsim: <http://www.bhi.washington.edu/SemSim#>" +
            "PREFIX ro: <http://www.obofoundry.org/ro/ro.owl#>" +
            "SELECT ?source_fma ?sink_fma ?med_entity_uri ?solute_chebi ?solute_chebi2 " +
            "WHERE { " +
            "<" + model_entity + "> semsim:isComputationalComponentFor ?model_prop. " +
            "?model_prop semsim:physicalPropertyOf ?model_proc. " +
            "?model_proc semsim:hasSourceParticipant ?model_srcparticipant. " +
            "?model_srcparticipant semsim:hasPhysicalEntityReference ?source_entity. " +
            "?source_entity ro:part_of ?source_part_of_entity. " +
            "?source_part_of_entity semsim:hasPhysicalDefinition ?source_fma. " +
            "?source_entity semsim:hasPhysicalDefinition ?solute_chebi. " +
            "?source_entity semsim:hasPhysicalDefinition ?solute_chebi2. " + // change this later
            "?model_proc semsim:hasSinkParticipant ?model_sinkparticipant. " +
            "?model_sinkparticipant semsim:hasPhysicalEntityReference ?sink_entity. " +
            "?sink_entity ro:part_of ?sink_part_of_entity. " +
            "?sink_part_of_entity semsim:hasPhysicalDefinition ?sink_fma." +
            "?model_proc semsim:hasMediatorParticipant ?model_medparticipant." +
            "?model_medparticipant semsim:hasPhysicalEntityReference ?med_entity." +
            "?med_entity semsim:hasPhysicalDefinition ?med_entity_uri." +
            "}";
    }
    else {
        query = "PREFIX semsim: <http://www.bhi.washington.edu/SemSim#>" +
            "PREFIX ro: <http://www.obofoundry.org/ro/ro.owl#>" +
            "SELECT ?source_fma ?sink_fma ?med_entity_uri ?solute_chebi ?source_fma2 ?sink_fma2 ?med_entity_uri2 ?solute_chebi2 " +
            "WHERE { " +
            "<" + model_entity + "> semsim:isComputationalComponentFor ?model_prop. " +
            "?model_prop semsim:physicalPropertyOf ?model_proc. " +
            "?model_proc semsim:hasSourceParticipant ?model_srcparticipant. " +
            "?model_srcparticipant semsim:hasPhysicalEntityReference ?source_entity. " +
            "?source_entity ro:part_of ?source_part_of_entity. " +
            "?source_part_of_entity semsim:hasPhysicalDefinition ?source_fma. " +
            "?source_entity semsim:hasPhysicalDefinition ?solute_chebi. " +
            "?model_proc semsim:hasSinkParticipant ?model_sinkparticipant. " +
            "?model_sinkparticipant semsim:hasPhysicalEntityReference ?sink_entity. " +
            "?sink_entity ro:part_of ?sink_part_of_entity. " +
            "?sink_part_of_entity semsim:hasPhysicalDefinition ?sink_fma." +
            "?model_proc semsim:hasMediatorParticipant ?model_medparticipant." +
            "?model_medparticipant semsim:hasPhysicalEntityReference ?med_entity." +
            "?med_entity semsim:hasPhysicalDefinition ?med_entity_uri." +
            "<" + model_entity2 + "> semsim:isComputationalComponentFor ?model_prop2. " +
            "?model_prop2 semsim:physicalPropertyOf ?model_proc2. " +
            "?model_proc2 semsim:hasSourceParticipant ?model_srcparticipant2. " +
            "?model_srcparticipant2 semsim:hasPhysicalEntityReference ?source_entity2. " +
            "?source_entity2 ro:part_of ?source_part_of_entity2. " +
            "?source_part_of_entity2 semsim:hasPhysicalDefinition ?source_fma2. " +
            "?source_entity2 semsim:hasPhysicalDefinition ?solute_chebi2. " +
            "?model_proc2 semsim:hasSinkParticipant ?model_sinkparticipant2. " +
            "?model_sinkparticipant2 semsim:hasPhysicalEntityReference ?sink_entity2. " +
            "?sink_entity2 ro:part_of ?sink_part_of_entity2. " +
            "?sink_part_of_entity2 semsim:hasPhysicalDefinition ?sink_fma2." +
            "?model_proc2 semsim:hasMediatorParticipant ?model_medparticipant2." +
            "?model_medparticipant2 semsim:hasPhysicalEntityReference ?med_entity2." +
            "?med_entity2 semsim:hasPhysicalDefinition ?med_entity_uri2." +
            "}";
    }

    return query;
};

exports.makecotransporterSPARQL = makecotransporterSPARQL;
exports.discoveryWithFlux = discoveryWithFlux;
exports.discoveryWithFluxOfSolute = discoveryWithFluxOfSolute;
exports.discoveryWithConcentrationOfSolute = discoveryWithConcentrationOfSolute;
exports.relatedMembraneSPARQL = relatedMembraneSPARQL;
exports.relatedMembraneModelSPARQL = relatedMembraneModelSPARQL;
exports.dictionary = dictionary;
exports.organ = organ;
exports.usecaseHtml = usecaseHtml;
exports.apicalID = apicalID;
exports.basolateralID = basolateralID;
exports.partOfProteinUri = partOfProteinUri;
exports.partOfCellUri = partOfCellUri;
exports.partOfGOUri = partOfGOUri;
exports.partOfCHEBIUri = partOfCHEBIUri;
exports.paracellularID = paracellularID;
exports.luminalID = luminalID;
exports.cytosolID = cytosolID;
exports.interstitialID = interstitialID;
exports.Nachannel = Nachannel;
exports.Clchannel = Clchannel;
exports.Kchannel = Kchannel;
exports.partOfFMAUri = partOfFMAUri;
exports.myWorkspaneName = myWorkspaneName;
exports.endpoint = endpoint;
exports.ebiOntoEndpoint = ebiOntoEndpoint;
exports.abiOntoEndpoint = abiOntoEndpoint;
exports.epithelialcellID = epithelialcellID;

/***/ })
/******/ ]);