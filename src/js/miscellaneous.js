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

exports.parseModelName = parseModelName;
exports.uniqueify = uniqueify;
exports.uniqueifyEpithelial = uniqueifyEpithelial;
exports.iteration = iteration;
exports.showLoading = showLoading;
exports.uniqueifyjsonModel = uniqueifyjsonModel;
exports.isExist = isExist;
exports.uniqueifyjsonFlux = uniqueifyjsonFlux;