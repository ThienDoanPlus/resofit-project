import { Keypoint } from "@tensorflow-models/pose-detection";

export type RepState = "up" | "down" | "neutral";

export interface RepResult {
  newState: RepState;
  repCompleted: boolean;
  feedback: string;
}

export type RepCounterFunction = (
  keypoints: Keypoint[],
  currentState: RepState
) => RepResult;

function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const AB = { x: a.x - b.x, y: a.y - b.y };
  const CB = { x: c.x - b.x, y: c.y - b.y };
  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.sqrt(AB.x ** 2 + AB.y ** 2);
  const magCB = Math.sqrt(CB.x ** 2 + CB.y ** 2);
  const cosine = dot / (magAB * magCB);
  const angle = Math.acos(Math.min(Math.max(cosine, -1), 1));
  return (angle * 180) / Math.PI;
}

function isValidKeypoint(k: Keypoint | undefined): k is Keypoint {
  return !!k && typeof k.score === "number" && k.score > 0.5;
}

// =======================================================
// PUSH-UP COUNTER
// =======================================================
const pushUpsCounter: RepCounterFunction = (keypoints, currentState) => {
  const lShoulder = keypoints.find((k) => k.name === "left_shoulder");
  const rShoulder = keypoints.find((k) => k.name === "right_shoulder");
  const lElbow = keypoints.find((k) => k.name === "left_elbow");
  const rElbow = keypoints.find((k) => k.name === "right_elbow");
  const lWrist = keypoints.find((k) => k.name === "left_wrist");
  const rWrist = keypoints.find((k) => k.name === "right_wrist");

  if (
    !isValidKeypoint(lShoulder) ||
    !isValidKeypoint(rShoulder) ||
    !isValidKeypoint(lElbow) ||
    !isValidKeypoint(rElbow) ||
    !isValidKeypoint(lWrist) ||
    !isValidKeypoint(rWrist)
  ) {
    return {
      newState: currentState,
      repCompleted: false,
      feedback: "Không thấy rõ tay, hãy điều chỉnh góc quay.",
    };
  }

  const leftAngle = calculateAngle(lShoulder, lElbow, lWrist);
  const rightAngle = calculateAngle(rShoulder, rElbow, rWrist);
  const avgAngle = (leftAngle + rightAngle) / 2;

  const isDown = avgAngle < 90;
  const isUp = avgAngle > 160;

  if (currentState === "up" && isDown) {
    return {
      newState: "down",
      repCompleted: false,
      feedback: "Tốt! Hạ người xuống!",
    };
  } else if (currentState === "down" && isUp) {
    return {
      newState: "up",
      repCompleted: true,
      feedback: "Tốt! Đẩy lên nào!",
    };
  }

  return {
    newState: currentState,
    repCompleted: false,
    feedback: currentState === "up" ? "Hạ người xuống" : "Đẩy người lên",
  };
};

// =======================================================
// SQUAT COUNTER
// =======================================================
const squatsCounter: RepCounterFunction = (keypoints, currentState) => {
  const lHip = keypoints.find((k) => k.name === "left_hip");
  const rHip = keypoints.find((k) => k.name === "right_hip");
  const lKnee = keypoints.find((k) => k.name === "left_knee");
  const rKnee = keypoints.find((k) => k.name === "right_knee");
  const lAnkle = keypoints.find((k) => k.name === "left_ankle");
  const rAnkle = keypoints.find((k) => k.name === "right_ankle");

  if (
    !isValidKeypoint(lHip) ||
    !isValidKeypoint(rHip) ||
    !isValidKeypoint(lKnee) ||
    !isValidKeypoint(rKnee) ||
    !isValidKeypoint(lAnkle) ||
    !isValidKeypoint(rAnkle)
  ) {
    return {
      newState: currentState,
      repCompleted: false,
      feedback: "Không thấy rõ chân, hãy giữ khoảng cách phù hợp.",
    };
  }

  const leftAngle = calculateAngle(lHip, lKnee, lAnkle);
  const rightAngle = calculateAngle(rHip, rKnee, rAnkle);
  const avgAngle = (leftAngle + rightAngle) / 2;

  const isDown = avgAngle < 90;
  const isUp = avgAngle > 160;

  if (currentState === "up" && isDown) {
    return {
      newState: "down",
      repCompleted: false,
      feedback: "Tốt! Hạ người xuống!",
    };
  } else if (currentState === "down" && isUp) {
    return {
      newState: "up",
      repCompleted: true,
      feedback: "Tốt! Đứng thẳng nào!",
    };
  }

  return {
    newState: currentState,
    repCompleted: false,
    feedback: currentState === "up" ? "Hạ người xuống" : "Đứng lên",
  };
};

// =======================================================
// EXPORT
// =======================================================
export const repCounters: { [key: string]: RepCounterFunction } = {
  pushUpsCounter,
  squatsCounter,
};
