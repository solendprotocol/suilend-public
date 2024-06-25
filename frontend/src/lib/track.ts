import mixpanel from "mixpanel-browser";

const track = (
  eventName: string,
  properties?: Record<string, string | number>,
) => {
  const projectToken = process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN;
  if (!projectToken) return;

  try {
    setTimeout(() => {
      mixpanel.track(eventName, properties);
    }, 250);
  } catch (err) {
    console.error(err);
  }
};

export default track;
