import React from "react";
import {
  Box,
  Container,
  Typography,
} from "@mui/material";

import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function Contact() {
  const contactDetails = [
    {
      title: "Phone Number",
      value: "+19 (XXXXXXXXXX)",
      icon: <PhoneIcon />,
    },
    {
      title: "Email Address",
      value: "info@jobseeker.com",
      icon: <EmailIcon />,
    },
    {
      title: "Address",
      value:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque, dolor.",
      icon: <LocationOnIcon />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        py: {
          xs: 5,
          sm: 7,
          md: 8,
        },
        marginBottom:{
          xs: -8,
          sm: -25,
          md: -8,
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight={700}
          color="text.primary"
          sx={{
            mb: {
              xs: 2,
              sm: 2,
              md: 2,
            },
            fontSize: {
              xs: "2rem",
              sm: "2.5rem",
              md: "3rem",
            },
          }}
        >
          Contact Us
        </Typography>

        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-6">
            {contactDetails.map((contact) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection:"column"
                }}
              >
                <div className="grid md:grid-cols-1 gap-8 m-2">
                  <div className="bg-gray-50 p-8 rounded-2xl shadow-md hover:shadow-xl transition">
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        minWidth: 60,
                        minHeight: 60,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "primary.main",
                        color: "white",
                        mb: 2,
                      }}
                    >
                      {contact.icon}
                    </Box>
                    <h3 className="text-xl font-semibold mb-3">
                      {contact.title}
                    </h3>
                    <p className="text-gray-600">{contact.value}</p>
                  </div>
                </div>
              </Box>
            ))}
          </div>
        </section>
      </Container>
    </Box>
  );
}
