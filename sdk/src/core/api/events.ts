import { DownsampledApiReserveAssetDataEvent } from "../types";

export const fetchDownsampledApiReserveAssetDataEvents = async (
  reserveId: string,
  days: number,
  sampleIntervalS: number,
) => {
  const url = `https://api.suilend.fi/events/downsampled-reserve-asset-data?reserveId=${reserveId}&days=${days}&sampleIntervalS=${sampleIntervalS}`;
  const res = await fetch(url);
  const json = await res.json();

  return json as DownsampledApiReserveAssetDataEvent[];
};
