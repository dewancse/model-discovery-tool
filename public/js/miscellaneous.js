/**
 * Created by Dewan Sarwar on 14/02/2019
 * User defined functions to support Model Discovery Tool
 */
// var endpoint = "https://models.physiomeproject.org/pmr2_virtuoso_search";
var endpoint = "/.api/pmr/sparql";

var abiOntoEndpointInternal = "http://ontology.cer.auckland.ac.nz/ols-boot/api/ontologies";
var abiOntoEndpoint = "/.api/ols/ontologies";
// var abiOntoEndpoint = "http://ontology.cer.auckland.ac.nz/ols-boot/api/ontologies";

// dictionary to identify type of organ models (kidney, lung, heart, etc)
// based on anatomical locations deposited in the Physiome Model Repository
var organ = [
    {
        "key": [
            {
                "key": "http://purl.obolibrary.org/obo/FMA_84669",
                "value": "Basolateral plasma membrane"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_70973",
                "value": "Epithelial cell of proximal tubule"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_17693",
                "value": "Proximal convoluted tubule"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_84666",
                "value": "Apical plasma membrane"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_66836",
                "value": "Portion of cytosol"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_280587",
                "value": "Portion of renal filtrate"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9673",
                "value": "Tissue fluid"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_15628",
                "value": "Collecting duct of renal tubule"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_86560",
                "value": "Intercalated cell of collecting duct of renal tubule"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_17716",
                "value": "Proximal straight tubule"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_7203",
                "value": "Kidney"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_17717",
                "value": "Ascending limb of loop of Henle"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_17705",
                "value": "Descending limb of loop of Henle"
            },
            {
                "key": "http://purl.obolibrary.org/obo/GO_0072061",
                "value": "inner medullary collecting duct development"
            },
            {
                "key": "http://purl.obolibrary.org/obo/MA_0002595",
                "value": "renal medullary capillary"
            },
            {
                "key": "http://purl.obolibrary.org/obo/UBERON_0004726",
                "value": "vasa recta"
            },
            {
                "key": "http://purl.obolibrary.org/obo/UBERON_0009091",
                "value": "vasa recta ascending limb"
            },
            {
                "key": "http://purl.obolibrary.org/obo/UBERON_0004775",
                "value": "outer renal medulla vasa recta"
            },
            {
                "key": "http://purl.obolibrary.org/obo/UBERON_0004776",
                "value": "inner renal medulla vasa recta"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_17721",
                "value": "Distal convoluted tubule"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_70981",
                "value": "Epithelial cell of distal tubule"
            }
        ],
        "value": "Kidney"
    },
    {
        "key": [
            {
                "key": "http://purl.obolibrary.org/obo/FMA_14067",
                "value": "Cardiac myocyte"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_66836",
                "value": "Portion of cytosol"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9672",
                "value": "Intercellular matrix"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_63841",
                "value": "Plasma membrane"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_72444",
                "value": "Cytoplasmic organelle matrix"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9462",
                "value": "Myocardium"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_67895",
                "value": "Sarcomere"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_67225",
                "value": "Sarcoplasmic reticulum"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_80352",
                "value": "Wall of smooth endoplasmic reticulum"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_62387",
                "value": "Junctional sarcoplasmic reticulum of cardiac muscle cell"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_62338",
                "value": "Troponin"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_62343",
                "value": "Calmodulin"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9892",
                "value": "Surface of fibrous pericardium"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9670",
                "value": "Portion of blood"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_70827",
                "value": "Set of pulmonary veins"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_87209",
                "value": "Distal zone of aorta"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_279896",
                "value": "Set of all pulmonary arterioles"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_14156",
                "value": "Wall of aorta"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_74653",
                "value": "Wall of arteriole"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_45626",
                "value": "Systemic venous system"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_11350",
                "value": "Pericardial cavity"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_7088",
                "value": "Heart"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_7098",
                "value": "Right ventricle"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_279851",
                "value": "Set of proximal epicardial branches of coronary arteries"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_14121",
                "value": "Pulmonary capillary"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_279902",
                "value": "Set of epicardial tributaries of all cardiac veins"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_45842",
                "value": "Pulmonary arterial tree organ"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_45623",
                "value": "Systemic arterial system"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_17555",
                "value": "Interstitial space"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_280556",
                "value": "Portion of body fluid"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_279921",
                "value": "Set of all epicardial branches of all coronary arteries"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_17530",
                "value": "Surface of lung"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9740",
                "value": "Pleural cavity"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_7101",
                "value": "Left ventricle"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_279935",
                "value": "Set of all systemic capillaries"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_7096",
                "value": "Right atrium"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_256135",
                "value": "Body"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_321896",
                "value": "Vena cava"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9531",
                "value": "Wall of left atrium"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_7097",
                "value": "Left atrium"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9533",
                "value": "Wall of right ventricle"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9457",
                "value": "Wall of right atrium"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9556",
                "value": "Wall of left ventricle"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9869",
                "value": "Pericardium"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_83108",
                "value": "Regular atrial cardiac myocyte"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_70022",
                "value": "Extracellular space"
            }
        ],
        "value": "Cardiac"
    },
    {
        "key": [
            {
                "key": "http://purl.obolibrary.org/obo/FMA_74793",
                "value": "Epithelial cell of trachea"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_9672",
                "value": "Intercellular matrix"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_84666",
                "value": "Apical plasma membrane"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_66836",
                "value": "Portion of cytosol"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_63842",
                "value": "Endoplasmic reticulum"
            }
        ],
        "value": "Lung"
    },
    {
        "key": [
            {
                "key": "http://purl.obolibrary.org/obo/FMA_67328",
                "value": "Muscle cell"
            }
        ],
        "value": "Musculoskeletal"
    },
    {
        "key": [
            {
                "key": "http://purl.obolibrary.org/obo/FMA_5914",
                "value": "Nerve fiber"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_63841",
                "value": "Plasma membrane"
            },
            {
                "key": "http://purl.obolibrary.org/obo/FMA_18644",
                "value": "Oocyte"
            }
        ],
        "value": "Miscellaneous"
    }
];

