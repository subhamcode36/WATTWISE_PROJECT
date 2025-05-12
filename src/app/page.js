"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Typography, Button, Grid, TextField, Paper, CircularProgress } from "@mui/material";
import CustomNavbar from "./components/CustomNavbar";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

const Home = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const systemContext = `You are WattWise AI, an AI assistant for BITS Pilani Goa Campus's energy management system.
Key Information:
- WattWise is an energy monitoring and optimization platform for BITS Goa campus
- The platform provides real-time energy consumption data and insights
- BITS Goa is committed to sustainability and reducing its carbon footprint
- The campus has various buildings including academic blocks, laboratories, hostels, and administrative buildings
- WattWise helps track and optimize energy usage across all these facilities

Please provide helpful responses related to energy conservation, sustainability initiatives at BITS Goa, and how WattWise helps achieve these goals.`;

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    try {
      setIsLoading(true);
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      // Prepare chat history for context
      const chatContext = chatHistory.map(msg => 
        `${msg.role}: ${msg.content}`
      ).join("\n");

      const prompt = `${systemContext}\n\nChat History:\n${chatContext}\n\nUser: ${userInput}\n\nAssistant:`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const newMessage = { role: "user", content: userInput };
      const aiResponse = { role: "assistant", content: text };
      
      setChatHistory([...chatHistory, newMessage, aiResponse]);
      setUserInput("");
    } catch (error) {
      console.error("Error with chat:", error);
      setChatHistory([
        ...chatHistory,
        { role: "user", content: userInput },
        { role: "assistant", content: "I apologize, but I encountered an error. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#04080F] min-h-screen text-[#FFFFFF]">
      <CustomNavbar />
      <main className="container mx-auto px-4 py-8">
        <section className="mb-16">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                className="mb-4 text-[#507DBC] font-bold"
              >
                Welcome to WattWise
              </Typography>
              <Typography variant="h5" className="mb-6 text-[#B8DBD9]">
                Empowering BITS Goa to Save Energy and Build a Sustainable
                Future
              </Typography>
              <Link href="/dashboard">
                <Button
                  variant="contained"
                  className="bg-[#507DBC] hover:bg-[#3A5A8C] text-white px-6 py-3 rounded-full text-lg font-semibold transition duration-300"
                >
                  Explore Dashboard
                </Button>
              </Link>
            </Grid>
            <Grid item xs={12} md={6}>
              <Image
                src="/bdome.jpg"
                alt="Sustainable Energy"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </Grid>
          </Grid>
        </section>

        <section className="mb-16">
          <Typography variant="h3" className="mb-8 text-center text-[#507DBC]">
            Why Save Energy?
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: "Reduce Carbon Footprint",
                description:
                  "By saving energy, we can significantly reduce our carbon emissions and combat climate change.",
                image:
                  "/solar-panel.jpeg",
              },
              {
                title: "Lower Energy Costs",
                description:
                  "Efficient energy use leads to reduced electricity bills, saving money for our institution.",
                image:
                  "/Indian-currency.jpg",
              },
              {
                title: "Build a Sustainable Campus",
                description:
                  "Energy conservation helps create a more sustainable and eco-friendly learning environment.",
                image:
                  "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a",
              },
            ].map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <div className="bg-[#507DBC] bg-opacity-10 p-6 rounded-lg shadow-lg h-full flex flex-col items-center">
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg mb-4"
                    />
                  </div>
                  <Typography variant="h5" className="mb-2 text-[#B8DBD9]">
                    {item.title}
                  </Typography>
                  <Typography variant="body1" className="text-[#FFFFFF]">
                    {item.description}
                  </Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        </section>

        <section className="mb-16">
          <Typography variant="h3" className="mb-8 text-center text-[#507DBC]">
            How WattWise Helps
          </Typography>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f"
                alt="Energy Dashboard"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              {[
                "Real-time Energy Monitoring",
                "Data-driven Insights",
                "Community Engagement",
              ].map((item, index) => (
                <div key={index} className="mb-4">
                  <Typography variant="h5" className="mb-2 text-[#B8DBD9]">
                    {item}
                  </Typography>
                  <Typography variant="body1" className="text-[#FFFFFF]">
                    WattWise provides comprehensive tools and analytics to help
                    BITS Goa monitor, analyze, and optimize energy consumption
                    across the campus.
                  </Typography>
                </div>
              ))}
            </Grid>
          </Grid>
        </section>

        <section className="mb-16">
          <Typography variant="h3" className="mb-8 text-center text-[#507DBC]">
            Chat with WattWise AI
          </Typography>
          <Paper className="bg-[#507DBC] bg-opacity-10 p-6 rounded-lg shadow-lg">
            <div className="h-[400px] overflow-y-auto mb-4 p-4 bg-[#04080F] rounded-lg">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] markdown-wrapper ${
                      message.role === "user"
                        ? "bg-[#507DBC] text-white"
                        : "bg-[#B8DBD9] text-[#04080F]"
                    }`}
                  >
                    <ReactMarkdown 
                      components={{
                        p: ({node, children}) => <p className="mb-2 whitespace-pre-wrap">{children}</p>,
                        strong: ({node, children}) => <span className="font-bold">{children}</span>,
                        h3: ({node, children}) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                        ul: ({node, children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                        li: ({node, children}) => <li className="mb-1">{children}</li>
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-center">
                  <CircularProgress size={24} className="text-[#507DBC]" />
                </div>
              )}
            </div>

            <style jsx global>{`
              .markdown-wrapper {
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              .markdown-wrapper p {
                margin-bottom: 0.5rem;
              }
              .markdown-wrapper strong {
                font-weight: 600;
              }
              .markdown-wrapper ul {
                margin-left: 1rem;
                margin-bottom: 0.5rem;
              }
              .markdown-wrapper li {
                margin-bottom: 0.25rem;
              }
            `}</style>

            <div className="flex gap-2">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask about energy conservation at BITS Goa..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="bg-[#04080F] rounded-lg"
                sx={{
                  input: { color: "#FFFFFF" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#507DBC" },
                    "&:hover fieldset": { borderColor: "#B8DBD9" },
                    "&.Mui-focused fieldset": { borderColor: "#507DBC" },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-[#507DBC] hover:bg-[#3A5A8C] text-white px-6 py-3 rounded-lg text-lg font-semibold transition duration-300"
              >
                Send
              </Button>
            </div>
          </Paper>
        </section>

        <section>
          <div className="bg-[#507DBC] p-8 rounded-lg shadow-lg text-center">
            <Typography variant="h4" className="mb-4 text-[#FFFFFF]">
              Ready to Make a Difference?
            </Typography>
            <Typography variant="body1" className="mb-6 text-[#B8DBD9]">
              Join us in our mission to create a more sustainable BITS Goa.
              Every small action counts!
            </Typography>
          </div>
        </section>
      </main>

      <footer className="bg-[#04080F] text-[#FFFFFF] py-12 mt-16 border-t border-[#507DBC]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            <div className="space-y-4">
              <h6 className="text-2xl font-bold text-[#507DBC] mb-4">
                Contact Us
              </h6>
              <p className="flex items-center text-[#B8DBD9]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-[#507DBC]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                mkd@goa.bits-pilani.ac.in
              </p>
              <p className="flex items-center text-[#B8DBD9]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-[#507DBC]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                +91 942 239 0888
              </p>
            </div>
            <div>
              <h6 className="text-2xl font-bold text-[#507DBC] mb-4">
                Quick Links
              </h6>
              <ul className="space-y-2">
                {["Dashboard", "Login", "About Us"].map((item, index) => (
                  <li key={index}>
                    <Link
                      href={
                        item === "Dashboard"
                          ? "/dashboard"
                          : item === "Login"
                            ? "/api/auth/callback/google"
                            : "#"
                      }
                      className="text-[#B8DBD9] hover:text-[#FFFFFF] transition-colors duration-200 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* <div>
              <h6 className="text-2xl font-bold text-[#507DBC] mb-4">Stay Connected</h6>
              <p className="mb-4 text-[#B8DBD9]">Follow us on social media for the latest updates and energy-saving tips.</p>
              <div className="flex space-x-4">
                {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, index) => (
                  <a key={index} href="#" className="text-[#B8DBD9] hover:text-[#FFFFFF] transition-colors duration-200">
                    <Icon size={24} />
                  </a>
                ))}
              </div>
            </div> */}
          </div>
          <div className="border-t border-[#507DBC] mt-8 pt-8 text-center">
            <p className="text-[#B8DBD9]">
              © {new Date().getFullYear()} WattWise - BITS Goa. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;