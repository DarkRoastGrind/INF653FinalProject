const State = require("../model/States");
const path = require("path");
const fs = require("fs");

let allStates = [];

try {
  const dataPath = path.join(__dirname, "..", "model", "states.json");
  const rawData = fs.readFileSync(dataPath, "utf8");
  const parsedData = JSON.parse(rawData);
  if (Array.isArray(parsedData)) {
    allStates = parsedData;
  } else {
    console.error(
      "Expected an array in states.json but got:",
      typeof parsedData
    );
  }
} catch (err) {
  console.error("Failed to read or parse states.json:", err.message);
}

const getAllStates = async (req, res) => {
  try {
    let filteredStates = [...allStates];

    const contig = req.query?.contig;
    if (contig === "true") {
      filteredStates = filteredStates.filter(
        (state) => state.code !== "AK" && state.code !== "HI"
      );
    } else if (contig === "false") {
      filteredStates = filteredStates.filter(
        (state) => state.code === "AK" || state.code === "HI"
      );
    }

    const mongoStates = await State.find().lean();

    // Create a map of funfacts by state code
    const funfactsMap = {};
    mongoStates.forEach((s) => {
      if (s.funfacts?.length) {
        funfactsMap[s.stateCode] = s.funfacts;
      }
    });

    const result = filteredStates.map((state) => {
      const enriched = { ...state };
      if (funfactsMap[state.code]) {
        enriched.funfacts = funfactsMap[state.code];
      }
      return enriched;
    });

    res.json(result);
  } catch (error) {
    console.error("getAllStates error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRandomFunFact = async (req, res) => {
  const stateCode = req?.params?.code?.toUpperCase();

  // Validate state code against the states.json
  const stateData = allStates.find((state) => state.code === stateCode);
  if (!stateData) {
    return res
      .status(400)
      .json({ message: "Invalid state abbreviation parameter" });
  }

  // Lookup funfacts in MongoDB
  const mongoState = await State.findOne({ stateCode }).lean();

  if (!mongoState?.funfacts?.length) {
    return res
      .status(404)
      .json({ message: `No Fun Facts found for ${stateData.state}` });
  }

  // Pick a random funfact
  const randomIndex = Math.floor(Math.random() * mongoState.funfacts.length);
  const funfact = mongoState.funfacts[randomIndex];

  return res.json({ funfact });
};

const getStateCapital = async (req, res) => {
  const stateCode = req?.params?.code?.toUpperCase();

  // Validate state code against the states.json
  const stateData = allStates.find((state) => state.code === stateCode);
  if (!stateData) {
    return res
      .status(400)
      .json({ message: "Invalid state abbreviation parameter" });
  }

  // Build the response object for the capital
  const capital = {
    state: stateData.state,
    capital: stateData.capital_city,
  };

  // Lookup additional data (e.g., MongoDB)
  const mongoState = await State.findOne({ stateCode }).lean();
  if (mongoState) {
    // Optionally, add more info here if needed (e.g., funfacts, etc.)
    // For now, returning the capital as requested by the test cases
  }

  // Return the response with state and capital properties
  return res.json(capital);
};

const getStatePopulation = async (req, res) => {
  const stateCode = req?.params?.code?.toUpperCase();

  // Validate state code against the states.json
  const stateData = allStates.find((state) => state.code === stateCode);
  if (!stateData) {
    return res
      .status(400)
      .json({ message: "Invalid state abbreviation parameter" });
  }

  // Format the population with commas
  const populationFormatted = stateData.population
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Build the response object for state and population
  const population = {
    state: stateData.state,
    population: populationFormatted,
  };

  // Lookup additional data (optional)
  const mongoState = await State.findOne({ stateCode }).lean();
  if (mongoState) {
    // Optionally, you can enrich the response further with data from MongoDB
  }

  return res.json(population);
};

const getStateNickname = async (req, res) => {
  const stateCode = req?.params?.code?.toUpperCase();

  // Validate state code against the states.json
  const stateData = allStates.find((state) => state.code === stateCode);
  if (!stateData) {
    return res
      .status(400)
      .json({ message: "Invalid state abbreviation parameter" });
  }

  // Prepare the response object with state and nickname
  const nickname = {
    state: stateData.state,
    nickname: stateData.nickname,
  };

  return res.json(nickname);
};

const getStateAdmission = async (req, res) => {
  const stateCode = req?.params?.code?.toUpperCase();

  // Validate state code against the states.json
  const stateData = allStates.find((state) => state.code === stateCode);
  if (!stateData) {
    return res
      .status(400)
      .json({ message: "Invalid state abbreviation parameter" });
  }

  // Validate that 'admission_date' field exists
  if (!stateData.admission_date) {
    return res
      .status(400)
      .json({ message: "Admission date not available for this state" });
  }

  // Prepare the response object with state and admission date
  const admission = {
    state: stateData.state,
    admitted: stateData.admission_date, // Adjust to use 'admission_date'
  };

  return res.json(admission);
};

const addFunFacts = async (req, res) => {
  const stateCode = req.params.code.toUpperCase();

  // Validate the presence of funfacts in the request body
  if (!req?.body?.funfacts) {
    return res.status(400).json({ message: "State fun facts value required" });
  }

  // Ensure funfacts is an array
  if (!Array.isArray(req.body.funfacts)) {
    return res
      .status(400)
      .json({ message: "State fun facts value must be an array" });
  }

  try {
    // Update the state with the new fun facts using the $push operator to append new fun facts
    const result = await State.findOneAndUpdate(
      { stateCode },
      { $push: { funfacts: { $each: req.body.funfacts } } },
      { new: true, upsert: true } // upsert ensures that if the state doesn't exist, it is created
    );

    // Return a response with only the required properties
    res.status(201).json({
      _id: result._id,
      stateCode: result.stateCode,
      __v: result.__v,
      funfacts: result.funfacts,
    });
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: err.message });
  }
};

