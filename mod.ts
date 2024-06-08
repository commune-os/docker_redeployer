import { Server } from "https://deno.land/std@0.161.0/http/server.ts";

const containerName = Deno.env.get("CONTAINER");
const containerImage = Deno.env.get("IMAGE");

async function updateContainer() {
  console.log("Updating container");

  // Stop the container if it is already running
  await Deno.run({ cmd: ["docker", "stop", containerName] }).status();

  // Remove the old container if it exists
  await Deno.run({ cmd: ["docker", "rm", containerName] }).status();

  // Pull the latest version of the container
  let status = await Deno.run({
    cmd: ["docker", "pull", containerImage],
  }).status();
  if (!status.success) {
    console.error("Error pulling docker container");
    return;
  }

  // Run the new container
  status = await Deno.run({
    cmd: [
      "docker",
      "pull",
      "-d",
      "--name",
      containerName,
      "-p",
      "65534:8943/udp",
      containerImage,
    ],
  }).status();
  if (!status.success) {
    console.error("Error running docker container");
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
