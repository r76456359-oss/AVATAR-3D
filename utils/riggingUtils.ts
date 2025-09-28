
import * as THREE from 'three';
import { PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';

const landmarkToVector3 = (lm: NormalizedLandmark) => {
    // MediaPipe's y-axis is inverted compared to Three.js
    return new THREE.Vector3(lm.x, 1 - lm.y, lm.z);
};

const rigRotation = (
    name: string,
    landmarks: NormalizedLandmark[],
    scene: THREE.Object3D,
    p1Idx: number,
    p2Idx: number,
    p3Idx: number,
    invert = false
) => {
    const bone = scene.getObjectByName(name);
    if (!bone) return;

    const p1 = landmarkToVector3(landmarks[p1Idx]);
    const p2 = landmarkToVector3(landmarks[p2Idx]);
    const p3 = landmarkToVector3(landmarks[p3Idx]);

    const v1 = p1.sub(p2);
    const v2 = p3.sub(p2);

    const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        v1.normalize()
    );

    const C = v1.clone().cross(v2).normalize();
    const B = v1.clone().cross(C).normalize();
    
    const angle = v2.angleTo(v1);
    
    const q = new THREE.Quaternion().setFromAxisAngle(
        B,
        invert ? -angle : angle
    );
    
    quaternion.multiply(q);
    bone.quaternion.slerp(quaternion, 0.6);
};


export const rigAvatar = (landmarksData: PoseLandmarkerResult, scene: THREE.Object3D) => {
    const landmarks = landmarksData.landmarks[0];
    if (!landmarks) return;

    // --- ARMS ---
    rigRotation('mixamorigRightArm', landmarks, scene, 11, 13, 15);
    rigRotation('mixamorigLeftArm', landmarks, scene, 12, 14, 16, true);
    rigRotation('mixamorigRightForeArm', landmarks, scene, 13, 15, 19);
    rigRotation('mixamorigLeftForeArm', landmarks, scene, 14, 16, 20, true);

    // --- LEGS ---
    rigRotation('mixamorigRightUpLeg', landmarks, scene, 23, 25, 27, true);
    rigRotation('mixamorigLeftUpLeg', landmarks, scene, 24, 26, 28);
    rigRotation('mixamorigRightLeg', landmarks, scene, 25, 27, 31, true);
    rigRotation('mixamorigLeftLeg', landmarks, scene, 26, 28, 32);

    // --- SPINE & HEAD ---
    const spine = scene.getObjectByName('mixamorigSpine');
    const neck = scene.getObjectByName('mixamorigNeck');
    if (spine && neck) {
        const shoulderLeft = landmarkToVector3(landmarks[11]);
        const shoulderRight = landmarkToVector3(landmarks[12]);
        const hipLeft = landmarkToVector3(landmarks[23]);
        const hipRight = landmarkToVector3(landmarks[24]);
        
        const shoulderCenter = new THREE.Vector3().addVectors(shoulderLeft, shoulderRight).multiplyScalar(0.5);
        const hipCenter = new THREE.Vector3().addVectors(hipLeft, hipRight).multiplyScalar(0.5);

        const spineDir = new THREE.Vector3().subVectors(shoulderCenter, hipCenter).normalize();
        
        const spineQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), spineDir);
        spine.quaternion.slerp(spineQuat, 0.6);

        const nose = landmarkToVector3(landmarks[0]);
        const headDir = new THREE.Vector3().subVectors(nose, shoulderCenter).normalize();
        const headQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), headDir);
        neck.quaternion.slerp(headQuat, 0.6);
    }
};
