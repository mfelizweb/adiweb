import { NextResponse } from "next/server";

export async function GET() {
  const json = {
    applinks: {
      apps: [],
      details: [
        {
          appID: "8T88595TPH.io.adondeir.com",
          paths: ["/place/*"]
        }
      ]
    }
  };

  return new NextResponse(JSON.stringify(json), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
