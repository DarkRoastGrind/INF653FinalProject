const verifyStates = (allowedStates) => {
  return (req, res, next) => {
    // Ensure the request contains the required role data
    if (!req?.states) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No states data available" });
    }

    // Check if the user's states match the allowed states
    const result = req.states.some((role) => allowedStates.includes(role));

    if (!result) {
      console.log(
        `Unauthorized access attempt to ${req.path} by states: ${req.states}`
      );
      return res
        .status(401)
        .json({ message: "Unauthorized: State access not allowed" });
    }

    next();
  };
};

module.exports = verifyStates;
