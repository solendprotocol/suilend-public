import * as LD from "@launchdarkly/node-server-sdk";

let ldClient: LD.LDClient | null = null;

async function initialize() {
  if (!process.env.LAUNCHDARKLY_SDK_KEY) {
    throw new Error("LaunchDarkly SDK key not found");
  }
  const client = LD.init(process.env.LAUNCHDARKLY_SDK_KEY);
  await client.waitForInitialization();
  return client;
}

export async function getClient() {
  if (ldClient) {
    return ldClient;
  }

  return (ldClient = await initialize());
}