// dictionary to identify type of model (kidney, lung, heart, etc)
// based on protein identifier deposited in the Physiome Model Repository
var ProteinToOrganDict = [
    {
        "key": "http://purl.obolibrary.org/obo/CL_0002642",
        "value": "Cardiac"
    },
    {
        "key": "http://purl.obolibrary.org/obo/UBERON_0004535",
        "value": "Cardiac"
    },
    {
        "key": "http://purl.obolibrary.org/obo/CL_0000066",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/CL_0000187",
        "value": "Musculoskeletal"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_Q9JI66",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_Q64541",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/CL_0000082",
        "value": "Lung"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_P59158",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_P15920",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_P26434",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_P23562",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_Q9Z1B3",
        "value": "Cardiac"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_P11170",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/CL_0002131",
        "value": "Cardiac"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_Q9ET37",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_P31636",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_P63316",
        "value": "Cardiac"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_Q64578",
        "value": "Cardiac"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_P48764",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_G3X939",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_P26432",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_P26433",
        "value": "Kidney"
    },
    {
        "key": "http://purl.obolibrary.org/obo/PR_P28482",
        "value": "Miscellaneous"
    },
    {
        "key": "http://purl.obolibrary.org/obo/CL_0000786",
        "value": "Miscellaneous"
    }
];

// dictionary to interpret searched terms (flux of sodium, concentration of
// hydrogen, flux, concentration, etc) into OPB and CHEBI ontology URIs
var dictionary = [
    {
        "key1": "flux", "key2": "",
        "opb": "<http://identifiers.org/opb/OPB_00593>", "chebi": ""
    },
    {
        "key1": "flux", "key2": "sodium",
        "opb": "<http://identifiers.org/opb/OPB_00593>",
        "chebi": "<http://purl.obolibrary.org/obo/CHEBI_29101>"
    },
    {
        "key1": "flux", "key2": "hydrogen",
        "opb": "<http://identifiers.org/opb/OPB_00593>",
        "chebi": "<http://purl.obolibrary.org/obo/CHEBI_15378>"
    },
    {
        "key1": "flux", "key2": "ammonium",
        "opb": "<http://identifiers.org/opb/OPB_00593>",
        "chebi": "<http://purl.obolibrary.org/obo/CHEBI_28938>"
    },
    {
        "key1": "flux", "key2": "chloride",
        "opb": "<http://identifiers.org/opb/OPB_00593>",
        "chebi": "<http://purl.obolibrary.org/obo/CHEBI_17996>"
    },
    {
        "key1": "flux", "key2": "potassium",
        "opb": "<http://identifiers.org/opb/OPB_00593>",
        "chebi": "<http://purl.obolibrary.org/obo/CHEBI_29103>"
    },
    {
        "key1": "concentration", "key2": "",
        "opb": "<http://identifiers.org/opb/OPB_00340>", "chebi": ""
    },
    {
        "key1": "concentration", "key2": "sodium",
        "opb": "<http://identifiers.org/opb/OPB_00340>",
        "chebi": "<http://purl.obolibrary.org/obo/CHEBI_29101>"
    },
    {
        "key1": "concentration", "key2": "hydrogen",
        "opb": "<http://identifiers.org/opb/OPB_00340>",
        "chebi": "<http://purl.obolibrary.org/obo/CHEBI_15378>"
    },
    {
        "key1": "concentration", "key2": "ammonium",
        "opb": "<http://identifiers.org/opb/OPB_00340>",
        "chebi": "<http://purl.obolibrary.org/obo/CHEBI_28938>"
    },
    {
        "key1": "concentration", "key2": "chloride",
        "opb": "<http://identifiers.org/opb/OPB_00340>",
        "chebi": "<http://purl.obolibrary.org/obo/CHEBI_17996>"
    },
    {
        "key1": "concentration", "key2": "potassium",
        "opb": "<http://identifiers.org/opb/OPB_00340>",
        "chebi": "<http://purl.obolibrary.org/obo/CHEBI_29103>"
    }
];