const updateFunFact = async (req, res) => {
  const stateCode = req.params.code.toUpperCase();
  const { index, funfact } = req.body;

  // Validate state code
  const stateData = allStates.find((state) => state.code === stateCode);
  if (!stateData) {
    return res
      .status(400)
      .json({ message: "Invalid state abbreviation parameter" });
  }

  // Validate presence of index
  if (index === undefined) {
    return res
      .status(400)
      .json({ message: "State fun fact index value required" });
  }

  // Validate presence and type of funfact
  if (!funfact || typeof funfact !== "string") {
    return res.status(400).json({ message: "State fun fact value required" });
  }

  try {
    const state = await State.findOne({ stateCode });

    // If no state document or no funfacts
    if (!state?.funfacts || !state.funfacts.length) {
      return res
        .status(404)
        .json({ message: `No Fun Facts found for ${stateData.state}` });
    }

    // Adjust 1-based index to 0-based
    const i = index - 1;

    // Check if index is valid
    if (i < 0 || i >= state.funfacts.length) {
      return res
        .status(404)
        .json({
          message: `No Fun Fact found at that index for ${stateData.state}`,
        });
    }

    // Update funfact at the given index
    state.funfacts[i] = funfact;

    // Save the updated state document
    const result = await state.save();

    // Return only the required properties
    res.json({
      _id: result._id,
      stateCode: result.stateCode,
      __v: result.__v,
      funfacts: result.funfacts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteFunFact = async (req, res) => {
  const stateCode = req.params.code.toUpperCase();
  const { index } = req.body;

  // Validate state code
  const stateData = allStates.find((state) => state.code === stateCode);
  if (!stateData) {
    return res
      .status(400)
      .json({ message: "Invalid state abbreviation parameter" });
  }

  // Validate presence of index
  if (index === undefined || index === null) {
    return res
      .status(400)
      .json({ message: "State fun fact index value required" });
  }

  try {
    // Fetch the state from MongoDB
    const state = await State.findOne({ stateCode });

    if (!state?.funfacts || !state.funfacts.length) {
      return res
        .status(404)
        .json({ message: `No Fun Facts found for ${stateData.state}` });
    }

    // Convert the provided 1-based index to 0-based index
    const i = index - 1;

    if (i < 0 || i >= state.funfacts.length) {
      return res
        .status(404)
        .json({
          message: `No Fun Fact found at that index for ${stateData.state}`,
        });
    }

    // Remove the fun fact at the given index
    state.funfacts.splice(i, 1);

    // Save the updated state document in MongoDB
    const result = await state.save();

    // Return the updated state with the four properties
    res.json({
      _id: result._id,
      stateCode: result.stateCode,
      __v: result.__v,
      funfacts: result.funfacts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getState = async (req, res) => {
  const stateCode = req?.params?.code?.toUpperCase();

  const stateData = allStates.find((state) => state.code === stateCode);
  if (!stateData) {
    return res
      .status(400)
      .json({ message: "Invalid state abbreviation parameter" });
  }

  // Add the fun facts to the response
  const mongoState = await State.findOne({ stateCode }).lean();
  if (mongoState && mongoState.funfacts) {
    stateData.funfacts = mongoState.funfacts;
  }

  res.json(stateData);
};

module.exports = {
  getAllStates,
  getRandomFunFact,
  getStateCapital,
  getStatePopulation,
  getStateNickname,
  getStateAdmission,
  addFunFacts,
  updateFunFact,
  deleteFunFact,
  getState,
};
