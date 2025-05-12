import React, { useState, useEffect } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";

ChartJS.register(...registerables);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [billData, setBillData] = useState([]);
  const [quarterMetricData, setQuarterMetricData] = useState([]);
  const [monthMetricData, setMonthMetricData] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedQuarterAvgCharge, setSelectedQuarterAvgCharge] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/get_data");
      const data = response.data;

      setBillData(data.bill_data);
      setQuarterMetricData(data.quarter_metric_data);
      setMonthMetricData(data.month_metric_data);
      setLoading(false);
      console.log("Data successfully fetched: ", data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleQuarterChange = (event) => {
    const selectedQuarterId = event.target.value;
    const selectedQuarterData = quarterMetricData.find(
      (quarter) => quarter.Quarter_ID === selectedQuarterId
    );
    setSelectedQuarter(selectedQuarterId);
    setSelectedQuarterAvgCharge(
      selectedQuarterData ? selectedQuarterData.Avg_Charge : ""
    );
  };

  const topQuarters = quarterMetricData.slice(0, 10);

  const lineChartData1 = {
    labels: monthMetricData.map((item) => item.Month),
    datasets: [
      {
        label: "Total Charge",
        data: monthMetricData.map((item) => item.Total_Charge),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const generateHistogramData = () => {
    const minAvgCharge = 0;
    const maxAvgCharge = 10000;
    const binWidth = 500;

    const bins = Array.from(
      { length: Math.ceil((maxAvgCharge - minAvgCharge) / binWidth) + 1 },
      (_, i) => minAvgCharge + i * binWidth
    );

    const frequency = Array(bins.length - 1).fill(0);

    quarterMetricData.forEach((item) => {
      const binIndex = Math.floor((item.Avg_Charge - minAvgCharge) / binWidth);
      if (binIndex >= 0 && binIndex < frequency.length) {
        frequency[binIndex]++;
      }
    });

    const labels = bins.slice(0, -1).map((bin, index) => {
      const nextBin = bins[index + 1];
      return `${bin}-${nextBin}`;
    });

    return {
      labels,
      datasets: [
        {
          label: "Frequency",
          data: frequency,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  };

  const lineChartData2 = {
    labels: monthMetricData.map((item) => item.Month),
    datasets: [
      {
        label: "Elec Charge Perc",
        data: monthMetricData.map((item) => item.Elec_Charge_Perc),
        borderColor: "#FFA500",
        backgroundColor: "transparent",
        fill: false,
      },
      {
        label: "Energy Charge Perc",
        data: monthMetricData.map((item) => item.Energy_Charge_Perc),
        borderColor: "#3e95cd",
        backgroundColor: "transparent",
        fill: false,
      },
      {
        label: "Fixed Charge Perc",
        data: monthMetricData.map((item) => item.Fixed_Charge_Perc),
        borderColor: "#3cba9f",
        backgroundColor: "transparent",
        fill: false,
      },
      {
        label: "Meter Rent Perc",
        data: monthMetricData.map((item) => item.Meter_Rent_Perc),
        borderColor: "#c45850",
        backgroundColor: "transparent",
        fill: false,
      },
    ],
  };

  return (
    <div>
      <Container
        sx={{
          background: "#12486B",
          minWidth: "100%",
          minHeight: "100vh",
          paddingBottom: "20px",
        }}
      >
        <Typography
          variant="h3"
          sx={{ marginY: 0, paddingY: 3, color: "#F5FCCD" }}
        >
          LWE Analytics
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: 2, filter: "invert(1)" }}>
                <Typography variant="h6">
                  Month on Month Trend of Total Charge
                </Typography>
                <Line data={lineChartData1} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: 2, filter: "invert(1)" }}>
                <Typography variant="h6">
                  Quarter Distribution of Avg Charge
                </Typography>
                <Bar data={generateHistogramData()} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: 2, filter: "invert(1)" }}>
                <Typography variant="h6">%Split of Total Charge</Typography>
                <Line data={lineChartData2} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: 2, filter: "invert(1)" }}>
                <Typography variant="h6">
                  Top 10 Avg Monthly Charge Quarters
                </Typography>
                {topQuarters.map((quarter) => (
                  <Typography key={quarter.Quarter_ID} variant="body1">
                    {`Quarter ${
                      quarter.Quarter_ID
                    }: ${quarter.Avg_Charge.toFixed(0)} Rs`}
                  </Typography>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: 2, filter: "invert(1)" }}>
                <Typography variant="h6">Select Quarter</Typography>
                <Select
                  fullWidth
                  value={selectedQuarter}
                  onChange={handleQuarterChange}
                >
                  {quarterMetricData.map((quarter) => (
                    <MenuItem
                      key={quarter.Quarter_ID}
                      value={quarter.Quarter_ID}
                    >{`Quarter ${quarter.Quarter_ID}`}</MenuItem>
                  ))}
                </Select>
                {selectedQuarterAvgCharge && (
                  <Typography variant="body1" sx={{ marginTop: 1 }}>
                    Avg Monthly Charge: {selectedQuarterAvgCharge.toFixed(0)}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
      <footer
        style={{
          backgroundColor: "#419197",
          padding: "20px",
          color: "#F5FCCD",
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" align="center">
                Email: mkd@goa.bits-pilani.ac.in
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" align="center">
                Contact Number: +91 942 239 0888
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </footer>
    </div>
  );
};

export default Dashboard;
