import React, { useState, useEffect, useCallback } from 'react';

const PermaEnergieCalculator = () => {
  const [inputs, setInputs] = useState({
    repaymentRate: 10,
    initialCapital: 10,
    investment: 5000,
    farmerSurface: 50,
    bambooProd: 30,
    bambooPrice: 150,
    simulationDuration: 15,
    carbonPrice: 40,
    permaEnergieCommission: 5,
    fundRecapitalizationRate: 20
  });

  const [results, setResults] = useState({
    deforestationReduction: 0,
    carbonEmissionReduction: 0,
    irrigatedSurfacePercentage: 0,
    jobsCreated: 0,
    totalCultivatedSurface: 0,
    annualCarbonSequestration: 0,
    annualGlobalGDP: 0,
    finalFundValue: 0,
    permaEnergieAnnualRevenue: 0,
    permaEnergieFinalBalance: 0
  });

  const [chronologicalData, setChronologicalData] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const formatNumber = (num, isPercentage = false) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' M';
    }
    if (num < 1000) {
      return num.toFixed(2) + (isPercentage ? '%' : '');
    }
    return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (isPercentage ? '%' : '');
  };

  const calculateImpact = useCallback(() => {
    let fundBalance = inputs.initialCapital * 1000000;
    let totalFarmers = 0;
    let totalCultivatedSurface = 0;
    let permaEnergieNetCashFlow = 0;
    const chronologicalData = [];
    const farmerGroups = [];

    for (let year = 1; year <= inputs.simulationDuration; year++) {
      const yearData = { year, fundBalanceStart: fundBalance };

      // Finance new farmers
      const newFarmers = Math.floor(fundBalance / (inputs.investment * inputs.farmerSurface));
      totalFarmers += newFarmers;
      totalCultivatedSurface += newFarmers * inputs.farmerSurface;
      fundBalance -= newFarmers * inputs.investment * inputs.farmerSurface;

      farmerGroups.push({ 
        startYear: year, 
        farmers: newFarmers, 
        loanRemaining: newFarmers * inputs.investment * inputs.farmerSurface 
      });

      let totalRepayments = 0;
      let totalBambooRevenue = 0;
      let totalCarbonRevenue = 0;

      farmerGroups.forEach(group => {
        const groupAge = year - group.startYear;
        
        // Carbon credits (year after financing)
        if (groupAge === 1) {
          const carbonRevenue = group.farmers * inputs.farmerSurface * inputs.bambooProd * 1.74 * inputs.carbonPrice * 4;
          totalCarbonRevenue += carbonRevenue;
          
          const repayment = Math.min(carbonRevenue * inputs.repaymentRate / 100, group.loanRemaining);
          totalRepayments += repayment;
          group.loanRemaining -= repayment;
        }

        // Bamboo production (starts 5 years after financing)
        if (groupAge >= 5) {
          const bambooRevenue = group.farmers * inputs.farmerSurface * inputs.bambooProd * inputs.bambooPrice;
          totalBambooRevenue += bambooRevenue;
          
          const repayment = Math.min(bambooRevenue * inputs.repaymentRate / 100, group.loanRemaining);
          totalRepayments += repayment;
          group.loanRemaining -= repayment;
        }
      });

      const totalRevenue = totalBambooRevenue + totalCarbonRevenue;
      const recapitalization = totalRevenue * inputs.fundRecapitalizationRate / 100;
      fundBalance += totalRepayments + recapitalization;

      const permaEnergieYearlyRevenue = totalRevenue * inputs.permaEnergieCommission / 100;
      permaEnergieNetCashFlow += permaEnergieYearlyRevenue;

      yearData.fundBalanceEnd = fundBalance;
      yearData.newFarmers = newFarmers;
      yearData.totalFarmers = totalFarmers;
      yearData.totalRepayments = totalRepayments;
      yearData.bambooRevenue = totalBambooRevenue;
      yearData.carbonRevenue = totalCarbonRevenue;
      yearData.permaEnergieNetCashFlow = permaEnergieYearlyRevenue;

      chronologicalData.push(yearData);
    }

    setChronologicalData(chronologicalData);

    // Calculate final results
    const deforestationReduction = (totalCultivatedSurface * 5) / 4000000 * 100;
    const carbonEmissionReduction = (totalCultivatedSurface * inputs.bambooProd * 1.74) / 16000000 * 100;
    const irrigatedSurfacePercentage = totalCultivatedSurface / 9000000 * 100;
    const jobsCreated = Math.floor(totalCultivatedSurface * 0.13);
    const annualCarbonSequestration = totalCultivatedSurface * inputs.bambooProd * 1.74;
    const annualGlobalGDP = totalCultivatedSurface * inputs.bambooProd * (inputs.bambooPrice + 1.74 * inputs.carbonPrice);
    const finalFundValue = fundBalance + farmerGroups.reduce((sum, group) => sum + group.loanRemaining, 0);
    const permaEnergieAnnualRevenue = totalCultivatedSurface * inputs.bambooProd * 
      (inputs.permaEnergieCommission / 100 + inputs.fundRecapitalizationRate / 100) * 
      (inputs.bambooPrice + 1.74 * inputs.carbonPrice);

    setResults({
      deforestationReduction,
      carbonEmissionReduction,
      irrigatedSurfacePercentage,
      jobsCreated,
      totalCultivatedSurface,
      annualCarbonSequestration,
      annualGlobalGDP,
      finalFundValue,
      permaEnergieAnnualRevenue,
      permaEnergieFinalBalance: permaEnergieNetCashFlow + finalFundValue
    });
  }, [inputs]);

  useEffect(() => {
    calculateImpact();
  }, [calculateImpact]);

  const inputOptions = {
    repaymentRate: [5, 10, 15, 20, 25, 30, 35, 40, 45],
    initialCapital: [1, 5, 10, 50, 100],
    investment: [5000, 10000, 15000],
    farmerSurface: [50, 100, 150],
    bambooProd: [30, 50, 80],
    bambooPrice: Array.from({ length: 10 }, (_, i) => (i + 1) * 50),
    simulationDuration: [15, 25, 35],
    carbonPrice: Array.from({ length: 12 }, (_, i) => (i + 1) * 20),
    permaEnergieCommission: [5, 10, 15, 20],
    fundRecapitalizationRate: [5, 10, 15, 20, 25]
  };

  const sectionStyle = {
    marginBottom: '40px',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9'
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Calculateur d'Impact Perma Energie</h1>

      <div style={sectionStyle}>
        <h2>Variables d'entrée</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {Object.entries(inputs).map(([key, value]) => (
            <div key={key}>
              <label htmlFor={key}>{key}: </label>
              <select id={key} name={key} value={value} onChange={handleInputChange}>
                {inputOptions[key].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <h2>Impact Global de Perma Énergie</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {Object.entries(results).map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {formatNumber(value, ['deforestationReduction', 'carbonEmissionReduction', 'irrigatedSurfacePercentage'].includes(key))}
            </div>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <h2>Tableau Chronologique</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Année</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Solde du fonds (début)</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Solde du fonds (fin)</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Nouveaux agriculteurs</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Total agriculteurs</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Remboursements</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Revenus bambou</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Revenus carbone</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Flux de trésorerie Perma Energie</th>
              </tr>
            </thead>
            <tbody>
              {chronologicalData.map((year, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{year.year}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatNumber(year.fundBalanceStart)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatNumber(year.fundBalanceEnd)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{year.newFarmers}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{year.totalFarmers}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatNumber(year.totalRepayments)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatNumber(year.bambooRevenue)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatNumber(year.carbonRevenue)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatNumber(year.permaEnergieNetCashFlow)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermaEnergieCalculator;