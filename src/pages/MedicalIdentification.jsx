import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import { useMedicalId } from "../Components/MedicalIdProvider";

const MedicalIdVerification = () => {
  const [medicalId, setMedicalId] = useState("");
  const [error, setError] = useState("");
  const { setMedicalId: setValidMedicalId } = useMedicalId();
  const navigate = useNavigate();
  const isMedicalIdValid = (id) => {
    return id === "2023-11-29308";
  };


  const handleContinue = () => {
    if (isMedicalIdValid(medicalId)) {
      setValidMedicalId(medicalId);
      navigate("/chat");
    } else {
      setError("Invalid Medical ID. Please try again.");
    }
  };

  return (
    <div className="flex flex-col py-20 bg-blue-100 items-center min-h-screen">
      <div className="py-6 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 text-center text-4xl ">
        PAMOJA PAN-AFRICA AI PATHWAY
      </div>
      <p className="text-xl text-gray-600 text-center font-[600]">
        Discuss about your health with our <br />
        <span className="underline">EHR Physician!</span>
      </p>
      <div className="py-32 w-96">
        <div className="mb-4">
          <label
            htmlFor="medicalId"
            className="block text-sm font-medium text-gray-600"
          >
            Medical Identification Number
          </label>
          <input
            type="text"
            id="medicalId"
            placeholder="012345"
            name="medicalId"
            value={medicalId}
            onChange={(e) => setMedicalId(e.target.value)}
            className="mt-1 focus:outline-none focus:ring-2 p-3 w-full border rounded-full"
            required
          />
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-6">
          <button
            onClick={handleContinue}
            className="w-full group duration-200 ease-in flex items-center gap-3 justify-center text-[18px] font-[500] rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 text-white py-3"
          >
            Continue
            <HiArrowRight
              size={20}
              className="group-hover:translate-x-1 ease-in duration-300"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalIdVerification;