// epithelial cell identifiers used in the biological annotation in PMR
var epithelialcellID = [
    "http://purl.obolibrary.org/obo/CL_0000066",
    "http://purl.obolibrary.org/obo/CL_0000786",
    "http://purl.obolibrary.org/obo/CL_0002642",
    "http://purl.obolibrary.org/obo/CL_0002131",
    "http://purl.obolibrary.org/obo/CL_0000082",
    "http://purl.obolibrary.org/obo/UBERON_0004535",
    "http://purl.obolibrary.org/obo/CL_0000187"
];

var apicalID = "http://purl.obolibrary.org/obo/FMA_84666";
var basolateralID = "http://purl.obolibrary.org/obo/FMA_84669";
var epcellofproximaltubule = "http://purl.obolibrary.org/obo/FMA_70973";
var partOfProteinUri = "http://purl.obolibrary.org/obo/PR";
var partOfCellUri = "http://purl.obolibrary.org/obo/CL";
var partOfGOUri = "http://purl.obolibrary.org/obo/GO";
var partOfCHEBIUri = "http://purl.obolibrary.org/obo/CHEBI";
var partOfUBERONUri = "http://purl.obolibrary.org/obo/UBERON";

var paracellularID = "http://purl.obolibrary.org/obo/FMA_67394";
// var luminalID = "http://purl.obolibrary.org/obo/FMA_74550";
var luminalID = "http://purl.obolibrary.org/obo/FMA_280787"; // portion of renal filtrate in proximal convoluted tubule
var cytosolID = "http://purl.obolibrary.org/obo/FMA_66836";
var interstitialID = "http://purl.obolibrary.org/obo/FMA_9673";
var Nachannel = "http://purl.obolibrary.org/obo/PR_000014527";
var Clchannel = "http://purl.obolibrary.org/obo/PR_Q06393";
var Kchannel = "http://purl.obolibrary.org/obo/PR_P15387";
var partOfFMAUri = "http://purl.obolibrary.org/obo/FMA";

var myWorkspaneName = "https://models.physiomeproject.org/workspace/267";

// show loading icon inside element identified by 'selector'.
var showLoading = function (selector) {
    $(selector).html("<div class='text-center'><img src='img/ajax-loader.gif'></div>");
};

// extract species, gene, and protein names
var parseModelName = function (modelEntity) {
    var indexOfHash = modelEntity.search("#"),
        modelName = modelEntity.slice(0, indexOfHash);

    return modelName;
};

// remove duplicate related models
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

// remove duplicate entities (cellml model and variable name)
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

// remove duplicate source and sink FMA terms
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

// remove duplicate FMA terms
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

// utility function to calculate number of iterations
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

// split PR_ from protein identifiers
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

// split PR_ from protein identifiers
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
    console.log("identityMatrix: ", identityMatrix);
    console.log("draggedMedPrID: ", draggedMedPrID);

    var indexOfColon = identityMatrix.search("1:"), m, n, i, j;
    identityMatrix = identityMatrix.slice(indexOfColon - 1, identityMatrix.length);

    console.log("identityMatrix: ", identityMatrix);

    var matrixArray = identityMatrix.match(/[(\w\:)*\d\.]+/gi), twoDMatrix = [];
    for (var i = 0; i < matrixArray.length; i++) {
        if (matrixArray[i].indexOf(".") == -1) {
            matrixArray.splice(i, 1);
            i--;
        }
    }

    console.log("matrixArray: ", matrixArray);

    // convert 1D to 2D array
    while (matrixArray.length) {
        twoDMatrix.push(matrixArray.splice(0, PID.length));
    }

    console.log("twoDMatrix: ", twoDMatrix);

    for (var i = 0; i < twoDMatrix[PID.length - 1].length - 1; i++) {
        membraneModelObj[i].similar = twoDMatrix[PID.length - 1][i];
    }

    console.log("membraneModelObj: ", membraneModelObj);

    // sorting in descending order of the similarity matrix score
    membraneModelObj.sort(function (a, b) {
        return b.similar - a.similar;
    });

    console.log("After membraneModelObj: ", membraneModelObj);
};

// checking type of organ model (kidney, cardiac, etc) wrt a protein URI
var checkTypeOfModel = function (ProteinToOrganDict, proteinURI) {
    for (var i = 0; i < ProteinToOrganDict.length; i++) {
        if (ProteinToOrganDict[i].key == proteinURI) {
            return ProteinToOrganDict[i].value;
        }
    }
};