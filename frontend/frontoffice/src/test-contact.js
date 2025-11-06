// Test script for contact form API
import axios from "axios";

const testContactSubmission = async () => {
  const contactData = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    subject: "Test Subject",
    message:
      "This is a test message with more than 25 characters to meet the minimum requirement.",
  };

  try {
    const response = await axios.post(
      "http://localhost:8080/api/public/contact",
      contactData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    );

    console.log("Contact submission successful:", response.status);
    console.log("Response:", response.data);
  } catch (error) {
    console.error(
      "Contact submission failed:",
      error.response?.data || error.message,
    );
    console.error("Status:", error.response?.status);
  }
};

// Export for manual testing
export default testContactSubmission;
