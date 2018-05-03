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