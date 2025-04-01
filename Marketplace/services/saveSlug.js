import axios from "axios";

export default async function SetSlug(walletId, slug) {
  try {
    console.log("Sending request to /api/slugstore:", { walletId, slug });

    const res = await axios.post("/api/slugstore", {
      walletId,
      slug,
    });

    console.log("Response received from API:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error calling API:", error.response?.data || error.message);
    return null;
  }
}
