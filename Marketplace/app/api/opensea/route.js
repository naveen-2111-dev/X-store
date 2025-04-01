import axios from "axios";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return Response.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `https://testnets-api.opensea.io/api/v2/listings/collection/${encodeURIComponent(
        slug
      )}/all`
    );

    if (!response.data) {
      return Response.json(
        { error: "Fetch from OpenSea failed" },
        { status: 400 }
      );
    }

    return Response.json(
      { message: "success", data: response.data },
      { status: 200 }
    );
  } catch (error) {
    console.error("OpenSea API error:", error.message);
    return Response.json(
      { error: error.response?.data?.message || "Internal server error" },
      { status: error.response?.status || 500 }
    );
  }
}
