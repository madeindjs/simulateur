const _ = require("lodash");
const openfisca = require("../lib/openfisca");
const openfiscaTest = require("../lib/openfisca/test");
const mongoose = require("mongoose");
const Situation = mongoose.model("Situation");
const Simulation = mongoose.model("Simulation");

exports.situation = function(req, res, next, situationId) {
    if (situationId && situationId._id) {
        req.situation = situationId;
        return next();
    }

    Situation.findById(situationId, function(err, situation) {
        if (err) return next(err);
        if (!situation) return res.sendStatus(404);

        req.situation = situation;
        next();
    });
};

exports.attachAccessCookie = function(req, res) {
    res.cookie(req.situation.cookieName, req.situation.token, {
        maxAge: 7 * 24 * 3600 * 1000,
        httpOnly: true
    });
};

exports.validateAccess = function(req, res, next) {
    if (req.situation.isAccessible(req.cookies)) return next();
    res.status(403).send({
        error: "You do not have access to this situation."
    });
};

exports.show = function(req, res) {
    res.send(req.situation);
};

// function clearCookies(req, res) {
//     var limit = 10;

//     var keys = Object.keys(req.cookies);
//     var situationCookies = _.filter(keys, function(k) { return k.startsWith(Situation.cookiePrefix); });
//     situationCookies.sort();

//     if (situationCookies.length-limit>=0) {
//         var cookieToClear = situationCookies.slice(0, situationCookies.length-limit);
//         cookieToClear.forEach(function(name) {
//             res.clearCookie(name, { httpOnly: true });
//         });
//     }
// }

exports.create = function(req, res, next) {
    if (req.body._id)
        return res.status(403).send({
            error:
                "You can‘t provide _id when saving a situation. _id will be generated automatically."
        });

    return Situation.create(
        _.omit(req.body, "createdAt", "status", "token"),
        function(err, persistedSituation) {
            if (err) return next(err);

            // clearCookies(req, res);
            req.situation = persistedSituation;
            exports.attachAccessCookie(req, res);
            res.send(persistedSituation);
        }
    );
};

exports.openfiscaResponse = function(req, res, next) {
    return openfisca.calculate(req.situation, function(err, simulation) {
        if (err) return next(Object.assign(err, { _id: req.situation._id }));

        simulation.situation = req.situation;
        Simulation.create(simulation);

        res.send(Object.assign(simulation, { _id: req.situation._id }));
    });
};

/**
 * @param {{[key: any]: number}} object
 * @returns {number}
 */
function getAverageObject(object) {
    const a =  getAverage(Object.values(object).filter(v => !Number.isNaN(v)));

    if (Number.isNaN(a)) {
        // console.log(object)
    }

    return Number.isNaN(a) ? 0 : a;

}

/**
 * @param {Array<number>} array
 * @returns {number}
 */
function getAverage(array) {
    var total = 0;
    for (var i = 0; i < array.length; i++) {
        total += array[i];
    }
    return Math.floor(total / array.length);
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
exports.getSimulationsData = async function(req, res, next) {

    console.log(req.situation)
    if (req.situation?._id === undefined) {
        return res.status(500).send("SituationId not defined");
    }

    /**
     * @type {Array}
     */
    const results = await mongoose.connection.db
        .collection("simulations")
        .find(
            {
                situation: req.situation._id
            },
            {
                projection: {
                    menages: 1,
                    individus: 1,
                    aides: 1,
                }
            }
        )
        .sort({ "individus.demandeur.salaire_net": 1 })
        .toArray();

    /**
     * @type {Chart.ChartDataSets}
     */
    const revenuDisponibleDataset = {
        label: "Revenu disponible",
        backgroundColor: "green",
        data: []
    };
    /**
     * @type {Chart.ChartDataSets}
     */
    const aidesDataset = {
        label: "aides",
        backgroundColor: "orange",
        data: []

    };

    /**
     * @type {Chart.ChartData}
     */
    const chartData = {
        labels: [],
        datasets: [],
        barPercentage: 1
    };
    /**
     * @type {Array<{salaireNet: number; aides: number; revenuDisponible: number}>}
     */
    const tableData = [];

    for (const result of results) {
        const aidesList = result.aides.droitsEligibles.filter(d => Number.isInteger(d.montant));
        const aides = aidesList.reduce((acc, d) => acc + Number(d.montant), 0)
        const menage = result.menages._;
        const demandeur = result.individus.demandeur;

        const salaireNet = getAverageObject(demandeur.salaire_net);
        const revenuDisponible = Math.floor(
            getAverageObject(menage.revenu_disponible) / 12
        );

        chartData.labels.push(salaireNet);
        revenuDisponibleDataset.data.push(revenuDisponible);
        aidesDataset.data.push(aides);
        tableData.push({aides, salaireNet, revenuDisponible, aidesList})
    }

    chartData.datasets = [
        revenuDisponibleDataset,
        aidesDataset
    ];

    return res.json({chartData, tableData});
};

exports.openfiscaTrace = function(req, res, next) {
    return openfisca.trace(req.situation, function(err, result) {
        if (err) return next(Object.assign(err, { _id: req.situation._id }));

        res.send(Object.assign(result, { _id: req.situation._id }));
    });
};

exports.openfiscaRequest = function(req, res) {
    res.send(openfisca.buildOpenFiscaRequest(req.situation));
};

exports.openfiscaRequestFromLegacy = function(req, res) {
    res.send(openfisca.buildOpenFiscaRequestFromLegacySituation(req.situation));
};

var DETAILS_DEFAULT_ATTRIBUTES = {
    absolute_error_margin: 10
};

// Attributes are sorted as they should appear in the YAML test file
var DETAILS_ATTRIBUTES = [
    "name",
    "description",
    "extension",
    "absolute_error_margin",
    "relative_error_margin",
    "output"
];

exports.openfiscaTest = function(req, res) {
    var details = _.assign(
        {},
        DETAILS_DEFAULT_ATTRIBUTES,
        _.pick(req.body, DETAILS_ATTRIBUTES)
    );
    if (!details.name || !details.description || !details.output) {
        return res.status(403).send({
            error: "You must provide a name, description and output."
        });
    }

    var situation = req.situation.toObject
        ? req.situation.toObject()
        : req.situation;
    res.type("yaml").send(openfiscaTest.generateYAMLTest(details, situation));
};
