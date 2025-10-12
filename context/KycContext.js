import React, { createContext, useContext, useState } from 'react';

const KycContext = createContext();

export const KycProvider = ({ children }) => {
  const [kycData, setKycData] = useState({
    personalDetails: {},
    contactDetails: {},
    employmentDetails: {},
    accountInformation: {}
  });

  const updateKycData = (section, data) => {
    setKycData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const clearKycData = () => {
    setKycData({
      personalDetails: {},
      contactDetails: {},
      employmentDetails: {},
      accountInformation: {}
    });
  };

  return (
    <KycContext.Provider value={{ kycData, updateKycData, clearKycData }}>
      {children}
    </KycContext.Provider>
  );
};

export const useKyc = () => {
  const context = useContext(KycContext);
  if (!context) {
    throw new Error('useKyc must be used within a KycProvider');
  }
  return context;
};

