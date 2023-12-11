import React, { createContext, useContext, useState } from "react";

const MedicalIdContext = createContext();

export const useMedicalId = () => {
  return useContext(MedicalIdContext);
};

const MedicalIdProvider = ({ children }) => {
  const [validMedicalId, setValidMedicalId] = useState("");

  const setMedicalId = (id) => {
    setValidMedicalId(id);
  };

  return (
    <MedicalIdContext.Provider value={{ validMedicalId, setMedicalId }}>
      {children}
    </MedicalIdContext.Provider>
  );
};

export default MedicalIdProvider;
