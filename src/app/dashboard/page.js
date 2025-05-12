"use client"

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Box, Container, Typography, MenuItem, Select, Button, Switch, FormControlLabel, Pagination, CircularProgress, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, ReferenceLine, ReferenceArea } from 'recharts';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [data, setData] = useState([]);
  const [year, setYear] = useState('2023');
  const [month, setMonth] = useState('January');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPredictions, setShowPredictions] = useState(false);
  const [predictedData, setPredictedData] = useState([]);
  const [geminiInsights, setGeminiInsights] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [dataPage, setDataPage] = useState(1);
  const [totalDataPages, setTotalDataPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // 12 months per page
  const [paginatedData, setPaginatedData] = useState([]);
  const [dataSource, setDataSource] = useState('synthetic'); // 'api' or 'synthetic' or 'gemini'
  const [anomalyExplanations, setAnomalyExplanations] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (dataSource === 'api') {
          const response = await fetch('/api/getSheetsData');
          let result = await response.json();
          setData(result);
        } else if (dataSource === 'synthetic') {
          // Generate synthetic data
          setIsGeneratingData(true);
          const syntheticData = generateSyntheticData();
          setData(syntheticData);
          setIsGeneratingData(false);
        } else if (dataSource === 'gemini') {
          // Generate data using Gemini
          await generateDataWithGemini();
        }
      } catch (error) {
        console.error('Error fetching/generating data:', error);
        // Fallback to synthetic data
        setIsGeneratingData(true);
        const syntheticData = generateSyntheticData();
        setData(syntheticData);
        setIsGeneratingData(false);
      }
    };

    fetchData();
  }, [year, dataSource]); // Re-fetch when year or data source changes

  useEffect(() => {
    // Process data whenever it changes
    if (data.length > 0) {
      const processedData = processData(data).lineData;
      
      // Calculate total pages for pagination
      const filteredData = processedData.filter(item => item.date.includes(year));
      setTotalDataPages(Math.ceil(filteredData.length / itemsPerPage));
      
      // Set paginated data
      const startIndex = (dataPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedData(filteredData.slice(startIndex, endIndex));
      
      // Run anomaly detection
      const detectedAnomalies = detectAnomalies(processedData);
      setAnomalies(detectedAnomalies);
      
      // Generate insights
      if (processedData.length > 0) {
        analyzeDataWithGemini(processedData);
      }
    }
  }, [data, year, dataPage, itemsPerPage]);

  // Generate large volume of synthetic data
  const generateSyntheticData = () => {
    const syntheticData = [];
    const startYear = 2020;
    const endYear = 2025;
    
    // Add header rows
    syntheticData.push(["HTC 179", "Date", "HTC 232", "Total GED", "Solar Capex", "Solar Generation", "Solar Opex", 
                    "Total Consumption", "Solar %", "C2 kWh", "C2 Solar %", "Rs/kWh", "Savings from 1MWp Solar", 
                    "Savings from Capex", "Total Savings", "Savings", "HTC 179 Amount", "HTC 232 Amount", "Total Amount", "Price"]);
    syntheticData.push(["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
    syntheticData.push(["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
    syntheticData.push(["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
    
    // Generate daily data for each year (much more data)
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        // Generate data for each day of the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          // Base values with seasonal patterns
          const seasonalFactor = 1 + 0.3 * Math.sin((month / 12) * 2 * Math.PI);
          const yearGrowth = 1 + (year - startYear) * 0.1;
          const dayVariation = 1 + (Math.random() * 0.2 - 0.1); // Daily variation ±10%
          
          // Add some random anomalies (about 1% of data points)
          const isAnomaly = Math.random() < 0.01;
          const anomalyFactor = isAnomaly ? (Math.random() < 0.5 ? 0.4 : 2.5) : 1.0;
          
          // Add cyclical patterns (weekday vs weekend)
          const dayOfWeek = new Date(year, month, day).getDay();
          const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.8 : 1.1;
          
          const consumption = Math.round(5000 * seasonalFactor * yearGrowth * dayVariation * weekendFactor * anomalyFactor);
          const solarPercentage = Math.min(95, Math.round(20 * yearGrowth + Math.random() * 10));
          const solar = Math.round(consumption * (solarPercentage / 100));
          const price = Math.round(800 + year * 50 - startYear * 50 + Math.random() * 100);
          
          syntheticData.push([
            Math.round(200 * seasonalFactor * yearGrowth * dayVariation), // HTC 179
            date, // Date
            Math.round(300 * seasonalFactor * yearGrowth * dayVariation), // HTC 232
            Math.round(1000 * seasonalFactor * yearGrowth * dayVariation), // Total GED
            Math.round(500000 * yearGrowth), // Solar Capex
            solar, // Solar Generation
            Math.round(20000 * yearGrowth * dayVariation), // Solar Opex
            consumption, // Total Consumption
            solarPercentage, // Solar %
            Math.round(3000 * seasonalFactor * yearGrowth * dayVariation), // C2 kWh
            Math.min(90, Math.round(15 * yearGrowth + Math.random() * 10)), // C2 Solar %
            Math.round(10 * yearGrowth + Math.random() * 2), // Rs/kWh
            Math.round(50000 * seasonalFactor * yearGrowth * dayVariation), // Savings from 1MWp Solar
            Math.round(30000 * seasonalFactor * yearGrowth * dayVariation), // Savings from Capex
            Math.round(80000 * seasonalFactor * yearGrowth * dayVariation), // Total Savings
            Math.round(30000 * seasonalFactor * yearGrowth * dayVariation), // Savings
            Math.round(20000 * seasonalFactor * yearGrowth * dayVariation), // HTC 179 Amount
            Math.round(30000 * seasonalFactor * yearGrowth * dayVariation), // HTC 232 Amount
            Math.round(50000 * seasonalFactor * yearGrowth * dayVariation), // Total Amount
            price // Price
          ]);
        }
      }
    }
    
    return syntheticData;
  };

  // Generate data using Gemini
  const generateDataWithGemini = async () => {
    setIsGeneratingData(true);
    try {
      // Initialize Gemini API
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Prompt for Gemini to generate energy consumption data
      const prompt = `
        Generate a comprehensive energy consumption dataset for a large industrial facility from 2020 to 2025.
        
        The data should include:
        1. Daily consumption values (kWh) with seasonal patterns (higher in summer/winter)
        2. Solar generation that increases year over year (starting at ~20% of consumption)
        3. Price fluctuations that generally increase over time
        4. Occasional anomalies (unexpected spikes or drops)
        5. Weekend vs weekday patterns (less consumption on weekends)
        
        For each year (${year} specifically), generate 30 data points with the following format:
        [date, consumption, solar, solarPercentage, price, savings]
        
        Make the data realistic with:
        - Seasonal patterns (higher consumption in summer/winter)
        - Gradual increase in solar percentage over the years
        - Random but realistic price fluctuations
        - 2-3 clear anomalies that would be detectable
        - Weekend reductions in consumption
        
        Format the response as a JSON array of objects.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);
          
          // Convert to the format expected by our application
          const headerRows = [
            ["HTC 179", "Date", "HTC 232", "Total GED", "Solar Capex", "Solar Generation", "Solar Opex", 
            "Total Consumption", "Solar %", "C2 kWh", "C2 Solar %", "Rs/kWh", "Savings from 1MWp Solar", 
            "Savings from Capex", "Total Savings", "Savings", "HTC 179 Amount", "HTC 232 Amount", "Total Amount", "Price"],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
          ];
          
          const formattedData = jsonData.map(item => {
            const consumption = parseFloat(item.consumption) || 5000;
            const solar = parseFloat(item.solar) || 1000;
            const solarPercentage = parseFloat(item.solarPercentage) || 20;
            const price = parseFloat(item.price) || 800;
            const savings = parseFloat(item.savings) || 30000;
            
            return [
              Math.round(consumption * 0.04), // HTC 179
              item.date, // Date
              Math.round(consumption * 0.06), // HTC 232
              Math.round(consumption * 0.2), // Total GED
              500000, // Solar Capex
              solar, // Solar Generation
              20000, // Solar Opex
              consumption, // Total Consumption
              solarPercentage, // Solar %
              Math.round(consumption * 0.6), // C2 kWh
              Math.round(solarPercentage * 0.75), // C2 Solar %
              Math.round(price / 100), // Rs/kWh
              Math.round(savings * 1.6), // Savings from 1MWp Solar
              Math.round(savings), // Savings from Capex
              Math.round(savings * 2.6), // Total Savings
              savings, // Savings
              Math.round(savings * 0.6), // HTC 179 Amount
              Math.round(savings * 1), // HTC 232 Amount
              Math.round(savings * 1.6), // Total Amount
              price // Price
            ];
          });
          
          setData([...headerRows, ...formattedData]);
        } else {
          throw new Error("Could not extract JSON from Gemini response");
        }
      } catch (jsonError) {
        console.error("Error parsing Gemini data:", jsonError);
        // Fallback to synthetic data
        const syntheticData = generateSyntheticData();
        setData(syntheticData);
      }
    } catch (error) {
      console.error("Error generating data with Gemini:", error);
      // Fallback to synthetic data
      const syntheticData = generateSyntheticData();
      setData(syntheticData);
    } finally {
      setIsGeneratingData(false);
    }
  };

  // Enhanced anomaly detection with multiple methods
  const detectAnomalies = (data) => {
    const anomalies = [];
    const explanations = {};
    const metrics = ['consumption', 'solar', 'solarPercentage', 'savings', 'price'];
    
    metrics.forEach(metric => {
      const values = data.map(item => item[metric]).filter(v => !isNaN(v));
      
      if (values.length < 5) return; // Need enough data points
      
      // Method 1: Z-score (standard deviations from mean)
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      );
      
      // Method 2: IQR (Interquartile Range)
      const sortedValues = [...values].sort((a, b) => a - b);
      const q1Index = Math.floor(sortedValues.length * 0.25);
      const q3Index = Math.floor(sortedValues.length * 0.75);
      const q1 = sortedValues[q1Index];
      const q3 = sortedValues[q3Index];
      const iqr = q3 - q1;
      const iqrLowerBound = q1 - 1.5 * iqr;
      const iqrUpperBound = q3 + 1.5 * iqr;
      
      // Method 3: Moving average deviation
      const windowSize = Math.min(5, Math.floor(values.length / 3));
      const movingAvgs = [];
      
      for (let i = windowSize; i < values.length; i++) {
        const windowValues = values.slice(i - windowSize, i);
        const windowAvg = windowValues.reduce((sum, val) => sum + val, 0) / windowSize;
        movingAvgs.push(windowAvg);
      }
      
      // Find anomalies using all methods
      data.forEach((item, index) => {
        const value = item[metric];
        if (isNaN(value)) return;
        
        // Z-score method (threshold = 3)
        const zScore = Math.abs((value - mean) / stdDev);
        const isZScoreAnomaly = zScore > 3;
        
        // IQR method
        const isIQRAnomaly = value < iqrLowerBound || value > iqrUpperBound;
        
        // Moving average method (if we have enough data)
        let isMAAnomaly = false;
        if (index >= windowSize) {
          const maIndex = index - windowSize;
          if (maIndex < movingAvgs.length) {
            const movingAvg = movingAvgs[maIndex];
            const deviation = Math.abs((value - movingAvg) / movingAvg);
            isMAAnomaly = deviation > 0.3; // 30% deviation from moving average
          }
        }
        
        // If detected by at least 2 methods, consider it an anomaly
        if ((isZScoreAnomaly && isIQRAnomaly) || 
            (isZScoreAnomaly && isMAAnomaly) || 
            (isIQRAnomaly && isMAAnomaly)) {
          
          // Generate explanation for this anomaly
          let explanation = '';
          if (value > mean + 2 * stdDev) {
            explanation = `Unusually high ${metric} value (${value.toFixed(2)}) detected on ${item.date}. This is ${(zScore).toFixed(2)} standard deviations above the mean.`;
          } else if (value < mean - 2 * stdDev) {
            explanation = `Unusually low ${metric} value (${value.toFixed(2)}) detected on ${item.date}. This is ${(zScore).toFixed(2)} standard deviations below the mean.`;
          }
          
          // Add context based on the metric
          if (metric === 'consumption') {
            explanation += value > mean ? ' This could indicate equipment malfunction, unusual activity, or a data recording error.' : 
              ' This could indicate reduced facility usage, power outage, or a data recording error.';
          } else if (metric === 'solar') {
            explanation += value > mean ? ' This could indicate exceptionally good weather conditions or recent system optimization.' : 
              ' This could indicate cloudy weather, panel malfunction, or maintenance issues.';
          } else if (metric === 'price') {
            explanation += value > mean ? ' This price spike could be due to peak demand charges or utility rate changes.' : 
              ' This price drop could be due to off-peak rates or utility incentives.';
          }
          
          // Store explanation by date and metric
          if (!explanations[item.date]) {
            explanations[item.date] = {};
          }
          explanations[item.date][metric] = explanation;
          
          anomalies.push({
            date: item.date,
            metric,
            value,
            mean,
            stdDev,
            zScore,
            iqrLowerBound,
            iqrUpperBound,
            isZScoreAnomaly,
            isIQRAnomaly,
            isMAAnomaly,
            confidence: (isZScoreAnomaly + isIQRAnomaly + isMAAnomaly) / 3, // 0.33, 0.67, or 1.0
            explanation
          });
        }
      });
    });
    
    setAnomalyExplanations(explanations);

    // Use Gemini to analyze anomalies if we have any
    if (anomalies.length > 0) {
      analyzeAnomaliesWithGemini(anomalies, data);
    }
    
    return anomalies;
  };

  // New function to analyze anomalies with Gemini
  const analyzeAnomaliesWithGemini = async (anomalies, data) => {
    try {
      // Initialize Gemini API
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Prepare data for analysis - limit to 10 anomalies to avoid token limits
      const anomaliesToAnalyze = anomalies.slice(0, 10);
      
      // Create context about the data
      const dataContext = {
        timeRange: `${data[0]?.date} to ${data[data.length-1]?.date}`,
        metrics: {
          consumption: {
            mean: data.reduce((sum, item) => sum + item.consumption, 0) / data.length,
            max: Math.max(...data.map(item => item.consumption)),
            min: Math.min(...data.map(item => item.consumption))
          },
          solar: {
            mean: data.reduce((sum, item) => sum + item.solar, 0) / data.length,
            max: Math.max(...data.map(item => item.solar)),
            min: Math.min(...data.map(item => item.solar))
          },
          price: {
            mean: data.reduce((sum, item) => sum + item.price, 0) / data.length,
            max: Math.max(...data.map(item => item.price)),
            min: Math.min(...data.map(item => item.price))
          }
        }
      };
      
      // Format anomalies for Gemini
      const anomalyDescriptions = anomaliesToAnalyze.map(a => 
        `Date: ${a.date}, Metric: ${a.metric}, Value: ${a.value.toFixed(2)}, Mean: ${a.mean.toFixed(2)}, Z-score: ${a.zScore.toFixed(2)}`
      ).join("\n");
      
      // Prompt for Gemini
      const prompt = `
        You are an expert energy data analyst. I need you to analyze these anomalies in our energy consumption data and provide detailed explanations.
        
        Data context:
        - Time range: ${dataContext.timeRange}
        - Consumption: mean=${dataContext.metrics.consumption.mean.toFixed(2)}, min=${dataContext.metrics.consumption.min.toFixed(2)}, max=${dataContext.metrics.consumption.max.toFixed(2)}
        - Solar generation: mean=${dataContext.metrics.solar.mean.toFixed(2)}, min=${dataContext.metrics.solar.min.toFixed(2)}, max=${dataContext.metrics.solar.max.toFixed(2)}
        - Price: mean=${dataContext.metrics.price.mean.toFixed(2)}, min=${dataContext.metrics.price.min.toFixed(2)}, max=${dataContext.metrics.price.max.toFixed(2)}
        
        Detected anomalies:
        ${anomalyDescriptions}
        
        For each anomaly, please provide:
        1. A detailed explanation of what might have caused this anomaly
        2. The potential impact on energy efficiency and costs
        3. Recommended actions to address similar anomalies in the future
        4. A confidence score (1-5) for your explanation
        
        Format your response as a JSON object with the following structure:
        {
          "anomalies": [
            {
              "date": "YYYY-MM-DD",
              "metric": "metric_name",
              "explanation": "detailed explanation",
              "impact": "impact description",
              "recommendations": "recommended actions",
              "confidence": number
            },
            ...
          ]
        }
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[0]);
          
          // Update anomalies with Gemini's analysis
          const updatedAnomalies = anomalies.map(anomaly => {
            const geminiAnalysis = analysisData.anomalies.find(
              a => a.date === anomaly.date && a.metric === anomaly.metric
            );
            
            if (geminiAnalysis) {
              return {
                ...anomaly,
                aiExplanation: geminiAnalysis.explanation,
                impact: geminiAnalysis.impact,
                recommendations: geminiAnalysis.recommendations,
                aiConfidence: geminiAnalysis.confidence
              };
            }
            
            return anomaly;
          });
          
          // Update anomalies state with enhanced data
          setAnomalies(updatedAnomalies);
          
          // Update explanations
          const updatedExplanations = { ...explanations };
          analysisData.anomalies.forEach(a => {
            if (!updatedExplanations[a.date]) {
              updatedExplanations[a.date] = {};
            }
            if (!updatedExplanations[a.date][a.metric]) {
              updatedExplanations[a.date][a.metric] = '';
            }
            updatedExplanations[a.date][a.metric] += `\n\nAI Analysis: ${a.explanation}\nImpact: ${a.impact}\nRecommendations: ${a.recommendations}`;
          });
          
          setAnomalyExplanations(updatedExplanations);
        }
      } catch (jsonError) {
        console.error("Error parsing Gemini anomaly analysis:", jsonError);
      }
    } catch (error) {
      console.error("Error analyzing anomalies with Gemini:", error);
    }
  };

  // Analyze data with Gemini for anomaly detection and insights
  const analyzeDataWithGemini = async (data) => {
    setIsAnalyzing(true);
    try {
      // Initialize Gemini API
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_API_KEY");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      
      // Prepare data for analysis - send a sample to avoid token limits
      const dataLength = data.length;
      const sampleSize = Math.min(50, dataLength); // Max 50 data points to avoid token limits
      const samplingInterval = Math.max(1, Math.floor(dataLength / sampleSize));
      
      const sampledData = [];
      for (let i = 0; i < dataLength; i += samplingInterval) {
        sampledData.push(data[i]);
      }
      
      // Format anomalies for Gemini
      const anomalyText = anomalies.length > 0 
        ? "Anomalies detected: " + anomalies.slice(0, 10).map(a => 
            `${a.date}: ${a.metric} (value: ${a.value}, confidence: ${(a.confidence * 100).toFixed(0)}%, explanation: ${a.explanation})`
          ).join("; ") + (anomalies.length > 10 ? ` and ${anomalies.length - 10} more...` : "")
        : "No significant anomalies detected in the data.";
      
      // Prompt for Gemini
      const prompt = `
        Analyze this energy consumption data and provide insights. Focus on trends, patterns, and anomalies.
        
        Data summary: 
        - Time period: ${data[0]?.date} to ${data[data.length-1]?.date}
        - Data points: ${data.length}
        - Average consumption: ${(data.reduce((sum, item) => sum + item.consumption, 0) / data.length).toFixed(2)} kWh
        - Average solar percentage: ${(data.reduce((sum, item) => sum + item.solarPercentage, 0) / data.length).toFixed(2)}%
        - Total savings: ${data.reduce((sum, item) => sum + item.savings, 0).toFixed(2)} Rs
        
        ${anomalyText}
        
        Please provide:
        1. Key insights about consumption patterns (seasonal trends, growth rates)
        2. Analysis of solar utilization trends and optimization opportunities
        3. Financial analysis (savings, ROI, cost efficiency)
        4. Detailed explanation of anomalies with possible causes
        5. Specific recommendations for energy optimization
        
        Format your response with markdown headings and bullet points for easy reading.
        Make sure to include a main heading "## Energy Consumption Data Analysis (${year})" at the top.
        For each anomaly, highlight it clearly in your analysis.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setGeminiInsights(text);
    } catch (error) {
      console.error("Error analyzing data with Gemini:", error);
      setGeminiInsights("Unable to analyze data at this time. Please try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleYearChange = (event) => {
    setYear(event.target.value);
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePredictionToggle = (event) => {
    setShowPredictions(event.target.checked);
    if (event.target.checked && paginatedData.length > 0) {
      fetchPredictions(paginatedData);
    }
  };

  const fetchPredictions = async (historicalData) => {
    const addRandomVariation = (value) => {
      const variation = (Math.random() * 2 - 1) * 0.01; // Random variation between -1% and +1%
      return value * (1 + variation);
    };

    const predictNextValues = (values, months = 6) => {
      if (values.length < 2) return [];
      
      // Get the last few months pattern to repeat
      const patternLength = Math.min(values.length, 12); // Use up to 12 months pattern
      const pattern = values.slice(-patternLength);
      
      const lastDate = new Date(historicalData[historicalData.length - 1].date);
      
      return Array.from({ length: months }, (_, i) => {
        const nextDate = new Date(lastDate);
        nextDate.setMonth(lastDate.getMonth() + i + 1);
        
        // Use pattern value with small random variation
        const patternValue = pattern[i % pattern.length];
        const predictedValue = addRandomVariation(patternValue);
        
        return {
          value: Math.max(0, predictedValue), // Ensure non-negative
          date: nextDate.toISOString().slice(0, 10)
        };
      });
    };

    const generatePredictions = (historicalData) => {
      const metrics = [
        'consumption', 'solar', 'otherSources', 'savings', 'solarPercentage', 
        'totalSavings', 'htc179', 'htc232', 'totalGED', 'solarCapex', 
        'solarOpex', 'c2kWh', 'c2SolarPercentage', 'rsPerKWh', 
        'savingsFrom1MWpSolar', 'savingsFromCapex', 'price',
        'htc179Amount', 'htc232Amount', 'totalAmount'
      ];

      // Get predictions for each metric
      const predictions = {};
      metrics.forEach(metric => {
        const values = historicalData.map(d => d[metric]).filter(v => !isNaN(v));
        predictions[metric] = predictNextValues(values, 6);
      });

      // Combine predictions into data points
      return predictions.consumption.map((_, index) => {
        const dataPoint = { date: predictions.consumption[index].date };
        metrics.forEach(metric => {
          dataPoint[metric] = predictions[metric][index]?.value ?? 0;
        });
        return dataPoint;
      });
    };

    const predictions = generatePredictions(historicalData);
    setPredictedData(predictions);
  };

  const processData = (data) => {
    const filteredData = data.slice(4);

    const lineData = filteredData.filter(row => row[1] && row[1].includes(year)).map(row => ({
      date: row[1],
      consumption: parseFloat(row[7]),
      solar: parseFloat(row[5]),
      otherSources: parseFloat(row[7]) - parseFloat(row[5]),
      savings: parseFloat(row[15]),
      price: parseFloat(row[19]),
      solarPercentage: parseFloat(row[8]),
      totalSavings: parseFloat(row[14]),
      htc179: parseFloat(row[0]),
      htc232: parseFloat(row[2]),
      totalGED: parseFloat(row[3]),
      solarCapex: parseFloat(row[4]),
      solarOpex: parseFloat(row[6]),
      c2kWh: parseFloat(row[9]),
      c2SolarPercentage: parseFloat(row[10]),
      rsPerKWh: parseFloat(row[11]),
      savingsFrom1MWpSolar: parseFloat(row[12]),
      savingsFromCapex: parseFloat(row[13]),
      htc179Amount: parseFloat(row[16]),
      htc232Amount: parseFloat(row[17]),
      totalAmount: parseFloat(row[18])
    }));

    const pieData = lineData.filter(row => row.date.includes(month)).map(row => ({
      name: 'Solar',
      value: row.solar
    })).concat(lineData.filter(row => row.date.includes(month)).map(row => ({
      name: 'Other Sources',
      value: row.otherSources
    })));

    return { lineData, pieData };
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    signIn('google');
    return null;
  }

  const COLORS = ['#0088FE', '#FFBB28'];

  return (
    <Container sx={{ color: 'white', backgroundColor: 'black', padding: '20px', borderRadius: '10px' }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: 'white',
          textAlign: 'center',
          marginBottom: '40px',
          padding: '20px',
          background: 'linear-gradient(45deg, #82ca9d, #0069ff)',
          borderRadius: '10px',
          transition: 'background 0.3s, color 0.3s',
          '&:hover': {
            background: 'linear-gradient(45deg,#75917f, #719fe1)',
            color: 'black',
          },
        }}
      >
        Energy Consumption Dashboard
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Select value={year} onChange={handleYearChange} sx={{ color: 'white', backgroundColor: 'black' }}>
          <MenuItem value="2020">2020</MenuItem>
          <MenuItem value="2021">2021</MenuItem>
          <MenuItem value="2022">2022</MenuItem>
          <MenuItem value="2023">2023</MenuItem>
          <MenuItem value="2024">2024</MenuItem>
          <MenuItem value="2025">2025</MenuItem>
        </Select>
        
        <Select 
          value={dataSource} 
          onChange={(e) => setDataSource(e.target.value)} 
          sx={{ color: 'white', backgroundColor: 'black' }}
        >
          <MenuItem value="synthetic">Synthetic Data</MenuItem>
          <MenuItem value="gemini">Gemini-Generated Data</MenuItem>
          <MenuItem value="api">API Data</MenuItem>
        </Select>
        
        <FormControlLabel
          control={
            <Switch
              checked={showPredictions}
              onChange={handlePredictionToggle}
              color="primary"
            />
          }
          label="Show Predictions"
          sx={{ color: 'white' }}
        />
        
        <Button 
          variant="contained" 
          onClick={() => {
            if (dataSource === 'gemini') {
              generateDataWithGemini();
            } else if (dataSource === 'synthetic') {
              setIsGeneratingData(true);
              const syntheticData = generateSyntheticData();
              setData(syntheticData);
              setIsGeneratingData(false);
            }
          }}
          disabled={isGeneratingData}
          sx={{ ml: 2 }}
        >
          {isGeneratingData ? 'Generating...' : 'Regenerate Data'}
        </Button>
      </Box>

      {isGeneratingData && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2, color: 'white' }}>
            Generating large dataset...
          </Typography>
        </Box>
      )}

      {/* Anomaly Alert */}
      {anomalies.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2, backgroundColor: 'rgba(237, 108, 2, 0.2)', color: 'white' }}>
          <Typography variant="body1">
            <strong>{anomalies.length} anomalies detected</strong> in the data. See AI insights for details.
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ mt: 1, color: 'white', borderColor: 'white' }}
            onClick={() => analyzeAnomaliesWithGemini(anomalies, paginatedData.length > 0 ? paginatedData : processData(data).lineData)}
          >
            Analyze Anomalies with AI
          </Button>
        </Alert>
      )}

      {/* Gemini Insights Panel */}
      <Box sx={{ mb: 4, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          AI Insights {isAnalyzing && '(Analyzing...)'}
        </Typography>
        {isAnalyzing ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} sx={{ mr: 2 }} />
            <Typography>Analyzing data with AI...</Typography>
          </Box>
        ) : (
          <Box sx={{ 
            color: 'white', 
            '& h2': { color: '#82ca9d', marginBottom: '16px', borderBottom: '1px solid #82ca9d', paddingBottom: '8px' },
            '& h3': { color: '#0088FE', marginTop: '16px', marginBottom: '8px' },
            '& ul': { marginLeft: '20px' },
            '& li': { marginBottom: '4px' },
            '& p': { marginBottom: '12px' },
            '& strong': { color: '#FFBB28' },
            '& .anomaly': { color: '#ff4d4d', fontWeight: 'bold' },
            '& .explanation': { color: '#ffa64d', fontStyle: 'italic', marginLeft: '16px', display: 'block', marginBottom: '8px' }
          }}>
            
            
            {/* Display anomaly explanations */}
            {anomalies.length > 0 && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
                <Typography variant="h6" sx={{ color: '#ff4d4d', mb: 2 }}>
                  Detected Anomalies
                </Typography>
                {anomalies.map((anomaly, index) => (
                  <Box key={`anomaly-detail-${index}`} sx={{ mb: 2 }}>
                    <Typography className="anomaly">
                      {anomaly.date}: {anomaly.metric} value of {anomaly.value.toFixed(2)}
                    </Typography>
                    <Typography className="explanation">
                      {anomaly.explanation}
                    </Typography>
                    {anomaly.aiExplanation && (
                      <Box sx={{ mt: 1, ml: 2, p: 1, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                        <Typography sx={{ color: '#82ca9d', fontWeight: 'bold' }}>
                          AI Analysis (Confidence: {anomaly.aiConfidence}/5)
                        </Typography>
                        <Typography sx={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
                          {anomaly.aiExplanation}
                        </Typography>
                        {anomaly.impact && (
                          <Typography sx={{ color: '#ff9800', fontSize: '0.9rem', mt: 1 }}>
                            <strong>Impact:</strong> {anomaly.impact}
                          </Typography>
                        )}
                        {anomaly.recommendations && (
                          <Typography sx={{ color: '#2196f3', fontSize: '0.9rem', mt: 1 }}>
                            <strong>Recommendations:</strong> {anomaly.recommendations}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
        <Button 
          variant="contained" 
          onClick={() => analyzeDataWithGemini(paginatedData.length > 0 ? paginatedData : processData(data).lineData)} 
          disabled={isAnalyzing || data.length === 0}
          sx={{ mt: 2 }}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Data'}
        </Button>
      </Box>

      {/* Data Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Pagination 
          count={totalDataPages} 
          page={dataPage} 
          onChange={(e, page) => setDataPage(page)} 
          color="primary" 
          sx={{ '& .MuiPaginationItem-root': { color: 'white' } }}
        />
        <Select 
          value={itemsPerPage} 
          onChange={(e) => setItemsPerPage(Number(e.target.value))} 
          sx={{ ml: 2, color: 'white', backgroundColor: 'black' }}
        >
          <MenuItem value={12}>12 per page</MenuItem>
          <MenuItem value={30}>30 per page</MenuItem>
          <MenuItem value={60}>60 per page</MenuItem>
          <MenuItem value={90}>90 per page</MenuItem>
        </Select>
      </Box>

      {currentPage === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>Total Consumption (kWh)</Typography>
              <LineChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="consumption" stroke="#8884d8" name="Actual Consumption" />
                {/* Highlight anomalies */}
                {anomalies
                  .filter(a => a.metric === 'consumption')
                  .filter(a => paginatedData.some(d => d.date === a.date))
                  .map((anomaly, index) => (
                    <ReferenceLine 
                      key={`anomaly-consumption-${index}`}
                      x={anomaly.date} 
                      stroke="red" 
                      strokeDasharray="3 3"
                      label={{ value: "!", position: 'top', fill: 'red' }}
                    />
                  ))
                }
                {showPredictions && predictedData.length > 0 && (
                  <Line 
                    type="monotone" 
                    data={predictedData} 
                    dataKey="consumption" 
                    stroke="#ff4081" 
                    strokeDasharray="5 5" 
                    name="Predicted Consumption"
                  />
                )}
              </LineChart>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>Solar Generation (kWh)</Typography>
              <LineChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="solar" stroke="#82ca9d" name="Actual Solar" />
                {/* Highlight anomalies */}
                {anomalies
                  .filter(a => a.metric === 'solar')
                  .filter(a => paginatedData.some(d => d.date === a.date))
                  .map((anomaly, index) => (
                    <ReferenceLine 
                      key={`anomaly-solar-${index}`}
                      x={anomaly.date} 
                      stroke="red" 
                      strokeDasharray="3 3"
                      label={{ value: "!", position: 'top', fill: 'red' }}
                    />
                  ))
                }
                {showPredictions && predictedData.length > 0 && (
                  <Line 
                    type="monotone" 
                    data={predictedData} 
                    dataKey="solar" 
                    stroke="#ff4081" 
                    strokeDasharray="5 5" 
                    name="Predicted Solar"
                  />
                )}
              </LineChart>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>Non-solar sources (kWh)</Typography>
              <LineChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="otherSources" stroke="#ff7300" name="Other Sources" />
                {showPredictions && predictedData.length > 0 && (
                  <Line 
                    type="monotone" 
                    data={predictedData} 
                    dataKey="otherSources" 
                    stroke="#ff4081" 
                    strokeDasharray="5 5" 
                    name="Predicted Other Sources"
                  />
                )}
              </LineChart>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>Total Savings from Capex (Rs)</Typography>
              <LineChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="savings" stroke="#82ca9d" name="Actual Savings" />
                {showPredictions && predictedData.length > 0 && (
                  <Line 
                    type="monotone" 
                    data={predictedData} 
                    dataKey="savings" 
                    stroke="#ff4081" 
                    strokeDasharray="5 5" 
                    name="Predicted Savings"
                  />
                )}
              </LineChart>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>Total Solar (kWh)</Typography>
              <AreaChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="solarPercentage" stroke="#82ca9d" fill="#82ca9d" name="Actual Solar %" />
                {showPredictions && predictedData.length > 0 && (
                  <Area 
                    type="monotone" 
                    data={predictedData} 
                    dataKey="solarPercentage" 
                    stroke="#ff4081" 
                    fill="#ff408133" 
                    strokeDasharray="5 5" 
                    name="Predicted Solar %"
                  />
                )}
              </AreaChart>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>Total Savings from Solar (Rs)</Typography>
              <LineChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalSavings" stroke="#ff7300" name="Actual Savings" />
                {showPredictions && predictedData.length > 0 && (
                  <Line 
                    type="monotone" 
                    data={predictedData} 
                    dataKey="totalSavings" 
                    stroke="#ff4081" 
                    strokeDasharray="5 5" 
                    name="Predicted Savings"
                  />
                )}
              </LineChart>
            </Box>
          </Box>
        </>
      )}
      {currentPage === 2 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>HTC 179 and HTC 232</Typography>
              <BarChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Bar dataKey="htc179" fill="#8884d8" name="HTC 179 Actual" />
                <Bar dataKey="htc232" fill="#82ca9d" name="HTC 232 Actual" />
                {showPredictions && predictedData.length > 0 && (
                  <>
                    <Bar dataKey="htc179" data={predictedData} fill="#ff4081" name="HTC 179 Predicted" fillOpacity={0.5} />
                    <Bar dataKey="htc232" data={predictedData} fill="#ff8cb1" name="HTC 232 Predicted" fillOpacity={0.5} />
                  </>
                )}
              </BarChart>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>Total GED</Typography>
              <LineChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalGED" stroke="#ff7300" name="Actual GED" />
                {showPredictions && predictedData.length > 0 && (
                  <Line 
                    type="monotone" 
                    data={predictedData} 
                    dataKey="totalGED" 
                    stroke="#ff4081" 
                    strokeDasharray="5 5" 
                    name="Predicted GED"
                  />
                )}
              </LineChart>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>Solar Capex and Opex</Typography>
              <BarChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Bar dataKey="solarCapex" fill="#8884d8" name="Solar Capex Actual" />
                <Bar dataKey="solarOpex" fill="#82ca9d" name="Solar Opex Actual" />
                {showPredictions && predictedData.length > 0 && (
                  <>
                    <Bar dataKey="solarCapex" data={predictedData} fill="#ff4081" name="Solar Capex Predicted" fillOpacity={0.5} />
                    <Bar dataKey="solarOpex" data={predictedData} fill="#ff8cb1" name="Solar Opex Predicted" fillOpacity={0.5} />
                  </>
                )}
              </BarChart>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>C2 kWh and Solar Percentage of C2</Typography>
              <LineChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="c2kWh" stroke="#ff7300" name="C2 kWh Actual" />
                <Line type="monotone" dataKey="c2SolarPercentage" stroke="#82ca9d" name="Solar % Actual" />
                {showPredictions && predictedData.length > 0 && (
                  <>
                    <Line 
                      type="monotone" 
                      data={predictedData} 
                      dataKey="c2kWh" 
                      stroke="#ff4081" 
                      strokeDasharray="5 5" 
                      name="C2 kWh Predicted"
                    />
                    <Line 
                      type="monotone" 
                      data={predictedData} 
                      dataKey="c2SolarPercentage" 
                      stroke="#ff8cb1" 
                      strokeDasharray="5 5" 
                      name="Solar % Predicted"
                    />
                  </>
                )}
              </LineChart>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>Rs/kWh</Typography>
              <LineChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rsPerKWh" stroke="#ff7300" name="Actual Rs/kWh" />
                {showPredictions && predictedData.length > 0 && (
                  <Line 
                    type="monotone" 
                    data={predictedData} 
                    dataKey="rsPerKWh" 
                    stroke="#ff4081" 
                    strokeDasharray="5 5" 
                    name="Predicted Rs/kWh"
                  />
                )}
              </LineChart>
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>Savings from 1 MWp Solar and Capex</Typography>
              <BarChart width={600} height={300} data={paginatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="white" />
                <YAxis stroke="white" />
                <Tooltip />
                <Legend />
                <Bar dataKey="savingsFrom1MWpSolar" fill="#8884d8" name="1 MWp Solar Actual" />
                <Bar dataKey="savingsFromCapex" fill="#82ca9d" name="Capex Actual" />
                {showPredictions && predictedData.length > 0 && (
                  <>
                    <Bar dataKey="savingsFrom1MWpSolar" data={predictedData} fill="#ff4081" name="1 MWp Solar Predicted" fillOpacity={0.5} />
                    <Bar dataKey="savingsFromCapex" data={predictedData} fill="#ff8cb1" name="Capex Predicted" fillOpacity={0.5} />
                  </>
                )}
              </BarChart>
            </Box>
          </Box>
        </>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button variant="contained" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
          Page 1
        </Button>
        <Button variant="contained" onClick={() => handlePageChange(2)} disabled={currentPage === 2} sx={{ ml: 2 }}>
          Page 2
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;