import { Server } from "https://deno.land/std@0.161.0/http/server.ts";

async function updateContainer() {
  console.log("Updating container");

  // Stop the container if it is already running
  let status = await Deno.run({
    cmd: ["docker", "compose", "--project-directory", "/compose", "pull"],
  }).status();
  if (!status.success) {
    console.error("Error running `docker compose pull`");
  }

  // Remove the old container if it exists
  status = await Deno.run({
    cmd: ["docker", "compose", "--project-directory", "/compose", "up", "-d"],
  }).status();
  if (!status.success) {
    console.error("Error running `docker compose up -d`");
  }
}

const handler = async (request: Request) => {
  const secret = await request.text();
  const response = new Response(null, { status: 200 });

  if (secret !== Deno.env.get("SECRET")) {
    console.log("Invalid request secret");
  } else {
    console.log("Valid request");
    updateContainer();
  }

  return response;
};

const port = parseInt(Deno.env.get("PORT") || "80");
const server = new Server({ handler, port });

console.log(`Server listening on port ${port}`);
server.listenAndServe();
