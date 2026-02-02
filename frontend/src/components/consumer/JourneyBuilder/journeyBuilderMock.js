import { MOCK_CURATE_MY_LOOK_RESPONSE } from '../../../data/mockCurateMyLookResponse';

// Re-export the mock as the active payload.
// To wire in the real API, replace this with a fetch call that returns
// the same shape as MOCK_CURATE_MY_LOOK_RESPONSE.
export const CURATE_MY_LOOK_PAYLOAD = MOCK_CURATE_MY_LOOK_RESPONSE;
