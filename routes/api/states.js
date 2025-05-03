const express = require("express");
const router = express.Router();
const statesController = require("../../controllers/statesController");

// Routes for state data
router.route("/").get(statesController.getAllStates);

// Routes for specific state details
router.route("/:code").get(statesController.getState);

// Routes for funfacts
router
  .route("/:code/funfact")
  .get(statesController.getRandomFunFact)
  .post(statesController.addFunFacts)
  .patch(statesController.updateFunFact)
  .delete(statesController.deleteFunFact);

// Routes for state properties (capital, population, nickname, admission)
router.get("/:code/capital", statesController.getStateCapital);
router.get("/:code/population", statesController.getStatePopulation);
router.get("/:code/nickname", statesController.getStateNickname);
router.get("/:code/admission", statesController.getStateAdmission);

module.exports = router;
